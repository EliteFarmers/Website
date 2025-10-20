import { getInventoryItemTexture } from '$lib/api';

export async function GET({ params, url }) {
	const packIds = url.searchParams.get('packs');
	const { response, data } = await getInventoryItemTexture(
		params.inventoryId,
		params.textureId,
		packIds
			? {
					packs: packIds,
				}
			: undefined
	);
	return new Response(data as unknown as Blob, {
		status: response.status,
		headers: {
			'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
			'Content-Length': response.headers.get('Content-Length') || '0',
			'Cache-Control': response.headers.get('Cache-Control') || 'public, max-age=604800',
		},
	});
}
