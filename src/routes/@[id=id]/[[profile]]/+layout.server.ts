import { GetPlayerRanks } from '$lib/api/elite';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent }) => {
    const { account, profile } = await parent();

    if (!account.id || !account.name || !profile.profileId) {
        throw error(404, 'Player not found');
    }

	const { data: ranks } = await GetPlayerRanks(account.id, profile.profileId);
    
    return {
        ranks
    }
}) satisfies LayoutServerLoad;