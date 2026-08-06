import { getSitemapSnapshot, SITEMAP_HEADERS } from '$lib/sitemap/snapshot.server';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const snapshot = await getSitemapSnapshot();
	if (!snapshot) {
		return new Response('Sitemap snapshot is not available yet.', {
			status: 503,
			headers: { 'Retry-After': '900' },
		});
	}

	const document = snapshot.documents.get(params.path);
	if (!document) {
		error(404, 'Sitemap not found');
	}

	return new Response(document, { headers: SITEMAP_HEADERS });
};
