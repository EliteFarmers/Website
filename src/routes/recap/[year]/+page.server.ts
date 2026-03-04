import { FetchDiscordUserData } from '$lib/api/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, params }) => {
	const discord = await FetchDiscordUserData();

	if (!discord) {
		throw redirect(307, '/login?redirect=' + url.pathname);
	}

	const accounts = discord.minecraftAccounts ?? [];

	return {
		accounts,
		year: params.year,
	};
}) satisfies PageServerLoad;
