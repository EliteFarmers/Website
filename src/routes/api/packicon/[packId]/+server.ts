import { getGetTexturePackIconUrl } from '$lib/api/index.js';
import { redirect } from '@sveltejs/kit';

export async function GET({ params }) {
	const id = params.packId;

	redirect(307, getGetTexturePackIconUrl(id));
}
