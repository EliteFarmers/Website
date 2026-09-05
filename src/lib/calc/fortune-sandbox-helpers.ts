import type { FortuneCompareFieldSection } from '$lib/calc/fortune-compare';
import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
import { getLevelProgress } from '$lib/format';
import type {
	FortuneSandboxPlayerGearSource,
	FortuneSandboxSideData,
} from '$lib/schemas/tool-settings/fortune-sandbox';
import {
	Crop,
	FarmingArmor,
	FarmingPet,
	FarmingTool,
	LotusGear,
	PET_LEVELS,
	PET_RARITY_OFFSETS,
	Rarity,
	ZorroMode,
	getCropMilestoneLevels,
	getCropUpgrades,
	getGardenLevel,
	type EliteItemDto,
	type FarmingPetType,
	type PlayerOptions,
} from 'farming-weight';

export interface RuntimeSideState {
	options: PlayerOptions;
	pet: FarmingPet;
	toolsByCrop: Record<string, FarmingTool>;
	armor: FarmingArmor[];
	equipment: InstanceType<typeof LotusGear>[];
	playerGearSource: FortuneSandboxPlayerGearSource | null;
}

export interface ImportedSandboxState {
	options?: Partial<PlayerOptions>;
	pet?: FarmingPetType;
	tool?: EliteItemDto;
	toolsByCrop?: Record<string, EliteItemDto>;
	armor?: EliteItemDto[];
	equipment?: EliteItemDto[];
	playerGearSource?: FortuneSandboxPlayerGearSource | null;
}

export interface SideImportState {
	searchOpen: boolean;
	searchValue: string;
	loadState: 'idle' | 'loading' | 'loaded' | 'error';
	loadMessage: string;
	loadedPlayerName: string;
	loadedPlayerUuid: string;
	profileOptions: { value: string; label: string }[];
	selectedProfileId: string;
}

export type SandboxMode = 'full' | 'compare';

export const cropKeys = Object.values(Crop).filter((crop) => crop !== Crop.Seeds);

export const defaultPetItem: FarmingPetType = {
	type: 'ELEPHANT',
	uuid: 'sandbox-pet-uuid',
	tier: 'LEGENDARY',
	exp: 25_353_230,
	heldItem: 'GREEN_BANDANA',
};

export const defaultToolItem: EliteItemDto = {
	name: 'Sandbox Tool',
	skyblockId: 'THEORETICAL_HOE_WHEAT_3',
	uuid: 'sandbox-tool-uuid',
	lore: ['LEGENDARY'],
	attributes: {
		modifier: 'blessed',
		levelable_lvl: '50',
		farmed_cultivating: '100000000',
	},
	enchantments: {
		harvesting: 6,
		cultivating: 10,
		dedication: 4,
		turbo_wheat: 5,
	},
};

export const farmingDurationOptions = [
	{ value: 24_000, label: 'Contest (20 minutes)' },
	{ value: 72_000, label: '1 Hour' },
	{ value: 72_000 * 4, label: '4 Hours' },
	{ value: 72_000 * 8, label: '8 Hours' },
	{ value: 72_000 * 12, label: '12 Hours' },
	{ value: 72_000 * 24, label: '24 Hours' },
];

export const compareMetricOptions = [
	{ value: 'bazaarProfit', label: 'Best Bazaar Profit' },
	{ value: 'npcProfit', label: 'NPC Profit' },
];

export const defaultSideNames: Record<'A' | 'B', string> = {
	A: 'Side A',
	B: 'Side B',
};

export const defaultCompareLinkedSections: Record<FortuneCompareFieldSection, boolean> = {
	pet: true,
	tool: true,
	armorEquipment: true,
	stats: true,
};

export const linkSectionLabels: Record<string, string> = {
	pet: 'Pet',
	tool: 'Tool',
	armorEquipment: 'Armor/Equipment',
	stats: 'Stats',
};

function createDefaultCropLevelMap() {
	const map = {} as Partial<Record<Crop, number>>;
	for (const crop of cropKeys) {
		map[crop] = 10;
	}
	return map;
}

export function createDefaultOptions(): PlayerOptions {
	return {
		gardenLevel: 15,
		farmingLevel: 60,
		strength: 0,
		communityCenter: 0,
		filledRosewaterFlask: 0,
		anitaBonus: 5,
		plotsUnlocked: 24,
		uniqueVisitors: 80,
		refinedTruffles: 10,
		cocoaFortuneUpgrade: 10,
		dnaMilestone: 25,
		chips: {},
		attributes: {},
		milestones: createDefaultCropLevelMap(),
		cropUpgrades: createDefaultCropLevelMap(),
		personalBestsUnlocked: true,
		personalBests: {},
		bestiaryKills: {},
		sprayedPlot: false,
		infestedPlotProbability: 0,
		zorro: { enabled: true, mode: ZorroMode.Averaged },
	};
}

export function optionsSnapshot(options: PlayerOptions): PlayerOptions {
	// JSON round-trip instead of structuredClone to handle Svelte 5 $state proxies
	return JSON.parse(JSON.stringify(options)) as PlayerOptions;
}

