import { API_CROP_TO_CROP, PROPER_CROP_NAME, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
import FarmingCollections from '$lib/collections';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { GetPlayerRanks, GetProfileMember } from '$lib/eliteapi/eliteapi';

export const load: PageServerLoad = async ({ params, parent, setHeaders }) => {
	const { player, profiles } = await parent();

	const selectedProfile = profiles.find((p) => p.profileId === params.profile || p.profileName?.toUpperCase() === params.profile.toUpperCase()) 
		?? profiles.find((p) => p.selected) 
		?? profiles[0];

	if (!player.uuid || !selectedProfile.profileId) {
		throw error(404, 'Player not found');
	}

	const { data: profile } = await GetProfileMember(player.uuid, selectedProfile.profileId);

	if (!selectedProfile.profileId || !player.uuid || !player.displayname || !profile || !profile.profileId) {
		throw error(404, 'Skyblock profile not found for this player!');
	}

	const { data: ranks } = await GetPlayerRanks(player.uuid, profile.profileId);

	const collections = Object.entries(profile.collections ?? {})
		.filter(([key]) => PROPER_CROP_NAME[key])
		.map(([key, value]) => ({
			key: API_CROP_TO_CROP[key as keyof typeof API_CROP_TO_CROP],
			name: PROPER_CROP_NAME[key],
			value: value,
			minionTierField: 0,
			weight: 0,
		})) as Collection[];

		for (const collection of collections) {
			if (!collection.name) continue;

			const minion = PROPER_CROP_TO_MINION[collection.name] ?? 'no';
			collection.minionTierField = profile.craftedMinions?.[minion] ?? 0;
			collection.weight = profile.farmingWeight?.cropWeight?.[collection.name] ?? 0;
			collection.maxTier = FarmingCollections.crops[collection.name].length;
			collection.tier = FarmingCollections.crops[collection.name].findIndex((t) => t > collection.value) + 1;
			if (collection.tier === 0) collection.tier = collection.maxTier;
		}

	const profileIds = profiles
		// Filter out the current profile and only show profiles that have the player as an active member
		.filter(p => p.profileId !== selectedProfile.profileId && p.members?.some(m => m.uuid === player.uuid && m.active))
		.map((p) => ({
			id: p.profileId ?? 'Unknown',
			name: p.profileName ?? 'Unknown',
		}));
	
	profileIds.unshift({ id: selectedProfile.profileId, name: selectedProfile.profileName ?? 'Unknown' });

	setHeaders({
		'Cache-Control': `public, max-age=${PROFILE_UPDATE_INTERVAL / 1000}`,
	});

	return {
		player,
		profile: selectedProfile,
		member: profile,
		profiles: profileIds,
		ranks,
		collections,
	}
};

interface Collection {
	key: string;
	name: string | undefined;
	value: number;
	minionTierField: number;
	tier: number;
	maxTier: number;
	weight: number;
}