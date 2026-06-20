import { getRequestEvent } from '$app/server';

type SuccessStatus = 200 | 201 | 204;
type ExtractSuccess<T extends { status: number }> = Extract<T, { status: SuccessStatus }>;
type ExtractError<T extends { status: number }> = Exclude<T, { status: SuccessStatus }>;

type StreamBaseResponse = {
	response: Response;
};

export type StreamApiResponse<SuccessData, ErrorData> =
	| (StreamBaseResponse & {
			data: SuccessData;
			ok: true;
			error?: never;
	  })
	| (StreamBaseResponse & {
			data?: never;
			ok: false;
			error: ErrorData | null;
	  });

export const customFetch = async <T extends { status: number; data: unknown }>(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<StreamApiResponse<ExtractSuccess<T>['data'], ExtractError<T>['data']>> => {
	let request: Request | undefined;
	let fetchFunction = fetch;

	try {
		const event = getRequestEvent();
		request = event.request;
		fetchFunction = event.fetch;
	} catch {
		// Calls outside a request event can still use global fetch.
	}

	const requestHeaders = mergeHeaders(init?.headers);
	requestHeaders.set('User-Agent', 'EliteWebsite');

	if (request?.headers) {
		for (const [key, value] of request.headers) {
			if (key.startsWith('x-') || key.startsWith('cf-')) {
				requestHeaders.set(key, value);
			}
		}
	}

	const response = await fetchFunction(input, { ...init, headers: requestHeaders });

	if (!response.ok) {
		try {
			const errorBody = await response.json();
			return {
				ok: false,
				error: errorBody,
				response,
			};
		} catch {
			return {
				ok: false,
				error: null,
				response,
			};
		}
	}

	if (response.status === 204) {
		return {
			ok: true,
			data: null as ExtractSuccess<T>['data'],
			response,
		};
	}

	if (response.headers.get('Content-Type')?.includes('application/json')) {
		const json = await response.json();
		return {
			ok: true,
			data: json,
			response,
		};
	}

	const blob = await response.blob();
	return {
		ok: true,
		data: blob as ExtractSuccess<T>['data'],
		response,
	};
};

export default customFetch;

function mergeHeaders(...sources: (HeadersInit | undefined)[]) {
	const result = new Headers();

	for (const headersInit of sources) {
		if (!headersInit) continue;
		const headers = new Headers(headersInit);

		for (const [key, value] of headers.entries()) {
			result.set(key, value);
		}
	}

	return result;
}
