import { getInventoryItemTexture } from '$lib/api';

export async function GET({ params }) {
	const { response } = await getInventoryItemTexture(params.inventoryId, params.textureId);
	return new Response(response.body, {
		status: response.status,
		headers: {
			'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
			'Content-Length': response.headers.get('Content-Length') || '0',
			'Cache-Control': response.headers.get('Cache-Control') || 'public, max-age=604800',
		},
	});
}
