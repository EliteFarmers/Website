import { PUBLIC_COMMUNITY_INVITE, PUBLIC_DONATION_URL, PUBLIC_SUPPORT_SERVER_INVITE } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const urls: Partial<Record<string, string>> = {
	donate: PUBLIC_DONATION_URL,
	discord: PUBLIC_COMMUNITY_INVITE,
	support: PUBLIC_SUPPORT_SERVER_INVITE,
	stickers: 'https://www.etsy.com/listing/1499421785/pixelated-crop-stickers',
};

export const GET = (async ({ params }) => {
	const { catch: param } = params;

	const mapped = urls[param];

	if (!mapped) {
		throw error(404, 'Not Found');
	}

	throw redirect(307, mapped);
}) satisfies RequestHandler;
