import { GetPlayer, GetProfiles } from '$lib/eliteapi/eliteapi';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
    const { data } = await GetPlayer(params.id); 

    if (!data?.displayname || !data.uuid) {
        throw error(404, 'Player not found');
    }

    const { data: profiles } = await GetProfiles(data.uuid);

    if (!profiles?.length) {
        throw error(404, 'No profiles found for ' + data.displayname);
    }

    return {
        player: data,
        profiles: profiles,
    };
};