import consumers from 'node:stream/consumers';
import fs from 'node:fs';
import zlib from 'node:zlib';

// noinspection ES6UnusedImports
import {transformers} from 'value-searcher';

import {Leaks, LeakType} from './leakTypes';

import ValueTransformer = transformers.ValueTransformer;

export async function getKnownLeaks() {
	return await consumers.json(
		  fs.createReadStream('leaks.json.gz')
				.pipe(zlib.createUnzip())) as Leaks;
}

export const mapLeakType = (leakType: LeakType): FindEntry['part'] | null => ({
	cookie_leaks: 'header',
	url_leaks: 'url',
	post_leaks: 'body',
	referrer_leaks: 'header',
	response_cookie_leaks: null,
	response_location_leaks: null,
} as const)[leakType];

export interface FindEntry {
	url: string,
	part: 'url' | 'header' | 'body';
	encodings: ValueTransformer[];
}
