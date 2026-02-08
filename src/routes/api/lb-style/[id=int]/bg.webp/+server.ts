import { PUBLIC_HOST_URL } from '$env/static/public';
import { cache } from '$lib/servercache';
import { getLeaderboardBackground } from '$lib/styles/render';
import { isValidLeaderboardStyle, isValidWeightStyle } from '$lib/styles/style';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': PUBLIC_HOST_URL.replace('https://', ''),
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
		},
	});
}

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const { id } = params;

	const style = cache.styleLookup?.[id];
	if (!style?.leaderboard || !isValidLeaderboardStyle(style.leaderboard)) {
		error(404, 'Style not found');
	}

	const buffer = await getLeaderboardBackground(
		style.leaderboard,
		isValidWeightStyle(style.data) ? style.data.elements.background : undefined
	);
	if (!buffer) {
		error(404, 'Style not found');
	}

	setHeaders({
		'Cache-Control': 'max-age=3600, public',
		'Access-Control-Allow-Origin': PUBLIC_HOST_URL.replace('https://', ''),
	});

	return new Response(new Uint8Array(buffer), {
		headers: {
			'Content-Type': 'image/webp',
			'Access-Control-Allow-Origin': PUBLIC_HOST_URL.replace('https://', ''),
		},
	});
};
