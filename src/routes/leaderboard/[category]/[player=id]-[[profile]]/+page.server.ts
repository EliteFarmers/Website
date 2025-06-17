import { GetAccount, GetPlayersRank, GetProfilesRank, LeaderboardRemovedFilter } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent, url }) => {
	const { category, player: ign, profile: profileName } = params;
	const { leaderboard } = await parent();

	const mode = url.searchParams.get('mode')?.toString() ?? undefined;
	const interval = url.searchParams.get('interval')?.toString() ?? undefined;
	const removed = url.searchParams.get('removed')?.toString() ?? undefined;

	if (!ign) {
		throw error(400, 'Search query is required!');
	}

	const { data: account } = await GetAccount(ign);
	if (!account) {
		throw error(400, 'User not found!');
	}

	const profile =
		account.profiles.find((p) => p.profileName === profileName || p.profileId === profileName) ??
		account.profiles.find((p) => p.selected) ??
		account.profiles?.find((p) => p.members?.some((m) => m.active && m.uuid === account.id));

	if (!profile) {
		throw error(400, 'No active profile found!');
	}

	const query = {
		mode,
		interval,
		removed: removed ? (+removed as LeaderboardRemovedFilter) : undefined,
	};

	const { data: rank } = leaderboard?.profile
		? await GetProfilesRank(category, profile.profileId, false, query)
		: await GetPlayersRank(category, account.id, profile.profileId, false, query);

	if (!rank?.rank || rank.rank === -1) {
		throw error(400, 'Player not found in leaderboard!');
	}

	redirect(303, `/leaderboard/${category}/${Math.max(rank.rank - 10, 1)}${url.search}`);
}) satisfies PageServerLoad;
