import { getRequestEvent } from '$app/server';

/**
 * Custom fetch mutator for Orval.
 * This function wraps the native fetch call, allowing us to inject
 * custom logic, like forwarding headers from a SvelteKit server request.
 * @param input The resource you want to fetch.
 * @param init Custom settings to apply to the request.
 */
export const customFetch = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
	const { request, locals } = getRequestEvent();

	const requestHeaders = new Headers(init?.headers || request.headers);
	requestHeaders.set('User-Agent', 'EliteWebsite');
	requestHeaders.delete('accept-encoding');

	if (locals.access_token) {
		requestHeaders.set('Authorization', `Bearer ${locals.access_token}`);
	}

	const response = await fetch(input, {
		...init,
		headers: requestHeaders,
	});

	if (!response.ok) {
		// You can implement more robust error handling here
		const errorBody = await response.text();
		console.error('API Error:', errorBody);
		throw new Error(`API request failed with status ${response.status}`);
	}

	// Handle responses that might not have a JSON body (e.g., 204 No Content)
	const contentType = response.headers.get('content-type');
	if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
		return undefined as T;
	}

	return response.json();
};

export default customFetch;
