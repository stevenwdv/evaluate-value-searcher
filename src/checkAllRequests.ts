#!npx ts-node

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {PassThrough, Readable} from 'node:stream';
import consumers from 'node:stream/consumers';
import {pipeline} from 'node:stream/promises';

import {asyncFilter, asyncFlatMap, asyncToArray, execPipe, filter, notNil} from 'iter-tools-es';
import lz4 from 'lz4';
import sanitizeFilename from 'sanitize-filename';
import tar from 'tar';
import ValueSearcher, {transformers} from 'value-searcher';

import {Leak} from './leakTypes';
import {CollectResult, RequestData} from './collectTypes';
import {ObjectStream} from './utils';
import {FindEntry, getKnownLeaks, mapLeakType} from './common';

const {
	      Base64Transform,
	      CustomStringMapTransform,
	      CompressionTransform,
	      FormDataTransform,
	      HashTransform,
	      HexTransform,
	      HtmlEntitiesTransform,
	      JsonStringTransform,
	      LZStringTransform,
	      UriTransform,
      } = transformers;

async function main() {
	const [jsonsFile] = process.argv.slice(2);
	if (!jsonsFile) {
		console.error('Pass jsons.tar.lz4 file as the first argument');
		process.exitCode = 2;
		return;
	}

	const leaks      = await getKnownLeaks();
	const leaksByUrl = leaks
		  .reduce((map, leak) => {
					if (!map.get(leak.final_url)?.push(leak))
						map.set(leak.final_url, [leak]);
					return map;
				},
				new Map<string, Leak[]>());

	const [, emailPrefix, emailSuffix] =
		        [...(leaksByUrl.values().next().value as Leak[])[0]!.search
				      .match(/([^+]+)\+[^@]+@(.+)/)!] as [string, string, string];

	const outputDir = `./out/${Date.now()} checkAllRequests/`;

	const maxDropSearchCharsEnd          = 2;
	const searchPoorlyDelimitedSubstring = false;

	const encodeLayers = 1;
	const encoders     = [
		new UriTransform(),
		new Base64Transform(new Set([Base64Transform.paddedDialect, Base64Transform.nonPaddedDialect])),
		new HexTransform(),
		...['md5', 'sha1', 'sha256', 'sha512'].map(alg => new HashTransform(alg)),
		new HashTransform('sha256', undefined, undefined, Buffer.from('QX4QkKEU')),
	];

	const decodeLayers = 3;
	const decoders     = [
		new Base64Transform(),
		new HexTransform(),
		new UriTransform(),
		new CustomStringMapTransform(Object.fromEntries(
			  'kibp8A4EWRMKHa7gvyz1dOPt6UI5xYD3nqhVwZBXfCcFeJmrLN20lS9QGsjTuo'.split('')
					.map((from, i) => [from, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[i]!]))),
		new JsonStringTransform(),
		new HtmlEntitiesTransform(),
		new FormDataTransform(),

		new LZStringTransform(),
		new CompressionTransform(new Set(['gzip', 'deflate', 'deflate-raw'])),
	];

	const entries: ObjectStream<PassThrough, tar.ReadEntry> = new PassThrough({objectMode: true});

	const decodePipe = pipeline(
		  fs.createReadStream(jsonsFile),
		  lz4.createDecoderStream(),
		  new tar.Parse({
			  filter: path => path.endsWith('.json'),
		  })
				.on('entry', entry => entries.push(entry))
				.on('close', () => entries.end()));

	await fsp.mkdir(outputDir, {recursive: true});
	console.info(`See ${outputDir} for missed leaks and extra leaks`);

	let missedLeaks = 0, extraLeaks = 0;
	let nEntry = 0;
	for await (const entry of entries) {
		const collectResult = await consumers.json(Readable.from(entry)) as CollectResult;
		const urlLeaks      = leaksByUrl.get(collectResult.finalUrl);

		const searchValue = Buffer.from(emailFor(collectResult, emailPrefix, emailSuffix));
		const searcher    = new ValueSearcher();
		await Promise.all(Array(maxDropSearchCharsEnd + 1).fill(null)
			  .filter((_, i) => i < searchValue.length)
			  .map((_, i) =>
					searcher.addValue(searchValue.subarray(0, searchValue.length - i), encodeLayers, encoders,
						  !searchPoorlyDelimitedSubstring)));

		const foundLeaks = await execPipe(
			  collectResult.data.requests ?? [],
			  filter((req: RequestData) => !req.url.startsWith('blob:')),
			  asyncFlatMap(req => [
				  searcher.findValueIn(Buffer.from(req.url), decodeLayers, decoders)
						.then(encodings => encodings && {
							url: req.url,
							part: 'url',
							encodings,
						} as FindEntry),
				  ...Object.values(req.requestHeaders ?? {})
						.map(v => searcher.findValueIn(Buffer.from(v), decodeLayers, decoders)
							  .then(encodings => encodings && {
								  url: req.url,
								  part: 'header',
								  encodings,
							  })),
				  req.postData ? searcher.findValueIn(Buffer.from(req.postData), decodeLayers, decoders)
						.then(encodings => encodings && {
							url: req.url,
							part: 'body',
							encodings,
						} as const) : null,
			  ]),
			  asyncFilter(notNil),
			  asyncToArray,
		);

		const thisLeaksMissed = (urlLeaks ?? []).filter(leak =>
			  !foundLeaks.some(foundLeak =>
					foundLeak.url === leak.request_url
					&& foundLeak.part === mapLeakType(leak.leak_type)));
		const thisLeaksExtra  = foundLeaks.filter(foundLeak =>
			  !(urlLeaks ?? []).some(leak =>
					foundLeak.url === leak.request_url
					&& foundLeak.part === mapLeakType(leak.leak_type)));
		if (thisLeaksMissed.length || thisLeaksExtra.length) {
			missedLeaks += thisLeaksMissed.length;
			extraLeaks += thisLeaksExtra.length;
			const url      = new URL(collectResult.finalUrl);
			const fileName = path.join(outputDir, `${Date.now()} ${sanitizeFilename(
				  url.hostname + (url.pathname !== '/' ? ` ${url.pathname.substring(1)}` : ''),
				  {replacement: '_'},
			)}.json`);
			await fsp.writeFile(fileName, JSON.stringify({
				'.finalUrl': collectResult.finalUrl,
				'.missed': !!thisLeaksMissed.length,
				'.extra': !!thisLeaksExtra.length,
				missed: thisLeaksMissed,
				extra: thisLeaksExtra,
				found: foundLeaks,
				expected: urlLeaks,
			}, undefined, '\t'));
		}
		console.debug(`checked ${++nEntry}`);
	}
	await decodePipe;

	console.info(`DONE; missed ${missedLeaks} leaks, found ${extraLeaks} extra leaks`);
}

function emailFor(res: CollectResult, emailPrefix: string, emailSuffix: string) {
	let domain = new URL(res.initialUrl).hostname;
	if (domain.startsWith('www.')) domain = domain.substring(4);
	return `${emailPrefix}+${domain}@${emailSuffix}`;
}

void main().catch(console.error);
