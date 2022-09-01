export type Leaks = Leak[];

export interface Leak {
	final_url: string;

	search: string;

	leak_type: LeakType;
	/** Base64-encoded Python {@link import('./leakTypes').RequestData} object */
	request: string;
	request_url: string;
	encoding: string;

	//...
}

export type LeakType =
	  | 'cookie_leaks'
	  | 'url_leaks'
	  | 'post_leaks'
	  | 'referrer_leaks'
	  | 'response_cookie_leaks'
	  | 'response_location_leaks';
