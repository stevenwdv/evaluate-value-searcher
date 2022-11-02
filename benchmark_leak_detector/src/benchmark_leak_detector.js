///<reference path="./configureModules.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/lzstring.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/custom_map.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/md2.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/md4.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/md5.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/base64.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/sha1.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/sha256.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/sha512.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/sha_salted.js"/>
///<reference path="../leak-inspector/background_scripts/leak_detector/leak_detector.js"/>
///<reference path="./fix_leak_detector.js"/>

if (process.argv.length !== 4) throw new Error('call with needle & haystack');
const [, , needle, haystack] = process.argv;

const leakDetector = new LeakDetector(
	  [needle],
	  true,
	  ['md5', 'sha1', 'sha256', 'sha512', 'sha_salted_1'],
	  3,
	  true,
	  ['base64', 'urlencode', 'lzstring', 'custom_map_1', 'zlib', 'deflate', 'gzip'],
	  3,
	  false,
);

const res = leakDetector.check_post_data(haystack, 3, true);
console.log([...res].length ? 'FOUND' : 'MISSED');
const start = Date.now();
let i       = 0;
for (; i < 200; ++i)
	leakDetector.check_post_data(haystack, 3, true);
const end = Date.now();
console.log((end - start) / i);
