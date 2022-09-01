#!npx ts-node

import assert from 'assert';
import fsp from 'node:fs/promises';
import path from 'node:path';

import sanitizeFilename from 'sanitize-filename';
import ValueSearcher, {transformers} from 'value-searcher';
import {RequestData} from './collectTypes';
import {notFalsy, raceWithCondition} from './utils';
import {getKnownLeaks, mapLeakType} from './common';

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

async function checkKnownLeaks() {
	const outputDir = `./out/${Date.now()} checkKnownLeaks/`;

	const searchPoorlyDelimitedSubstring = true;

	const encodeLayers = 1;
	const encoders     = [
		new UriTransform(),
		new Base64Transform(new Set([Base64Transform.nonPaddedDialect])),
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

	const leaks = await getKnownLeaks();

	await fsp.mkdir(outputDir, {recursive: true});
	console.info(`See ${outputDir} for missed leaks`);

	let foundLeaks = 0;

	//@ts-expect-error used for Python deserialization
	globalThis.None = null;
	for (const leak of leaks) {
		const searcher = new ValueSearcher();
		await searcher.addValue(Buffer.from(leak.search), encodeLayers, encoders, !searchPoorlyDelimitedSubstring);

		assert(leak.request.startsWith('{') && leak.request.endsWith('}'));  // Sanity check
		// Ugly but functional way to deserialize known-safe Python objects
		const request = eval(`(${leak.request})`) as RequestData;

		let foundLeak;
		switch (mapLeakType(leak.leak_type)) {
			case 'url':
				foundLeak = await searcher.findValueIn(Buffer.from(request.url), decodeLayers, decoders);
				break;
			case 'header':
				foundLeak = await raceWithCondition(Object.values(request.requestHeaders ?? {})
							.map(v => searcher.findValueIn(Buffer.from(v), decodeLayers, decoders)),
					  notFalsy);
				break;
			case 'body':
				foundLeak = request.postData &&
					  await searcher.findValueIn(Buffer.from(request.postData), decodeLayers, decoders);
				break;
		}

		if (foundLeak) ++foundLeaks;
		else {
			const url      = new URL(leak.final_url);
			const fileName = path.join(outputDir, `${Date.now()} ${sanitizeFilename(
				  url.hostname + (url.pathname !== '/' ? ` ${url.pathname.substring(1)}` : ''),
				  {replacement: '_'},
			)}.json`);
			await fsp.writeFile(fileName, JSON.stringify(leak, undefined, '\t'));
		}
	}

	console.info(`DONE; found ${foundLeaks}/${leaks.length} leaks`);
}

void checkKnownLeaks().catch(console.error);
