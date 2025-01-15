import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { account, profile, member } = await parent();

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	if (!member.profileId) {
		throw error(404, 'Skyblock profile not found for this player!');
	}
};
