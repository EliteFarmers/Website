import type {
	ItemDto,
	LeaderboardRanksResponse,
	MinecraftAccountDto,
	PetDto,
	ProfileDetailsDto,
	ProfileMemberDto,
	WeightStyleWithDataDto,
} from '$lib/api';
import type { ProfileDetails } from '$lib/api/elite';
import { API_CROP_TO_CROP, PROPER_CROP_NAME, PROPER_CROP_TO_MINION } from '$lib/constants/crops';
import { CROP_TO_PEST } from '$lib/constants/pests';
import { formatIgn, getRankInformation } from '$lib/format';
import { getMemberRanks, getProfileMember } from '$lib/remote';
import { type RemoteQuery } from '@sveltejs/kit';
import { Crop, getCropFromName } from 'farming-weight';
import { getContext, setContext } from 'svelte';
import { getRatesData } from './ratesData';

export class PlayerStats {
	#account = $state<NonNullable<MinecraftAccountDto>>(null!);
	#selectedProfile = $state<ProfileDetailsDto>();
	#profiles = $state<ProfileDetails[]>();
	#member = $state<RemoteQuery<ProfileMemberDto | undefined>>(null!);
	#ranks = $state<RemoteQuery<LeaderboardRanksResponse | undefined>>(null!);
	#filteredRanks = $derived<LeaderboardRanksResponse['ranks'] | null>(
		Object.fromEntries(Object.entries(this.#ranks?.current?.ranks ?? {}).filter((r) => r[1].rank <= 10_000))
	);
	#collections = $derived<Collection[]>(PlayerStats.parseCollections(this.#member.current));
	#fortuneSettings = $derived(
		this.#account.settings?.fortune?.accounts?.[this.uuid]?.[this.selectedProfile?.profileId ?? ''] ?? null
	);
	#style = $state.raw<WeightStyleWithDataDto | undefined>(undefined);

	#tools = $state.raw<ItemDto[]>([]);
	#pets = $state.raw<PetDto[]>([]);
	#armor = $state.raw<ItemDto[]>([]);
	#equipment = $state.raw<ItemDto[]>([]);

	#garden = $derived.by(() => this.#member.current?.garden);
	#rank = $derived.by(() => getRankInformation(this.#account.playerData));
	#ignMeta = $derived.by(() => formatIgn(this.#account?.name, this.#member.current?.meta));

	constructor(data: {
		account: NonNullable<MinecraftAccountDto>;
		selectedProfile: ProfileDetailsDto;
		profiles: ProfileDetails[];
		// member: Promise<ProfileMemberDto | undefined>;
		// ranks: Promise<LeaderboardRanksResponse | undefined>;
		style?: WeightStyleWithDataDto;
	}) {
		this.setValues(data);
	}

	async setValues({
		account,
		selectedProfile,
		profiles,
		// member,
		// ranks,
		style,
	}: ConstructorParameters<typeof PlayerStats>[0]) {
		this.#account = account;
		this.#selectedProfile = selectedProfile;
		this.#profiles = profiles;
		this.#style = style;

		if (this.fortuneSettings) {
			const ratesData = getRatesData();
			ratesData.update((data) => {
				data.communityCenter = this.fortuneSettings?.communityCenter ?? data.communityCenter;
				data.strength = this.fortuneSettings?.strength ?? data.strength;
				data.attributes = this.fortuneSettings?.attributes ?? data.attributes;
				data.exported = (this.fortuneSettings?.exported as Record<Crop, boolean>) ?? data.exported;
				return data;
			});
		}

		const memberData = getProfileMember({
			playerUuid: account.id,
			profileUuid: selectedProfile?.profileId ?? '',
		});

		const memberRanks = getMemberRanks({
			playerUuid: account.id,
			profileUuid: selectedProfile?.profileId ?? '',
		});

		this.#ranks = memberRanks;
		this.member = memberData;

		$effect(() => {
			console.log(this.#member.current);
			this.#tools = $state.snapshot(this.#member.current?.farmingWeight.inventory?.tools ?? []);
			this.#pets = $state.snapshot(this.#member.current?.pets ?? []);
			this.#armor = $state.snapshot(this.#member.current?.farmingWeight.inventory?.armor ?? []);
			this.#equipment = $state.snapshot(this.#member.current?.farmingWeight.inventory?.equipment ?? []);
		});
	}

	get account() {
		return this.#account;
	}

	get style() {
		return this.#style;
	}

	get uuid() {
		return this.#account?.id ?? '';
	}

	get ign() {
		return this.#account?.name ?? '';
	}

	get ignMeta() {
		return this.#ignMeta;
	}

	get rank() {
		return this.#rank;
	}

	get fortuneSettings() {
		return this.#fortuneSettings;
	}

	get selectedProfile() {
		return this.#selectedProfile;
	}

	get profiles() {
		return this.#profiles;
	}

	set member(value) {
		this.#member = value;
	}

	get member() {
		return this.#member;
	}

	get garden() {
		return this.#garden;
	}

	get ranks() {
		return this.#filteredRanks ?? {};
	}

	get allRanks() {
		return this.#ranks.current?.ranks ?? {};
	}

	get collections() {
		return this.#collections;
	}

	get tools() {
		return this.#tools ?? [];
	}

	get pets() {
		return this.#pets ?? [];
	}

	get armor() {
		return this.#armor ?? [];
	}

	get equipment() {
		return this.#equipment ?? [];
	}

	static parseCollections(member: ProfileMemberDto | undefined) {
		if (!member) return [];

		const collections = Object.entries(member.collections ?? {})
			.filter(([key]) => PROPER_CROP_NAME[key])
			.map(([key, value]) => ({
				key: API_CROP_TO_CROP[key as keyof typeof API_CROP_TO_CROP],
				name: PROPER_CROP_NAME[key],
				value: Number(value),
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
