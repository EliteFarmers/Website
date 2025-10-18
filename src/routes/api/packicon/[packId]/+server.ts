import { getGetTexturePackIconUrl } from '$lib/api/index.js';
import { redirect } from '@sveltejs/kit';

export async function GET({ params }) {
	const id = params.packId;
	const url = getGetTexturePackIconUrl(id);
	const response = await fetch(url, { method: 'HEAD' });
	redirect(307, response.url);
}
