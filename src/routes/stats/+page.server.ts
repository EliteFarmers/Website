import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetPlayerByDiscordId } from '$lib/eliteapi/eliteapi';

export const load: PageServerLoad = async ({ locals }) => {
	const discordUser = locals.discordUser;

	if (!discordUser) {
		throw redirect(303, '/');
	}

	const { data } = await GetPlayerByDiscordId(discordUser.id);
	
	if (!data) {
		throw redirect(303, '/');
	}

	const selected = data.players?.find((profile) => data.selectedUuid === profile.uuid);

	if (!selected?.displayname) {
		throw redirect(303, '/');
	}

	throw redirect(302, `/stats/${selected.displayname}`);
};
