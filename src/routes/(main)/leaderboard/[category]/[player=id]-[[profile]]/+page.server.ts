import { getAccount, getPlayerRank2, getProfileRank2, RemovedFilter } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent, url }) => {
	const { category, player: ign, profile: profileName } = params;
	const { leaderboard } = await parent();

	const mode = url.searchParams.get('mode')?.toString() ?? undefined;
	const interval = url.searchParams.get('interval')?.toString() ?? undefined;
	const removed = url.searchParams.get('removed')?.toString() ?? undefined;
	const fallbackStr =
		url.searchParams.get('fallback')?.toString() ?? url.searchParams.get('f')?.toString() ?? undefined;
	const fallback = isNaN(Number(fallbackStr)) ? undefined : Math.max(Number(fallbackStr) - 10, 1);

	const newSearchParams = new URLSearchParams(url.searchParams);
	newSearchParams.delete('fallback');
	newSearchParams.delete('f');
	const newSearch = newSearchParams.toString() ? `?${newSearchParams.toString()}` : '';

	if (!ign) {
		if (fallback) throw redirect(303, `/leaderboard/${category}/${fallback}${newSearch}`);
		throw error(400, 'Search query is required!');
	}

	const { data: account } = await getAccount(ign).catch(() => ({ data: undefined }));
	if (!account) {
		if (fallback) throw redirect(303, `/leaderboard/${category}/${fallback}${newSearch}`);
		throw error(400, 'User not found!');
	}

	const profile =
		account.profiles.find((p) => p.profileName === profileName || p.profileId === profileName) ??
		account.profiles.find((p) => p.selected) ??
		account.profiles?.find((p) => p.members?.some((m) => m.active && m.uuid === account.id));

	if (!profile) {
		if (fallback) throw redirect(303, `/leaderboard/${category}/${fallback}${newSearch}`);
		throw error(400, 'No active profile found!');
	}

	const query = {
		mode,
		interval,
		removed: removed ? (+removed as RemovedFilter) : undefined,
	};

	const { data: rank } = leaderboard?.profile
		? await getProfileRank2(category, profile.profileId, query)
		: await getPlayerRank2(category, account.id, profile.profileId, query);

	if (!rank?.rank || rank.rank === -1) {
		if (fallback) throw redirect(303, `/leaderboard/${category}/${fallback}${newSearch}`);
		throw error(400, 'Player not found in leaderboard!');
	}

	redirect(303, `/leaderboard/${category}/${Math.max(rank.rank - 10, 1)}${newSearch}`);
}) satisfies PageServerLoad;
