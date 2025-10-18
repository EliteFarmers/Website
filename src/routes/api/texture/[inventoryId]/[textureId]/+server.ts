import { getGetInventoryItemTextureUrl } from '$lib/api/index.js';
import { redirect } from '@sveltejs/kit';

export async function GET({ params }) {
	redirect(307, getGetInventoryItemTextureUrl(params.inventoryId, params.textureId));
}
