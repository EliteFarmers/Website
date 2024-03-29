import { API_CROP_TO_CROP, PROPER_CROP_NAME, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PROFILE_UPDATE_INTERVAL } from '$lib/constants/data';
import { hasPermission, PermissionFlags } from '$lib/auth';
import { CROP_TO_PEST } from '$lib/constants/pests';
import { Crop, getCropFromName } from 'farming-weight';

export const load: PageServerLoad = async ({ parent, setHeaders, locals }) => {
	const { account, profile, member } = await parent();

	let authorized = false;
	if (locals.discord_access_token && hasPermission(locals.user, PermissionFlags.ViewGraphs)) {
		authorized = true;
	}

	if (!account.id || !account.name || !profile.profileId) {
		throw error(404, 'Player not found');
	}

	if (!member.profileId) {
		throw error(404, 'Skyblock profile not found for this player!');
	}

	const collections = Object.entries(member.collections ?? {})
		.filter(([key]) => PROPER_CROP_NAME[key])
		.map(([key, value]) => ({
			key: API_CROP_TO_CROP[key as keyof typeof API_CROP_TO_CROP],
			name: PROPER_CROP_NAME[key],
			value: value,
			minionTierField: 0,
			weight: 0,
			pest: '',
			pestKills: 0,
			uncounted: 0,
		})) as Collection[];

	for (const collection of collections) {
		if (!collection.name) continue;

		const minion = PROPER_CROP_TO_MINION[collection.name] ?? 'no';
		const pest = CROP_TO_PEST[getCropFromName(collection.name) ?? Crop.Wheat];

		collection.minionTierField = member.craftedMinions?.[minion] ?? 0;
		collection.weight = member.farmingWeight?.cropWeight?.[collection.name] ?? 0;
		collection.pest = pest;
		collection.pestKills = member.farmingWeight?.pests?.[pest as keyof typeof member.farmingWeight.pests] ?? 0;
		collection.uncounted = member.farmingWeight?.uncountedCrops?.[collection.name] ?? 0;
	}

	if (!authorized) {
		setHeaders({
			'Cache-Control': `public, max-age=${PROFILE_UPDATE_INTERVAL / 1000}`,
		});
	} else {
		setHeaders({
			'Cache-Control': 'no-store',
		});
	}

	return {
		collections,
		authorized,
	};
};

interface Collection {
	key: string;
	name: string | undefined;
	value: number;
	minionTierField: number;
	weight: number;
	pest: string;
	pestKills: number;
	uncounted: number;
}
