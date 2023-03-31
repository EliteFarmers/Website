import { accountFromId, fetchProfiles } from '$lib/data';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const accountData = await accountFromId(id);

	if (!accountData) {
		throw error(404, 'Minecraft account not found!');
	}

	const skyblock = await fetchProfiles(accountData.account.id);
	
	if (!skyblock?.profiles.length) {
		throw error(404, 'Skyblock profiles not found!');
	}

	let profile = skyblock.profiles.find((p) => p.cute_name.toLowerCase() === params.profile.toLowerCase());

	if (!profile) {
		profile = skyblock.profiles.find((p) => p.selected);

		if (!profile) {
			throw error(404, 'Profile not found!');
		}
	}

	return {
		account: accountData.account,
		cute_name: profile.cute_name,
		last_fetched: skyblock.last_fetched,
		member: profile.member,
		api: profile.api,
	}
}