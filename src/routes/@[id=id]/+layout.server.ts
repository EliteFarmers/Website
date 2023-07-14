import { GetAccount, GetProfileMember } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, url }) => {
	const { id, profile } = params;

	const { data: account } = await GetAccount(id);

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

	if (selectedProfile.profileName !== profile) {
		throw redirect(302, `/@${id}/${selectedProfile.profileName}${url.pathname.includes('/contests') ? '/contests' : ''}`);
	}

	const { data: member } = await GetProfileMember(account.id, selectedProfile.profileId);

	if (!member) {
		throw error(404, 'Profile data not found');
	}

	const profileIds = profiles
		// Filter out the current profile
		.filter((p) => p.profileId !== selectedProfile.profileId)
		.map((p) => ({
			id: p.profileId ?? 'Unknown',
			name: p.profileName ?? 'Unknown',
		}));

	profileIds.unshift({ id: selectedProfile.profileId, name: selectedProfile.profileName });

	return {
		account,
		profile: selectedProfile,
		profiles: profileIds,
		member,
	};
};
