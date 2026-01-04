import { dev } from '$app/environment';
import { command, getRequestEvent, query } from '$app/server';
import { RATE_LIMIT_IP, RATE_LIMIT_IPUA, RATE_LIMIT_PROFILE, RATE_LIMIT_SECRET } from '$env/static/private';
import {
	getAccount,
	getPlayerRecap,
	linkOwnAccount,
	searchAccountsWithDiscord,
	toggleRecapVisibility,
	zodGetAccountParams,
} from '$lib/api';
import type { ProfileDetails, ProfileGameMode } from '$lib/api/elite';
import { IsIGNOrUUID } from '$params/id';
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import * as z from 'zod';

export const GetAccount = query(zodGetAccountParams, async (params) => {
	return await getAccount(params.player);
});

export const getAccountOptions = query(async () => {
	const { data: accountOptions } = await searchAccountsWithDiscord();
	return accountOptions;
});

export const linkAccountCommand = command(z.string(), async (username: string) => {
	const { error: problem, response } = await linkOwnAccount(username);
	return { problem, response };
});

export const getRecap = query(
	z.object({
		year: z.number().int().min(2025),
		playerUuid: z.string().length(32),
		profileUuid: z.string().length(32),
	}),
	async ({ year, playerUuid, profileUuid }) => {
		const { data: recapDto, error: e, response } = await getPlayerRecap(year, playerUuid, profileUuid);

		if (response.status === 401 || !recapDto || e) {
			return {
				authed: false,
			};
		}

		return {
			recap: recapDto,
			authed: true,
		};
	}
);

export const toggleRecapVisibilityCommand = command(
	z.object({
		year: z.number().int().min(2025),
		playerUuid: z.string().length(32),
		profileUuid: z.string().length(32),
		makePublic: z.boolean(),
	}),
	async ({ year, playerUuid, profileUuid, makePublic }) => {
		const { error: problem } = await toggleRecapVisibility(year, playerUuid, profileUuid, {
			public: makePublic,
		});
		return { problem };
	}
);

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

export const getProfilesAccount = query(
	z.object({
		id: z.string(),
		profile: z.string().optional(),
	}),
	async ({ id, profile }) => {
		if (!IsIGNOrUUID(id)) {
			return { code: 400, error: 'Invalid account ID format' };
		}
		const event = getRequestEvent();

		if (!dev) {
			await limiter.cookieLimiter?.preflight(event);

			const limited = await limiter.isLimited(event);
			if (limited) {
				return { code: 429, error: "You're opening too many profiles! Please slow down." };
			}
		}

		const { data: account } = await getAccount(id.replaceAll('-', ''));

		if (!account?.id || !account.name) {
			return { code: 404, error: 'Player not found' };
		}

		const profiles = account.profiles?.filter((p) => p.members?.some((m) => m.uuid === account.id && m.active));

		if (!profiles?.length) {
			return { code: 404, error: 'No profiles found for ' + account.name };
		}

		const selectedProfile = profile
			? (profiles.find(
					(p) =>
						p.profileId === profile.replaceAll('-', '') ||
						p.profileName?.toUpperCase() === profile.toUpperCase()
				) ?? profiles[0])
			: (profiles.find((p) => p.selected) ?? profiles[0]);

		if (!selectedProfile.profileId || !selectedProfile.profileName) {
			return { code: 404, error: 'Profile not found' };
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

		if (!account.id || !account.name || !selectedProfile.profileId) {
			return { code: 404, error: 'Player not found' };
		}

		if (account.settings?.nameStyle?.id) {
			const style = event.locals.cache?.styleLookup?.[account.settings.nameStyle?.id];
			return {
				account,
				profile: selectedProfile,
				profiles: profileIds,
				style: style ?? undefined,
			};
		}

		return {
			account,
			profile: selectedProfile,
			profiles: profileIds,
		};
	}
);
