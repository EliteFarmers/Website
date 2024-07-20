import { GetAccount, GetProfileMember, type ProfileDetails, type ProfileGameMode } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { RATE_LIMIT_IP, RATE_LIMIT_IPUA, RATE_LIMIT_PROFILE, RATE_LIMIT_SECRET } from '$env/static/private';
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import { dev } from '$app/environment';

const limiter = new RateLimiter({
	IP: [+RATE_LIMIT_IP, '10m'],
	IPUA: [+RATE_LIMIT_IPUA, '10m'],
	cookie: {
		name: 'profile_rate_limit',
		secret: RATE_LIMIT_SECRET,
		rate: [+RATE_LIMIT_PROFILE, '10s'],
		preflight: true,
	},
});

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;

	if (!dev) {
		await limiter.cookieLimiter?.preflight(event);

		const limited = await limiter.isLimited(event);
		if (limited) {
			throw error(429, 'Too Many Requests');
		}
	}

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
