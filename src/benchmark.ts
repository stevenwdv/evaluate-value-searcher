#!npx ts-node

import ValueSearcher, {transformers} from 'value-searcher';

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

if (process.argv.length !== 6) throw new Error(`call with endWithNonReversibleLayer, noStackTrace, needle & haystack; args:\n${process.argv.join('\n')}`);
const [, , endWithNonRevStr, noStackTraceStr, needle, haystack] = process.argv as [string, string, string, string, string, string];
// console.log(needle)

// Prevent unnecessary work computing stack traces
if (!!noStackTraceStr && !['0', 'false'].includes(noStackTraceStr.toLowerCase())) Error.prepareStackTrace = () => undefined;

void (async () => {
	const searcher = new ValueSearcher([
		...['md5', 'sha1', 'sha256', 'sha512'].map(alg => new HashTransform(alg)),
		new HashTransform('sha256', undefined, undefined, Buffer.from('QX4QkKEU')),

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
	]);
	await searcher.addValue(Buffer.from(needle), 3, undefined, !!endWithNonRevStr && !['0', 'false'].includes(endWithNonRevStr.toLowerCase()));
	const res = await searcher.findValueIn(Buffer.from(haystack), 3);
	console.log(res ? 'FOUND' : 'MISSED');
	const start = Date.now();
	let i       = 0;
	for (; Date.now() - start < 4e3 || i < 5; ++i)
		await searcher.findValueIn(Buffer.from(haystack), 3);
	const end = Date.now();
	console.log((end - start) / i);
})();
