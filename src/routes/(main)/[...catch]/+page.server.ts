import { env } from '$env/dynamic/public';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
const { PUBLIC_COMMUNITY_INVITE, PUBLIC_DONATION_URL, PUBLIC_SUPPORT_SERVER_INVITE } = env;

const urls: Partial<Record<string, string>> = {
	donate: PUBLIC_DONATION_URL,
	discord: PUBLIC_COMMUNITY_INVITE,
	support: PUBLIC_SUPPORT_SERVER_INVITE,
	stickers: '/info/badges',
	leaderboards: '/leaderboard',
	oss: '/oss.txt',
	store: '/shop',
	wiki: 'https://wiki.elitebot.dev/',
	premium: '/shop/1261795533916475578',
};

export const load = (async ({ params }) => {
	const { catch: param } = params;

	const mapped = urls[param];

	if (!mapped) {
		error(404, 'Not Found');
	}

	redirect(307, mapped);
}) satisfies PageServerLoad;
