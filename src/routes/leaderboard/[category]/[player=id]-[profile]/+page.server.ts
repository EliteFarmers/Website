import { GetAccount, GetPlayersRank, GetProfilesRank } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
	const { category, player: ign, profile: profileName } = params;
	const { leaderboard } = await parent();

	const { data: player } = await GetAccount(ign);

	if (!player?.id) {
		throw error(404, 'Player not found');
	}

	const profile = player.profiles?.find(
		(p) =>
			p.members?.some((m) => m.active && m.uuid === player.id) &&
			(p.profileName === profileName || p.profileId === profileName)
	);

	if (!profile?.profileId) {
		throw error(404, 'Profile not found');
	}

	const { data: rank } = leaderboard?.profile
		? await GetProfilesRank(category, profile.profileId)
		: await GetPlayersRank(category, player.id, profile.profileId);

	if (!rank?.rank || rank.rank === -1) {
		throw error(404, "This player isn't on the leaderboard!");
	}

	const pageRank = Math.max(1, rank.rank - 10);

	throw redirect(307, `/leaderboard/${category}/${pageRank}`);
}) satisfies PageServerLoad;
