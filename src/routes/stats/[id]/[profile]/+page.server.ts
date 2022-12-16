import type { LeaderboardEntry } from '$db/database';
import type { UserInfo, WeightInfo } from '$db/models/users';
import { PROPER_CROP_NAME, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
import { accountFromId, selectedProfile } from '$lib/data';
import FarmingCollections from '$lib/collections';
import type { PlayerInfo, Profiles } from '$lib/skyblock';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id } = params;
	const accountData = await accountFromId(id);

	if (!accountData) {
		throw error(404, 'Minecraft account not found');
	}

	const account = accountData.account;

	// These could be replaced with direct calls to the database, but this works for now
	// as it ensures that the data is always up to date.
	const profilesFetch = fetch(`/api/profiles/${account.id}`);
	const playerFetch = fetch(`/api/player/${account.id}`);
	const userFetch = fetch(`/api/info/${account.id}`);
	const rankFetch = fetch(`/api/leaderboard/weight/${account.id}`);

	try {
		const [profilesRes, playerRes, userRes] = await Promise.all([profilesFetch, playerFetch, userFetch, rankFetch]);
		const [profiles, player, user] = (await Promise.all([
			profilesRes.json(),
			playerRes.json(),
			userRes.json(),
		])) as [Profiles, PlayerInfo, UserInfo];

		const rankData = (await (await rankFetch).json()) as
			| { success: true; entry: LeaderboardEntry }
			| { success: false; error: string };
		const rank = rankData.success ? rankData.entry.rank : -1;

		const profile = selectedProfile(profiles.profiles, params.profile);

		if (!profile) {
			throw error(404, 'Skyblock profile not found for this player!');
		}

		const profileIds = profiles.profiles
			.filter((p) => p.profile_id !== profile.profile_id)
			.map((p) => ({
				id: p.profile_id,
				name: p.cute_name,
			}));
		profileIds.unshift({ id: profile.profile_id, name: profile.cute_name });

		const weightFetch = await fetch(`/api/weight/${account.id}/${profile.profile_id}`);
		const weight = (await weightFetch.json()) as WeightInfo;

		const collections = Object.entries(profile.member.collection ?? {})
			.filter(([key]) => PROPER_CROP_NAME[key])
			.map(([key, value]) => ({ name: PROPER_CROP_NAME[key], value, minionTierField: 0, weight: 0 })) as {
			name: string | undefined;
			value: number;
			minionTierField: number;
			tier: number;
			maxTier: number;
			weight: number;
		}[];

		for (const collection of collections) {
			if (!collection.name) continue;

			const minion = PROPER_CROP_TO_MINION[collection.name] ?? 'no';
			collection.minionTierField = profile.member.minions[minion];
			collection.weight = weight.farming.sources[collection.name];
			collection.maxTier = FarmingCollections.crops[collection.name].length;
			collection.tier = FarmingCollections.crops[collection.name].findIndex((t) => t > collection.value) + 1;
			if (collection.tier === 0) collection.tier = collection.maxTier;
		}

		return {
			account: account,
			profile: profile,
			profileName: profile.cute_name,
			profiles: profileIds,
			last_fetched: profiles.last_fetched,
			player: player,
			weight: weight,
			user: user,
			rank: rank,
			collections: collections,
		};
	} catch (e) {
		throw error(500, 'Failed to fetch data');
	}
};
