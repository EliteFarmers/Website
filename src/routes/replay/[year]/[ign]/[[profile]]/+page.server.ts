import { getAccount, getPlayerRecap } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const year = params.year;
	const ign = params.ign;
	const profileName = params.profile;

	const { data: account } = await getAccount(ign);

	if (!account?.id) {
		throw error(404, 'Player not found');
	}

	const profiles = account.profiles?.filter((p) => p.members?.some((m) => m.uuid === account.id));

	if (!profiles?.length) {
		throw error(404, 'No profiles found');
	}

	const selectedProfile = profileName
		? (profiles.find(
				(p) =>
					p.profileId === profileName.replaceAll('-', '') ||
					p.profileName?.toUpperCase() === profileName.toUpperCase()
			) ?? profiles[0])
		: (profiles.find((p) => p.selected) ?? profiles[0]);

	if (!selectedProfile?.profileId) {
		throw error(404, 'Profile not found');
	}

	const { data: recapDto, error: e } = await getPlayerRecap(year, account.id, selectedProfile.profileId);

	if (!recapDto || e) {
		console.log(e);
		throw error(500, e?.reason || 'Failed to load recap data');
	}

	return {
		wrapped: recapDto.data,
	};
};