export function cloneItemDto(item: EliteItemDto): EliteItemDto {
	return {
		...item,
		attributes: { ...(item.attributes ?? {}) },
		enchantments: { ...(item.enchantments ?? {}) },
		lore: [...(item.lore ?? [])],
	};
}

export function toEliteItemDto(item: unknown): EliteItemDto {
	const source = (item ?? {}) as Record<string, unknown>;
	const sourceAttributes = (source.attributes ?? {}) as Record<string, unknown>;
	const sourceEnchants = (source.enchantments ?? {}) as Record<string, unknown>;
	const attributes = Object.fromEntries(
		Object.entries(sourceAttributes).map(([key, value]) => [key, value == null ? null : String(value)])
	);
	const enchantments: Record<string, number> = {};
	for (const [key, value] of Object.entries(sourceEnchants)) {
		const numeric = Number(value) || 0;
		if (numeric > 0) enchantments[key] = numeric;
	}
	return {
		name: String(source.name ?? source.skyblockId ?? 'Imported Item'),
		skyblockId: String(source.skyblockId ?? ''),
		uuid: String(source.uuid ?? crypto.randomUUID()),
		lore: Array.isArray(source.lore) ? source.lore.map((entry) => String(entry)) : [],
		attributes,
		enchantments,
	};
}

export function createDefaultTool(crop: Crop, options: PlayerOptions) {
	return new FarmingTool(
		{
			...defaultToolItem,
			uuid: `sandbox-tool-${String(crop).toLowerCase()}`,
		},
		optionsSnapshot(options)
	);
}

export function createDefaultToolMap(options: PlayerOptions) {
	const map: Record<string, FarmingTool> = {};
	for (const crop of cropKeys) {
		map[String(crop)] = createDefaultTool(crop, options);
	}
	return map;
}

export function createSideImportState(): SideImportState {
	return {
		searchOpen: false,
		searchValue: '',
		loadState: 'idle',
		loadMessage: '',
		loadedPlayerName: '',
		loadedPlayerUuid: '',
		profileOptions: [],
		selectedProfileId: '',
	};
}

export function normalizeSideName(value: unknown, fallback: string) {
	const parsed = typeof value === 'string' ? value.trim() : '';
	if (!parsed) return fallback;
	return parsed.slice(0, 64);
}

export function normalizePlayerGearSource(source: unknown): FortuneSandboxPlayerGearSource | null {
	if (!source || typeof source !== 'object') return null;
	const input = source as Record<string, unknown>;
	const playerName = String(input.playerName ?? '').trim();
	if (!playerName) return null;
	const playerUuid = String(input.playerUuid ?? '').trim();
	const profileId = String(input.profileId ?? '').trim();
	const profileName = String(input.profileName ?? '').trim();
	return {
		playerName,
		playerUuid: playerUuid || undefined,
		profileId: profileId || undefined,
		profileName: profileName || undefined,
	};
}

export function createRuntimeSide(source?: Partial<FortuneSandboxSideData>): RuntimeSideState {
	const options = {
		...createDefaultOptions(),
		...((source?.options ?? {}) as Partial<PlayerOptions>),
	} as PlayerOptions;
	const petInput = {
		...defaultPetItem,
		...((source?.pet ?? {}) as Partial<FarmingPetType>),
	} as FarmingPetType;
	const side: RuntimeSideState = {
		options,
		pet: new FarmingPet(petInput, optionsSnapshot(options)),
		toolsByCrop: createDefaultToolMap(options),
		armor: Array.isArray(source?.armor)
			? FarmingArmor.fromArray(
					source.armor.map((piece) => toEliteItemDto(piece)),
					optionsSnapshot(options)
				)
			: [],
		equipment: Array.isArray(source?.equipment)
			? LotusGear.fromArray(
					source.equipment.map((piece) => toEliteItemDto(piece)),
					optionsSnapshot(options)
				)
			: [],
		playerGearSource: normalizePlayerGearSource(source?.source?.playerGear ?? null),
	};

	if (source?.toolsByCrop && Object.keys(source.toolsByCrop).length > 0) {
		const nextMap: Record<string, FarmingTool> = {};
		for (const [cropId, item] of Object.entries(source.toolsByCrop)) {
			nextMap[cropId] = new FarmingTool(
				{ ...defaultToolItem, ...toEliteItemDto(item) },
				optionsSnapshot(options)
			);
		}
		side.toolsByCrop = {
			...side.toolsByCrop,
			...nextMap,
		};
	} else if (source?.tool) {
		side.toolsByCrop[String(Crop.Wheat)] = new FarmingTool(
			{
				...defaultToolItem,
				...toEliteItemDto(source.tool),
			},
			optionsSnapshot(options)
		);
	}

	return side;
}

