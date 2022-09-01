import {Readable, Writable} from 'node:stream';

export function notFalsy<T>(v: T | null | undefined | 0 | false | ''): v is T {
	return !!v;
}

export function raceWithCondition<T>(
	  promises: Iterable<T | PromiseLike<T>>,
	  condition: (val: T) => boolean | PromiseLike<boolean>,
): Promise<T | undefined> {
	return new Promise((resolve, reject) =>
		  void Promise.allSettled([...promises].map(async p => {
			  // Calling resolve/reject multiple times does not do anything
			  try {
				  const res = await p;
				  if (await condition(res)) resolve(res);
			  } catch (err) {
				  reject(err);
			  }
		  })).then(() => resolve(undefined)));
}

export type ObjectStream<Stream extends Readable | Writable, ObjType> =
	  Omit<Stream, 'read' | 'write' | 'end' | typeof Symbol.asyncIterator>
	  & (Stream extends Readable
	  ? {
		  read(): ObjType, push(obj: ObjType): boolean;
		  [Symbol.asyncIterator](): AsyncIterableIterator<ObjType>;
	  } : unknown)
	  & (Stream extends Writable
	  ? {
		  write(obj: ObjType, callback?: (error: Error | null | undefined) => void): boolean;
		  end(obj: ObjType, callback?: () => void): Stream;
		  end(callback?: () => void): Stream;
	  } : unknown);
