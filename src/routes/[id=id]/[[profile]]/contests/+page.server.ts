import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
    const { player, profile, profiles, member } = await parent();

    if (!player.uuid || !profile.profileId || !player.displayname) {
        throw error(404, 'Player not found');
    }

    return {
        player,
        profile,
        profiles,
        contests: member.jacob?.contests ?? [],
    }
}) satisfies PageServerLoad;