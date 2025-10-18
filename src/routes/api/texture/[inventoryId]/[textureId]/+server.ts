import { getGetInventoryItemTextureUrl } from '$lib/api';
import { redirect } from '@sveltejs/kit';

export async function GET({ params, fetch }) {
	const url = getGetInventoryItemTextureUrl(params.inventoryId, params.textureId);
	const response = await fetch(url, { method: 'HEAD' });
	redirect(307, response.url);
}
