import { getAccount, getPlayerRank2, getProfileRank2, RemovedFilter } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent, url, request }) => {
	const { category, player: ign, profile: profileName } = params;
	const { leaderboard } = await parent();

	const mode = url.searchParams.get('mode')?.toString() ?? undefined;
	const interval = url.searchParams.get('interval')?.toString() ?? undefined;
	const removed = url.searchParams.get('removed')?.toString() ?? undefined;

	if (!ign) {
		throw error(400, 'Search query is required!');
	}

	const { data: account } = await getAccount(ign, { headers: request.headers }).catch(() => ({ data: undefined }));
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
		removed: removed ? (+removed as RemovedFilter) : undefined,
		new: true,
	};

	const { data: rank } = leaderboard?.profile
		? await getProfileRank2(category, profile.profileId, query, { headers: request.headers })
		: await getPlayerRank2(category, account.id, profile.profileId, query, { headers: request.headers });

	if (!rank?.rank || rank.rank === -1) {
		throw error(400, 'Player not found in leaderboard!');
	}

	redirect(303, `/leaderboard/${category}/${Math.max(rank.rank - 10, 1)}${url.search}`);
}) satisfies PageServerLoad;