export function runtimeSideToData(side: RuntimeSideState, selectedCrop: Crop): FortuneSandboxSideData {
	return {
		options: optionsSnapshot(side.options) as FortuneSandboxSideData['options'],
		pet: { ...side.pet.pet },
		tool: side.toolsByCrop[String(selectedCrop)]
			? cloneItemDto(side.toolsByCrop[String(selectedCrop)]!.item)
			: undefined,
		toolsByCrop: Object.fromEntries(
			Object.entries(side.toolsByCrop).map(([crop, tool]) => [crop, cloneItemDto(tool.item)])
		),
		armor: side.armor.map((piece) => cloneItemDto(piece.item)),
		equipment: side.equipment.map((piece) => cloneItemDto(piece.item)),
		source: side.playerGearSource
			? {
					playerGear: { ...side.playerGearSource },
				}
			: undefined,
	} as FortuneSandboxSideData;
}

export function mapToolsByCrop(items: EliteItemDto[], options: PlayerOptions) {
	const map: Record<string, EliteItemDto> = {};
	for (const item of items) {
		const tool = new FarmingTool(item, optionsSnapshot(options));
		for (const crop of tool.crops) {
			const previous = map[crop];
			if (!previous) {
				map[crop] = item;
				continue;
			}
			const previousTool = new FarmingTool(previous, optionsSnapshot(options));
			if (tool.level > previousTool.level) {
				map[crop] = item;
			}
		}
	}
	return map;
}

export function extractImportedOptions(member: unknown): Partial<PlayerOptions> {
	const source = (member ?? {}) as Record<string, unknown>;
	const garden = (source.garden ?? {}) as Record<string, unknown>;
	const jacob = (source.jacob ?? {}) as Record<string, unknown>;
	const jacobPerks = (jacob.perks ?? {}) as Record<string, unknown>;
	const jacobStats = (jacob.stats ?? {}) as Record<string, unknown>;
	const skills = (source.skills ?? {}) as Record<string, unknown>;
	const memberData = (source.memberData ?? {}) as Record<string, unknown>;
	const memberDataGarden = (memberData.garden ?? {}) as Record<string, unknown>;
	const unparsed = (source.unparsed ?? {}) as Record<string, unknown>;
	const bestiary = (unparsed.bestiary ?? {}) as Record<string, unknown>;
	const chocolateFactory = (source.chocolateFactory ?? {}) as Record<string, unknown>;

	return {
		farmingLevel: getLevelProgress(
			'farming',
			Number(skills.farming) || 0,
			(Number(jacobPerks.levelCap) || 0) + DEFAULT_SKILL_CAPS.farming
		).level,
		gardenLevel: getGardenLevel(Number(garden.experience) || 0).level,
		uniqueVisitors: Number(garden.uniqueVisitors) || 0,
		anitaBonus: Number(jacobPerks.doubleDrops) || 0,
		milestones: getCropMilestoneLevels((garden.crops ?? {}) as Record<string, number>),
		cropUpgrades: getCropUpgrades((garden.cropUpgrades ?? {}) as Record<string, number>),
		personalBestsUnlocked: Boolean(jacobPerks.personalBests),
		personalBests: (jacobStats.personalBests ?? {}) as Record<string, number>,
		refinedTruffles: Number(chocolateFactory.refinedTrufflesConsumed) || 0,
		cocoaFortuneUpgrade: Number(chocolateFactory.cocoaFortuneUpgrades) || 0,
		dnaMilestone: Number(unparsed.dnaMilestone) || 0,
		attributes: (memberData.attributes ?? {}) as Record<string, number>,
		chips: (memberDataGarden.chips ?? {}) as Record<string, number>,
		bestiaryKills: ((bestiary as { kills?: Record<string, number> }).kills ?? {}) as Record<string, number>,
	};
}

export function getXpForLevel(level: number, rarity: Rarity) {
	const offset = PET_RARITY_OFFSETS[rarity] ?? 0;
	let exp = 0;
	for (let i = offset; i < offset + level - 1; i++) {
		exp += PET_LEVELS[i] ?? 0;
	}
	return exp;
}

export function formatDeltaPercent(a: number, b: number) {
	if (Math.abs(a) < 1e-9) {
		return b === 0 ? '0.00%' : 'N/A';
	}
	return `${(((b - a) / a) * 100).toFixed(2)}%`;
}

export function formatSigned(value: number, decimals = 2) {
	const sign = value >= 0 ? '+' : '';
	return `${sign}${value.toFixed(decimals)}`;
}

export function compareBreakdown(a: Record<string, number> | undefined, b: Record<string, number> | undefined) {
	const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
	return [...keys]
		.map((key) => {
			const valueA = a?.[key] ?? 0;
			const valueB = b?.[key] ?? 0;
			return { key, valueA, valueB, delta: valueB - valueA };
		})
		.filter((entry) => Math.abs(entry.delta) > 1e-9)
		.sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta));
}

export function collectBazaarItemIds(
	results: (import('farming-weight').DetailedDropsFromEffectsResult | null | undefined)[]
) {
	const ids: Record<string, true> = {};
	for (const result of results) {
		if (!result) continue;
		for (const key of Object.keys(result.items ?? {})) ids[key] = true;
		for (const key of Object.keys(result.rngItems ?? {})) ids[key] = true;
	}
	delete ids[''];
	return Object.keys(ids);
}
