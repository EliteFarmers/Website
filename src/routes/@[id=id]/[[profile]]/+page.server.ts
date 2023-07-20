import { API_CROP_TO_CROP, PROPER_CROP_NAME, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
import FarmingCollections from '$lib/collections';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { GetPlayerRanks } from '$lib/api/elite';

export const load: PageServerLoad = async ({ parent, setHeaders }) => {
	const { account, profile, member } = await parent();

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	if (!member.profileId) {
		throw error(404, 'Skyblock profile not found for this player!');
	}

	const { data: ranks } = await GetPlayerRanks(account.id, profile.profileId);

	const collections = Object.entries(member.collections ?? {})
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
		collection.minionTierField = member.craftedMinions?.[minion] ?? 0;
		collection.weight = member.farmingWeight?.cropWeight?.[collection.name] ?? 0;
		collection.maxTier = FarmingCollections.crops[collection.name].length;
		collection.tier = FarmingCollections.crops[collection.name].findIndex((t) => t > collection.value) + 1;
		if (collection.tier === 0) collection.tier = collection.maxTier;
	}

	setHeaders({
		'Cache-Control': `public, max-age=${PROFILE_UPDATE_INTERVAL / 1000}`,
	});

	return {
		ranks,
		collections,
	};
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
