import { GetAccount, GetPlayersRank } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const { category, player: ign, profile: profileName } = params;

    const { data: player } = await GetAccount(ign);
    
    if (!player?.id) {
        throw error(404, 'Player not found');
    }

    const profile = player.profiles?.find(p => p.profileName === profileName || p.profileId === profileName);

    if (!profile?.profileId) {
        throw error(404, 'Profile not found');
    }

    const { data: rank } = await GetPlayersRank(category, player.id, profile.profileId);

    if (!rank?.rank || rank.rank === -1) {
        throw error(404, 'This player isn\'t on the leaderboard!');
    }

    throw redirect(302, `/leaderboard/${category}/${rank.rank}`);
}) satisfies PageServerLoad;