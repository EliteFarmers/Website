import { getRequestEvent } from '$app/server';

type SuccessStatus = 200 | 201 | 204;
type ExtractSuccess<T extends { status: number }> = Extract<T, { status: SuccessStatus }>;
type ExtractError<T extends { status: number }> = Exclude<T, { status: SuccessStatus }>;

type EliteBaseResponse = {
	response: Response;
};

export type EliteResponse<SuccessData, ErrorData> =
	| (EliteBaseResponse & {
			data: SuccessData;
			ok: true;
			error?: never;
	  })
	| (EliteBaseResponse & {
			data?: never;
			ok: false;
			error: ErrorData | null;
	  });

/**
 * Custom fetch mutator for Orval.
 * This function wraps the native fetch call, allowing us to inject
 * custom logic, like forwarding headers from a SvelteKit server request.
 * @param input The resource you want to fetch.
 * @param init Custom settings to apply to the request.
 */
export const customFetch = async <T extends { status: number; data: unknown }>(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<EliteResponse<ExtractSuccess<T>['data'], ExtractError<T>['data']>> => {
	let request: Request | undefined;
	let locals: App.Locals | undefined;
	let fetchFunction = fetch;
	try {
		const event = getRequestEvent();
		request = event.request;
		locals = event.locals;
		fetchFunction = event.fetch;
	} catch {
		// Ignore this, we just won't have access to the request/locals for this call
	}

	const requestHeaders = mergeHeaders(init?.headers);
	requestHeaders.set('User-Agent', 'EliteWebsite');

	if (request?.headers) {
		for (const header of request.headers) {
			if (header[0].startsWith('x-')) {
				requestHeaders.set(header[0], header[1]);
			}
		}
	}

	if (locals?.access_token) {
		requestHeaders.set('Authorization', `Bearer ${locals.access_token}`);
	}

	const rInit = { ...init, headers: requestHeaders };
	const response = await fetchFunction(input, rInit);

	// If the response is not OK (e.g., 4xx, 5xx), parse the error and return it.
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

	// Handle successful responses that don't have a JSON body (e.g., 204 No Content)
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
