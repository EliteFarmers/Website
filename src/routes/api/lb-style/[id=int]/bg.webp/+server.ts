import { cache } from '$lib/servercache';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLeaderboardBackground } from '$lib/styles/render';
import { isValidLeaderboardStyle, isValidWeightStyle } from '$lib/styles/style';

export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': 'elitebot.dev',
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
		'Access-Control-Allow-Origin': 'elitebot.dev',
	});

	return new Response(buffer, {
		headers: {
			'Content-Type': 'image/webp',
			'Access-Control-Allow-Origin': 'elitebot.dev',
		},
	});
};
