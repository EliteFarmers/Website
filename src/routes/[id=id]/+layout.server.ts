import { GetPlayer, GetProfileMember, GetProfiles } from '$lib/eliteapi/eliteapi';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
    const { id, profile } = params;
    const { data } = await GetPlayer(id); 

    if (!data?.displayname || !data.uuid) {
        throw error(404, 'Player not found');
    }

    const { data: profilesData } = await GetProfiles(data.uuid);
    const profiles = profilesData?.filter((p) => p.members?.some(m => m.uuid === data.uuid && m.active));

    if (!profiles?.length) {
        throw error(404, 'No profiles found for ' + data.displayname);
    }

    const selectedProfile = profile 
        ? profiles.find((p) => p.profileId === profile || p.profileName?.toUpperCase() === profile.toUpperCase()) ?? profiles[0] 
        : profiles.find((p) => p.selected) ?? profiles[0];

    if (!selectedProfile.profileId) {
        throw error(404, 'Profile not found');
    }

    const { data: member } = await GetProfileMember(data.uuid, selectedProfile.profileId);

    if (!member) {
        throw error(404, 'Profile data not found');
    }
   
	const profileIds = profiles
        // Filter out the current profile
        .filter(p => p.profileId !== selectedProfile.profileId)
        .map((p) => ({
            id: p.profileId ?? 'Unknown',
            name: p.profileName ?? 'Unknown',
        }));

    profileIds.unshift({ id: selectedProfile.profileId, name: selectedProfile.profileName ?? 'Unknown' });

    return {
        player: data,
        profile: selectedProfile,
        profiles: profileIds,
        member,
    };
};