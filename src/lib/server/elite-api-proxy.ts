import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

export async function proxyEliteApi(event: RequestEvent, path: string, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	headers.set('User-Agent', 'EliteWebsite');

	for (const [key, value] of event.request.headers.entries()) {
		if (key.startsWith('x-') || key.startsWith('cf-')) {
			headers.set(key, value);
		}
	}

	if (env.ELITE_API_TOKEN) {
		headers.set('X-Website-Secret', env.ELITE_API_TOKEN);
	}

	if (event.locals.access_token) {
		headers.set('Authorization', `Bearer ${event.locals.access_token}`);
	}

	const response = await event.fetch(`${env.ELITE_API_URL}${path}`, {
		...init,
		headers,
	});

	const responseHeaders = new Headers();
	const contentType = response.headers.get('content-type');
	if (contentType) {
		responseHeaders.set('content-type', contentType);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}
