import { getSitemapSnapshot, SITEMAP_HEADERS } from '$lib/sitemap/snapshot.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const snapshot = await getSitemapSnapshot();
	if (!snapshot) {
		return new Response('Sitemap snapshot is not available yet.', {
			status: 503,
			headers: { 'Retry-After': '900' },
		});
	}

	return new Response(snapshot.index, { headers: SITEMAP_HEADERS });
};
