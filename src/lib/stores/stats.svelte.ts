import type { components } from '$lib/api/api';
import type { ProfileDetails } from '$lib/api/elite';
import { PROPER_CROP_NAME, API_CROP_TO_CROP, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
import { CROP_TO_PEST, getCropFromName, Crop } from 'farming-weight';
import { getContext, setContext } from 'svelte';

export class PlayerStats {
	#account = $state<NonNullable<components['schemas']['MinecraftAccountDto']>>(null!);
	#selectedProfile = $state<components['schemas']['ProfileDetailsDto']>();
	#profiles = $state<ProfileDetails[]>();
	#member = $state<NonNullable<components['schemas']['ProfileMemberDto']>>(null!);
	#garden = $derived.by(() => this.#member?.garden);
	#ranks = $state<components['schemas']['LeaderboardPositionsDto']>();
	#collections = $state<Collection[]>([]);

	#tools = $state<components['schemas']['ItemDto'][]>([]);
	#pets = $state<components['schemas']['PetDto'][]>([]);

	constructor({
		account,
		selectedProfile,
		profiles,
		member,
		ranks,
	}: {
		account: NonNullable<components['schemas']['MinecraftAccountDto']>;
		selectedProfile: components['schemas']['ProfileDetailsDto'];
		profiles: ProfileDetails[];
		member: NonNullable<components['schemas']['ProfileMemberDto']>;
		ranks: components['schemas']['LeaderboardPositionsDto'];
	}) {
		this.#account = account;
		this.#selectedProfile = selectedProfile;
		this.#profiles = profiles;
		this.#ranks = ranks;

		this.member = member;
	}

	setValues({ account, selectedProfile, profiles, member, ranks }: ConstructorParameters<typeof PlayerStats>[0]) {
		this.#account = account;
		this.#selectedProfile = selectedProfile;
		this.#profiles = profiles;
		this.#ranks = ranks;

		this.member = member;
	}

	get account() {
		return this.#account;
	}

	get uuid() {
		return this.#account?.id ?? '';
	}

	get ign() {
		return this.#account?.name ?? '';
	}

	get selectedProfile() {
		return this.#selectedProfile;
	}

	get profiles() {
		return this.#profiles;
	}

	set member(value) {
		this.#member = value;

		this.#collections = PlayerStats.parseCollections(value);
		this.#tools = this.#member?.farmingWeight.inventory?.tools ?? [];
		this.#pets = this.#member?.pets ?? [];
	}

	get member() {
		return this.#member;
	}

	get garden() {
		return this.#garden;
	}

	get ranks() {
		return this.#ranks;
	}

	get collections() {
		return this.#collections;
	}

	get tools() {
		return this.#tools;
	}

	get pets() {
		return this.#pets;
	}

	static parseCollections(member: NonNullable<components['schemas']['ProfileMemberDto']>) {
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

		return collections;
	}
}

export function initStatsContext(opts: ConstructorParameters<typeof PlayerStats>[0]) {
	const existing = getContext<PlayerStats>('player-stats');
	if (existing) {
		existing.setValues(opts);
		return existing;
	}

	const stats = new PlayerStats(opts);
	setContext('player-stats', stats);
	return stats;
}

export function getStatsContext() {
	const stats = getContext<PlayerStats>('player-stats');
	if (!stats) {
		throw new Error('Stats context not found');
	}
	return stats;
}

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
