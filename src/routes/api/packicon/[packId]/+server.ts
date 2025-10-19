import { getTexturePackIcon } from '$lib/api/index.js';

export async function GET({ params }) {
	const { response, data } = await getTexturePackIcon(params.packId);

	return new Response(data as unknown as Blob, {
		status: response.status,
		headers: {
			'Content-Type': response.headers.get('Content-Type') || 'application/json',
			'Cache-Control': 'public, max-age=86400', // Cache for 1 day
		},
	});
}
