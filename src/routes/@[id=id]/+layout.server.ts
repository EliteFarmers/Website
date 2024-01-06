import { GetAccount, GetProfileMember, type ProfileDetails, type ProfileGameMode } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
	const { id, profile } = params;

	const { data: account } = await GetAccount(id).catch(() => ({ data: undefined }));

	if (!account?.id || !account.name) {
		throw error(404, 'Player not found');
	}

	const profiles = account.profiles?.filter((p) => p.members?.some((m) => m.uuid === account.id && m.active));

	if (!profiles?.length) {
		throw error(404, 'No profiles found for ' + account.name);
	}

	const selectedProfile = profile
		? profiles.find((p) => p.profileId === profile || p.profileName?.toUpperCase() === profile.toUpperCase()) ??
		  profiles[0]
		: profiles.find((p) => p.selected) ?? profiles[0];

	if (!selectedProfile.profileId || !selectedProfile.profileName) {
		throw error(404, 'Profile not found');
	}

	const { data: member } = await GetProfileMember(account.id, selectedProfile.profileId).catch(() => ({
		data: undefined,
	}));

	if (!member) {
		throw error(404, 'Profile data not found');
	}

	const profileIds: ProfileDetails[] = profiles
		// Filter out the current profile
		.filter((p) => p.profileId !== selectedProfile.profileId)
		.map((p) => ({
			id: p.profileId ?? 'Unknown',
			name: p.profileName ?? 'Unknown',
			selected: p.selected ?? false,
			gameMode: p.gameMode as ProfileGameMode | undefined,
			weight: p.members?.find((m) => m.uuid === account.id)?.farmingWeight ?? 0,
		}));

	profileIds.unshift({
		id: selectedProfile.profileId,
		name: selectedProfile.profileName,
		selected: selectedProfile.selected ?? false,
		gameMode: selectedProfile.gameMode as ProfileGameMode | undefined,
		weight: selectedProfile.members?.find((m) => m.uuid === account.id)?.farmingWeight ?? 0,
	});

	return {
		account,
		profile: selectedProfile,
		profiles: profileIds,
		member,
	};
};
