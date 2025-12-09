import { getAccount, type ProfileDetailsDto } from '$lib/api';
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
		: (profiles.sort((a, b) => sort(a, b, account.id))?.[0] ?? profiles[0]);

	if (!selectedProfile?.profileId) {
		throw error(404, 'Profile not found');
	}

	return {
		playerUuid: account.id,
		profileUuid: selectedProfile.profileId,
		profileName: selectedProfile.profileName,
		ign: account.formattedName,
		year: +year,
	};
};

function sort(a: ProfileDetailsDto, b: ProfileDetailsDto, playerUuid: string) {
	const memberA = a.members?.find((m) => m.uuid === playerUuid);
	const memberB = b.members?.find((m) => m.uuid === playerUuid);

	return (memberB?.farmingWeight ?? 0) - (memberA?.farmingWeight ?? 0);
}
