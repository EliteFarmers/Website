import { env } from '$env/dynamic/public';
import { cache } from '$lib/servercache';
import { getLeaderboardBackground } from '$lib/styles/render';
import { isValidLeaderboardStyle, isValidWeightStyle } from '$lib/styles/style';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
const { PUBLIC_HOST_URL } = env;

export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': PUBLIC_HOST_URL.replace('https://', ''),
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
		},
	});
}

const ALLOWED_WIDTHS = new Set([400, 800, 1280, 1920]);

export const GET: RequestHandler = async ({ params, setHeaders, url }) => {
	const { id } = params;

	const widthParam = url.searchParams.get('w');
	const width = widthParam ? parseInt(widthParam, 10) : undefined;
	if (width !== undefined && !ALLOWED_WIDTHS.has(width)) {
		error(400, 'Invalid width');
	}

	const style = cache.styleLookup?.[id];
	if (!style?.leaderboard || !isValidLeaderboardStyle(style.leaderboard)) {
		error(404, 'Style not found');
	}

	const buffer = await getLeaderboardBackground(
		style.leaderboard,
		isValidWeightStyle(style.data) ? style.data.elements.background : undefined,
		width,
		style.imageRefs
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
