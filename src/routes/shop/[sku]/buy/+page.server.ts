import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_DISCORD_CLIENT_ID } from '$env/static/public';

export const load = (async ({ params }) => {
	const sku = params.sku;

	redirect(307, `https://discord.com/application-directory/${PUBLIC_DISCORD_CLIENT_ID}/store/${sku}`);
}) satisfies PageServerLoad;