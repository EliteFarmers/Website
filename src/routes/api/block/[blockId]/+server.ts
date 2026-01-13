import { getBlockTexture } from '$lib/api/index.js';

export async function GET({ params, url }) {
	const packIds = url.searchParams.get('packs');
	const { response, data } = await getBlockTexture(
		params.blockId,
		packIds
			? {
					packs: packIds,
				}
			: undefined
	);

	return new Response(data as unknown as Blob, {
		status: response.status,
		headers: {
			'Content-Type': response.headers.get('Content-Type') || 'application/json',
			'Cache-Control': 'public, max-age=86400', // Cache for 1 day
		},
	});
}
