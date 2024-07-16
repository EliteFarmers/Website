import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';

export const GET: RequestHandler = async ({ params }) => {
	const { sku } = params;

	let url = `https://discord.com/application-directory/${PUBLIC_DISCORD_CLIENT_ID}/store`;
	if (sku) {
		url += `/${sku}`;
	}

	throw redirect(307, url);
};
