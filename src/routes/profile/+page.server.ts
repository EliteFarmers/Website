import { FetchGuilds, type Guild } from '$lib/discord';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, cookies }) => {
	const { discordUser } = await parent();

	if (!discordUser) {
		throw redirect(302, '/login');
	}

	const token = cookies.get('discord_access_token');

	if (!token) {
		throw redirect(302, '/login');
	}

	const guilds = await FetchGuilds(token) as undefined | Guild[];

	if (!guilds) {
		throw redirect(302, '/login');
	}

	return {
		guilds
	}
};
