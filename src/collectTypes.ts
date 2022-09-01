export interface CollectResult {
	/**
	 * URL from which the crawler began the crawl (as provided by the caller)
	 */
	initialUrl: string;
	/**
	 * URL after page has loaded (can be different from initialUrl if e.g. there was a redirect)
	 */
	finalUrl: string;
	/**
	 * true if page didn't fully load before the timeout and loading had to be stopped by the crawler
	 */
	timeout: boolean;
	/**
	 * time when the crawl started (unix timestamp)
	 */
	testStarted: number;
	/**
	 * time when the crawl finished (unix timestamp)
	 */
	testFinished: number;
	/**
	 * object containing output from all collectors
	 */
	data: CollectorData;
}

export interface CollectorData {
	cookies?: CookieData[] | undefined;
	requests?: RequestData[] | undefined;
	targets?: TargetData[] | undefined;
	//...
}

export interface CookieData {
	name: string;
	domain: string;
	path: string;
	expires?: number | undefined;
	session: boolean;
	sameSite?: ('Strict' | 'Lax' | 'Extended' | 'None') | undefined;
}

export interface RequestData {
	url: string;
	method?: HttpMethod;
	type: ResourceType;
	initiators?: string[];
	redirectedFrom?: string;
	redirectedTo?: string;
	status?: number;
	remoteIPAddress?: string;
	requestHeaders?: Record<string, string>;
	responseHeaders?: Record<string, string>;
	responseBodyHash?: string;
	postData?: string;
	failureReason?: string;
	/**
	 * in bytes
	 */
	size?: number;
	/**
	 * duration in seconds
	 */
	time?: number;
	/**
	 * of the request in seconds since the unix epoch
	 */
	wallTime?: number;
}

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNNECT' | 'TRACE' | 'PATCH';

export type ResourceType =
	  | 'Document'
	  | 'Stylesheet'
	  | 'Image'
	  | 'Media'
	  | 'Font'
	  | 'Script'
	  | 'TextTrack'
	  | 'XHR'
	  | 'Fetch'
	  | 'EventSource'
	  | 'WebSocket'
	  | 'Manifest'
	  | 'SignedExchange'
	  | 'Ping'
	  | 'CSPViolationReport'
	  | 'Other';

export interface TargetData {
	url: string;
	type: TargetType;
}

export type TargetType =
	  | 'page'
	  | 'background_page'
	  | 'service_worker'
	  | 'shared_worker'
	  | 'other'
	  | 'browser'
	  | 'webview';
