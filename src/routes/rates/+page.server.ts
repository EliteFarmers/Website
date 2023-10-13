import { GetAccount, GetProfileMember } from '$lib/api/elite';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const player = url.searchParams.get('ign');
	const profile = url.searchParams.get('profile')?.toLowerCase();

	if (!player) {
		return {
			account: null,
			member: null,
		};
	}

	const { data: account } = await GetAccount(player).catch(() => ({ data: undefined }));

	if (!account?.profiles || !account?.id) {
		return {
			account: null,
			member: null,
			error: account?.profiles ? 'Player has no profiles!' : 'Account not found!',
		};
	}

	const playerProfiles = account.profiles.filter((p) => p.members?.find((m) => m.uuid === account.id)?.active);

	const selected = profile
		? playerProfiles?.find((p) => p.profileId === profile || p.profileName?.toLowerCase() === profile)
		: playerProfiles?.find((p) => p.selected) ?? playerProfiles[0];

	if (!selected?.profileId) {
		return {
			account,
			member: null,
			error: 'Profile not found!',
		};
	}

	const { data: member } = await GetProfileMember(account.id, selected.profileId).catch(() => ({ data: undefined }));

	if (!member) {
		return {
			account,
			member: null,
			error: 'Member data not found!',
		};
	}

	return {
		account,
		member,
	};
}) satisfies PageServerLoad;
