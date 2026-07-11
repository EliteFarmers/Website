import { env } from '$env/dynamic/private';
import { getHypixelGlyphFont } from '$lib/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	if (!env.ELITE_API_URL) {
		return new Response(null, { status: 503 });
	}

	const headers = new Headers();
	const ifNoneMatch = request.headers.get('if-none-match');
	if (ifNoneMatch) headers.set('if-none-match', ifNoneMatch);

	const { response, data } = await getHypixelGlyphFont({ headers });
	const responseHeaders = new Headers();
	for (const name of ['content-type', 'content-length', 'cache-control', 'etag', 'last-modified']) {
		const value = response.headers.get(name);
		if (value) responseHeaders.set(name, value);
	}

	return new Response(data as unknown as Blob, {
		status: response.status,
		headers: responseHeaders,
	});
};
