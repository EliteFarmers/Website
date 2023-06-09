import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetUserByDiscordID } from '$db/database';

export const load: PageServerLoad = async ({ locals }) => {
	const discordUser = locals.discordUser;

	if (!discordUser) {
		throw redirect(303, '/');
	}

	const user = await GetUserByDiscordID(discordUser.id);
	const ign = user?.account?.account.name;

	if (!ign) {
		throw redirect(303, '/');
	}

	throw redirect(302, `/stats/${ign}`);
};
