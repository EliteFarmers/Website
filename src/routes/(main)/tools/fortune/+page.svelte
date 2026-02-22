<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Head from '$comp/head.svelte';
	import CropSelector from '$comp/stats/contests/crop-selector.svelte';
	import FortuneDiffPanel from '$comp/tools/fortune/fortune-diff-panel.svelte';
	import FortuneResultPanel from '$comp/tools/fortune/fortune-result-panel.svelte';
	import FortuneShareControls from '$comp/tools/fortune/fortune-share-controls.svelte';
	import FortuneSideImport from '$comp/tools/fortune/fortune-side-import.svelte';
	import FortuneSideEditor from '$comp/tools/fortune/fortune-side-editor.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import {
		calculateBestBazaarProfit,
		getFortuneBreakEvenFields,
		scanFortuneBreakEven,
		type FortuneBreakEvenScanResult,
		type FortuneCompareDiffMode,
		type FortuneCompareFieldDefinition,
		type FortuneCompareFieldRange,
		type FortuneCompareFieldSection,
		type FortuneCompareMetric,
		type FortuneCompareSideKey,
	} from '$lib/calc/fortune-compare';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getFortuneSandboxShare, getProfileMember, getProfilesAccount } from '$lib/remote';
	import { getItems } from '$lib/remote/items.remote';
	import {
		FORTUNE_SANDBOX_TOOL_SETTING_LEGACY_VERSION,
		FORTUNE_SANDBOX_TOOL_SETTING_VERSION,
		type FortuneSandboxAnyToolSettingData,
		type FortuneSandboxCompareState,
		type FortuneSandboxPlayerGearSource,
		type FortuneSandboxSideData,
		type FortuneSandboxToolSettingData,
	} from '$lib/schemas/tool-settings/fortune-sandbox';
	import { getRatesData } from '$lib/stores/ratesData';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	import * as Accordion from '$ui/accordion';
	import { Label } from '$ui/label';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import * as Tabs from '$ui/tabs';
	import {
		ArmorSet,
		calculateDetailedAverageDrops,
		createFarmingPlayer,
		Crop,
		FARMING_PETS,
		FarmingArmor,
		FarmingPet,
		FarmingPets,
		FarmingTool,
		getCropFromName,
		getCropMilestoneLevels,
		getCropUpgrades,
		getGardenLevel,
		LotusGear,
		PET_LEVELS,
		PET_RARITY_OFFSETS,
		Rarity,
		ZorroMode,
		type DetailedDropsResult,
		type EliteItemDto,
		type FarmingPetType,
		type PlayerOptions,
	} from 'farming-weight';
	import { watch } from 'runed';
	import { onMount, untrack } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type SideKey = FortuneCompareSideKey;
	type LinkSection = FortuneCompareFieldSection;

	interface RuntimeSideState {
		options: PlayerOptions;
		pet: FarmingPet;
		toolsByCrop: Record<string, FarmingTool>;
		armor: FarmingArmor[];
		equipment: InstanceType<typeof LotusGear>[];
		playerGearSource: FortuneSandboxPlayerGearSource | null;
	}

	interface ImportedSandboxState {
		options?: Partial<PlayerOptions>;
		pet?: FarmingPetType;
		tool?: EliteItemDto;
		toolsByCrop?: Record<string, EliteItemDto>;
		armor?: EliteItemDto[];
		equipment?: EliteItemDto[];
		playerGearSource?: FortuneSandboxPlayerGearSource | null;
	}

	interface SideImportState {
		searchOpen: boolean;
		searchValue: string;
		loadState: 'idle' | 'loading' | 'loaded' | 'error';
		loadMessage: string;
		loadedPlayerName: string;
		loadedPlayerUuid: string;
		profileOptions: { value: string; label: string }[];
		selectedProfileId: string;
	}

	interface NormalizedSharedSetup {
		sideA: FortuneSandboxSideData;
		sideB: FortuneSandboxSideData;
		compare: {
			enabled: boolean;
			activeSide: SideKey;
			linkedSections: Record<LinkSection, boolean>;
			diff: {
				mode: FortuneCompareDiffMode;
				metric: FortuneCompareMetric;
				fieldId: string;
				range: FortuneCompareFieldRange;
				scanSide: SideKey;
			};
		};
	}

	const gbl = getGlobalContext();
	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();
	const cropKeys = Object.values(Crop).filter((crop) => crop !== Crop.Seeds);
	const defaultCompareLinkedSections: Record<LinkSection, boolean> = {
		pet: true,
		tool: true,
		armorEquipment: true,
		stats: true,
	};
	const linkSectionLabels: Record<LinkSection, string> = {
		pet: 'Pet',
		tool: 'Tool',
		armorEquipment: 'Armor/Equipment',
		stats: 'Stats',
	};
	const farmingDurationOptions = [
		{ value: 24_000, label: 'Contest (20 minutes)' },
		{ value: 72_000, label: '1 Hour' },
		{ value: 72_000 * 4, label: '4 Hours' },
		{ value: 72_000 * 8, label: '8 Hours' },
		{ value: 72_000 * 12, label: '12 Hours' },
		{ value: 72_000 * 24, label: '24 Hours' },
	];
	const compareMetricOptions = [
		{ value: 'bazaarProfit', label: 'Best Bazaar Profit' },
		{ value: 'npcProfit', label: 'NPC Profit' },
	];
	const compareSideOptions = [
		{ value: 'A', label: 'Side A' },
		{ value: 'B', label: 'Side B' },
	];

	const defaultPetItem: FarmingPetType = {
		type: FarmingPets.Elephant,
		uuid: 'sandbox-pet-uuid',
		tier: 'LEGENDARY',
		exp: 25_353_230,
		heldItem: 'GREEN_BANDANA',
	};

	const defaultToolItem: EliteItemDto = {
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

	function createDefaultCropLevelMap() {
		const map = {} as Partial<Record<Crop, number>>;
		for (const crop of cropKeys) {
			map[crop] = 10;
		}
		return map;
	}

	function createDefaultOptions(): PlayerOptions {
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

	function optionsSnapshot(options: PlayerOptions): PlayerOptions {
		return $state.snapshot(options) as PlayerOptions;
	}

	function cloneItemDto(item: EliteItemDto): EliteItemDto {
		return {
			...item,
			attributes: { ...(item.attributes ?? {}) },
			enchantments: { ...(item.enchantments ?? {}) },
			lore: [...(item.lore ?? [])],
		};
	}

	function createDefaultTool(crop: Crop, options: PlayerOptions) {
		return new FarmingTool(
			{
				...defaultToolItem,
				uuid: `sandbox-tool-${String(crop).toLowerCase()}`,
			},
			optionsSnapshot(options)
		);
	}

	function createDefaultToolMap(options: PlayerOptions) {
		const map: Record<string, FarmingTool> = {};
		for (const crop of cropKeys) {
			map[String(crop)] = createDefaultTool(crop, options);
		}
		return map;
	}

	function createSideImportState(): SideImportState {
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

	function getSideImportState(sideKey: SideKey) {
		return sideKey === 'A' ? sideAImportState : sideBImportState;
	}

	function extractImportedOptions(member: unknown): Partial<PlayerOptions> {
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
			bestiaryKills: ((bestiary as { kills?: Record<string, number> }).kills ?? {}) as Record<
				string,
				number
			>,
		};
	}

	function normalizePlayerGearSource(source: unknown): FortuneSandboxPlayerGearSource | null {
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

	function toEliteItemDto(item: unknown): EliteItemDto {
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

	function createRuntimeSide(source?: Partial<FortuneSandboxSideData>): RuntimeSideState {
		const options = {
			...createDefaultOptions(),
			...((source?.options ?? {}) as Partial<PlayerOptions>),
		} as PlayerOptions;
		const petInput = {
			...defaultPetItem,
			...((source?.pet ?? {}) as Partial<FarmingPetType>),
		} as FarmingPetType;
		const side = {
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
		} satisfies RuntimeSideState;

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

	function runtimeSideToData(side: RuntimeSideState, selectedCrop: Crop): FortuneSandboxSideData {
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

	function patchRuntimeSide(sideKey: SideKey, mutator: (current: FortuneSandboxSideData) => void) {
		const currentSide = sideKey === 'A' ? sideA : sideB;
		const current = runtimeSideToData(currentSide, selectedCropKey);
		mutator(current);
		const next = createRuntimeSide(current);
		if (sideKey === 'A') {
			sideA = next;
			return;
		}
		sideB = next;
	}

	function cloneSectionFromA(section: LinkSection) {
		const sourceA = runtimeSideToData(sideA, selectedCropKey);
		patchRuntimeSide('B', (sideData) => {
			if (section === 'pet') {
				sideData.pet = sourceA.pet ? { ...sourceA.pet } : undefined;
			}
			if (section === 'tool') {
				sideData.toolsByCrop = Object.fromEntries(
					Object.entries(sourceA.toolsByCrop ?? {}).map(([cropId, item]) => [
						cropId,
						cloneItemDto(item as EliteItemDto),
					])
				);
				sideData.tool = sourceA.tool ? cloneItemDto(sourceA.tool as EliteItemDto) : undefined;
			}
			if (section === 'armorEquipment') {
				sideData.armor = (sourceA.armor ?? []).map((piece) => cloneItemDto(piece as EliteItemDto));
				sideData.equipment = (sourceA.equipment ?? []).map((piece) => cloneItemDto(piece as EliteItemDto));
			}
			if (section === 'stats') {
				sideData.options = optionsSnapshot(sideA.options) as FortuneSandboxSideData['options'];
			}
		});
	}

	function setSectionLinked(section: LinkSection, next: boolean) {
		compareLinkedSections = {
			...compareLinkedSections,
			[section]: next,
		};
		if (next) {
			cloneSectionFromA(section);
		}
	}

	function ensureSectionEditable(sideKey: SideKey, section: LinkSection) {
		if (!compareMode || sideKey !== 'B' || !compareLinkedSections[section]) return;
		cloneSectionFromA(section);
		compareLinkedSections = {
			...compareLinkedSections,
			[section]: false,
		};
	}

	function onSectionInteraction(sideKey: SideKey, section: LinkSection) {
		compareActiveSide = sideKey;
		ensureSectionEditable(sideKey, section);
	}

	function setCompareMode(next: boolean) {
		if (next) {
			simpleMode = false;
			compareMode = true;
			compareActiveSide = 'A';
			sideB = createRuntimeSide(runtimeSideToData(sideA, selectedCropKey));
			compareLinkedSections = { ...defaultCompareLinkedSections };
			compareMobileTab = 'A';
			return;
		}
		compareMode = false;
	}

	function getXpForLevel(level: number, rarity: Rarity) {
		const offset = PET_RARITY_OFFSETS[rarity] ?? 0;
		let exp = 0;
		for (let i = offset; i < offset + level - 1; i++) {
			exp += PET_LEVELS[i] ?? 0;
		}
		return exp;
	}

	function mapToolsByCrop(items: EliteItemDto[], options: PlayerOptions) {
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

	function applyImportedSetupToSide(
		sideKey: SideKey,
		imported: ImportedSandboxState,
		mode: 'merge' | 'replace' = 'replace'
	) {
		patchRuntimeSide(sideKey, (sideData) => {
			if (mode === 'replace') {
				sideData.options = createDefaultOptions() as FortuneSandboxSideData['options'];
			}
			if (imported.options) {
				sideData.options = {
					...(sideData.options ?? {}),
					...(imported.options as Partial<PlayerOptions>),
				} as FortuneSandboxSideData['options'];
			}
			if (mode === 'replace' || imported.pet) {
				sideData.pet = {
					...defaultPetItem,
					...(imported.pet ?? {}),
				};
			}
			if (mode === 'replace') {
				sideData.toolsByCrop = {};
				sideData.tool = undefined;
			}
			if (imported.toolsByCrop && Object.keys(imported.toolsByCrop).length > 0) {
				sideData.toolsByCrop = Object.fromEntries(
					Object.entries(imported.toolsByCrop).map(([crop, item]) => [crop, toEliteItemDto(item)])
				);
				sideData.tool = imported.toolsByCrop[String(selectedCropKey)]
					? toEliteItemDto(imported.toolsByCrop[String(selectedCropKey)]!)
					: sideData.tool;
			} else if (imported.tool) {
				sideData.toolsByCrop ??= {};
				sideData.toolsByCrop[String(selectedCropKey)] = cloneItemDto(imported.tool);
				sideData.tool = cloneItemDto(imported.tool);
			}
			if (mode === 'replace') {
				sideData.armor = [];
			}
			if (imported.armor) {
				sideData.armor = imported.armor.map((item) => toEliteItemDto(item));
			}
			if (mode === 'replace') {
				sideData.equipment = [];
			}
			if (imported.equipment) {
				sideData.equipment = imported.equipment.map((item) => toEliteItemDto(item));
			}
			if (mode === 'replace') {
				sideData.source = imported.playerGearSource
					? {
							playerGear: imported.playerGearSource,
						}
					: undefined;
			} else if (imported.playerGearSource !== undefined) {
				sideData.source = imported.playerGearSource
					? {
							playerGear: imported.playerGearSource,
						}
					: undefined;
			}
		});
	}

	function unlinkImportedSections(targetSide: SideKey) {
		if (!compareMode || targetSide !== 'B') return;
		compareLinkedSections = {
			pet: false,
			tool: false,
			armorEquipment: false,
			stats: false,
		};
	}

	function getLoginRedirectHref() {
		return '/login?redirect=' + encodeURIComponent(page.url.pathname + page.url.search + page.url.hash);
	}

	function normalizeSharedSetup(setting: FortuneSandboxAnyToolSettingData): NormalizedSharedSetup {
		if (setting.schemaVersion === FORTUNE_SANDBOX_TOOL_SETTING_LEGACY_VERSION) {
			const legacySide = {
				options: setting.options,
				pet: setting.pet,
				tool: setting.tool,
				toolsByCrop: setting.toolsByCrop,
				armor: setting.armor,
				equipment: setting.equipment,
				source: setting.source,
			} satisfies FortuneSandboxSideData;
			return {
				sideA: legacySide,
				sideB: structuredClone(legacySide),
				compare: {
					enabled: false,
					activeSide: 'A',
					linkedSections: { ...defaultCompareLinkedSections },
					diff: {
						mode: 'summary',
						metric: 'bazaarProfit',
						fieldId: '',
						range: { start: 1, end: 100, step: 1 },
						scanSide: 'B',
					},
				},
			};
		}

		const compareState = (setting.compare ?? {}) as NonNullable<FortuneSandboxCompareState>;
		return {
			sideA: setting.sides.A,
			sideB: setting.sides.B ?? structuredClone(setting.sides.A),
			compare: {
				enabled: compareState.enabled ?? false,
				activeSide: compareState.activeSide ?? 'A',
				linkedSections: {
					pet: compareState.linkedSections?.pet ?? true,
					tool: compareState.linkedSections?.tool ?? true,
					armorEquipment: compareState.linkedSections?.armorEquipment ?? true,
					stats: compareState.linkedSections?.stats ?? true,
				},
				diff: {
					mode: compareState.diff?.mode ?? 'summary',
					metric: compareState.diff?.metric ?? 'bazaarProfit',
					fieldId: compareState.diff?.fieldId ?? '',
					range: compareState.diff?.range ?? { start: 1, end: 100, step: 1 },
					scanSide: compareState.diff?.scanSide ?? 'B',
				},
			},
		};
	}

	function applyNormalizedSharedSetup(normalized: NormalizedSharedSetup) {
		sideA = createRuntimeSide(normalized.sideA);
		sideB = createRuntimeSide(normalized.sideB);
		compareMode = normalized.compare.enabled;
		compareActiveSide = normalized.compare.activeSide;
		compareLinkedSections = { ...normalized.compare.linkedSections };
		diffMode = normalized.compare.diff.mode;
		diffMetric = normalized.compare.diff.metric;
		diffFieldId = normalized.compare.diff.fieldId;
		diffRange = { ...normalized.compare.diff.range };
		diffScanSide = normalized.compare.diff.scanSide;
		diffResult = null;
		diffMessage = '';
		if (compareMode) {
			simpleMode = false;
		}
	}

	function createSharePayload(): FortuneSandboxToolSettingData {
		return {
			schemaVersion: FORTUNE_SANDBOX_TOOL_SETTING_VERSION as 2,
			sides: {
				A: runtimeSideToData(sideA, selectedCropKey),
				B: compareMode ? runtimeSideToData(sideB, selectedCropKey) : undefined,
			},
			compare: {
				enabled: compareMode,
				activeSide: compareActiveSide,
				linkedSections: compareMode ? compareLinkedSections : undefined,
				diff: {
					mode: diffMode,
					metric: diffMetric,
					fieldId: diffFieldId || undefined,
					range: diffRange,
					scanSide: diffScanSide,
				},
			},
		};
	}

	async function importSharedSetup(settingId: string) {
		const sharedSetup = await getFortuneSandboxShare({ settingId });
		if (sharedSetup.error === 'Unauthorized') {
			await goto(getLoginRedirectHref());
			return;
		}
		if (sharedSetup.error || !sharedSetup.setting) {
			importMessage = sharedSetup.error ?? 'Failed to import shared setup';
			return;
		}

		const normalized = normalizeSharedSetup(sharedSetup.setting);
		applyNormalizedSharedSetup(normalized);
		importMessage = '';
		loadedSharedSetup = {
			name: sharedSetup.name?.trim() || 'Shared Setup',
			description: sharedSetup.description?.trim() || '',
			compareEnabled: normalized.compare.enabled,
			sideSources: {
				A: normalizePlayerGearSource(normalized.sideA.source?.playerGear ?? null),
				B: normalizePlayerGearSource(normalized.sideB.source?.playerGear ?? null),
			},
		};
	}

	async function loadPlayer(nameOrId: string, targetSide: SideKey) {
		const sideImportState = getSideImportState(targetSide);
		const query = nameOrId.trim();
		sideImportState.searchValue = query;
		if (!query) {
			sideImportState.loadState = 'error';
			sideImportState.loadMessage = 'Enter a player name first';
			return;
		}

		sideImportState.loadState = 'loading';
		sideImportState.loadMessage = '';

		try {
			const accountData = await getProfilesAccount({
				id: query.replaceAll('-', ''),
				profile: sideImportState.selectedProfileId || undefined,
			});
			if ('code' in accountData) {
				sideImportState.loadState = 'error';
				sideImportState.loadMessage = accountData.error ?? 'Player not found';
				return;
			}

			const account = accountData.account;
			const activeProfile = accountData.profile;
			const profiles = accountData.profiles ?? [];
			if (!account?.id || !account.name || !activeProfile?.profileId) {
				sideImportState.loadState = 'error';
				sideImportState.loadMessage = 'No active profiles found';
				return;
			}

			const activeProfileId = activeProfile.profileId;
			sideImportState.profileOptions = profiles.map((profile) => ({
				value: profile.id,
				label: profile.name,
			}));
			sideImportState.selectedProfileId = activeProfileId;
			sideImportState.loadedPlayerName = account.name;
			sideImportState.loadedPlayerUuid = account.id;

			const member = await getProfileMember({
				playerUuid: account.id,
				profileUuid: activeProfileId,
			});
			const inventory = member?.farmingWeight?.inventory;
			const farmingPets = FarmingPet.fromArray(member?.pets ?? []);
			const bestPet = [...farmingPets].sort((a, b) => b.fortune - a.fortune)[0];
			const importedOptions = extractImportedOptions(member);
			const importedOptionSnapshot = {
				...createDefaultOptions(),
				...importedOptions,
			} as PlayerOptions;
			const importedTools = (inventory?.tools ?? []).map((item) => toEliteItemDto(item));
			const importedArmor = (inventory?.armor ?? []).map((item) => toEliteItemDto(item));
			const importedEquipment = (inventory?.equipment ?? []).map((item) => toEliteItemDto(item));
			const importedToolsByCrop = mapToolsByCrop(importedTools, importedOptionSnapshot);

			const importedData: ImportedSandboxState = {
				options: importedOptions,
				pet: bestPet?.pet,
				tool: importedTools[0],
				toolsByCrop: importedToolsByCrop,
				armor: importedArmor,
				equipment: importedEquipment,
				playerGearSource: {
					playerName: account.name,
					playerUuid: account.id,
					profileId: activeProfileId,
					profileName: activeProfile.profileName || undefined,
				},
			};
			if (targetSide === 'B') {
				unlinkImportedSections(targetSide);
			}
			applyImportedSetupToSide(targetSide, importedData, 'replace');
			compareActiveSide = targetSide;
			sideImportState.loadState = 'loaded';
			sideImportState.loadMessage = `Loaded ${sideImportState.loadedPlayerName}${activeProfile.profileName ? ` (${activeProfile.profileName})` : ''} to Side ${targetSide}`;
		} catch {
			sideImportState.loadState = 'error';
			sideImportState.loadMessage = 'Failed to load player data';
		}
	}

	async function reloadSelectedProfile(targetSide: SideKey) {
		const sideImportState = getSideImportState(targetSide);
		if (!sideImportState.loadedPlayerUuid || !sideImportState.selectedProfileId) return;
		sideImportState.loadState = 'loading';
		sideImportState.loadMessage = '';
		try {
			const member = await getProfileMember({
				playerUuid: sideImportState.loadedPlayerUuid,
				profileUuid: sideImportState.selectedProfileId,
			});
			const inventory = member?.farmingWeight?.inventory;
			const farmingPets = FarmingPet.fromArray(member?.pets ?? []);
			const bestPet = [...farmingPets].sort((a, b) => b.fortune - a.fortune)[0];
			const importedOptions = extractImportedOptions(member);
			const importedOptionSnapshot = {
				...createDefaultOptions(),
				...importedOptions,
			} as PlayerOptions;
			const importedTools = (inventory?.tools ?? []).map((item) => toEliteItemDto(item));
			const importedArmor = (inventory?.armor ?? []).map((item) => toEliteItemDto(item));
			const importedEquipment = (inventory?.equipment ?? []).map((item) => toEliteItemDto(item));
			const importedToolsByCrop = mapToolsByCrop(importedTools, importedOptionSnapshot);
			const selectedProfileLabel =
				sideImportState.profileOptions.find((option) => option.value === sideImportState.selectedProfileId)
					?.label ?? undefined;
			const importedData: ImportedSandboxState = {
				options: importedOptions,
				pet: bestPet?.pet,
				tool: importedTools[0],
				toolsByCrop: importedToolsByCrop,
				armor: importedArmor,
				equipment: importedEquipment,
				playerGearSource: {
					playerName: sideImportState.loadedPlayerName || 'Imported Player',
					playerUuid: sideImportState.loadedPlayerUuid || undefined,
					profileId: sideImportState.selectedProfileId || undefined,
					profileName: selectedProfileLabel,
				},
			};
			if (targetSide === 'B') {
				unlinkImportedSections(targetSide);
			}
			applyImportedSetupToSide(targetSide, importedData, 'replace');
			compareActiveSide = targetSide;
			sideImportState.loadState = 'loaded';
			sideImportState.loadMessage = `Loaded ${sideImportState.loadedPlayerName}${selectedProfileLabel ? ` (${selectedProfileLabel})` : ''} to Side ${targetSide}`;
		} catch {
			sideImportState.loadState = 'error';
			sideImportState.loadMessage = 'Failed to load selected profile';
		}
	}

	function formatDeltaPercent(a: number, b: number) {
		if (Math.abs(a) < 1e-9) {
			return b === 0 ? '0.00%' : 'N/A';
		}
		return `${(((b - a) / a) * 100).toFixed(2)}%`;
	}

	function formatSigned(value: number, decimals = 2) {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(decimals)}`;
	}

	function compareBreakdown(a: Record<string, number> | undefined, b: Record<string, number> | undefined) {
		const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
		return [...keys]
			.map((key) => {
				const valueA = a?.[key] ?? 0;
				const valueB = b?.[key] ?? 0;
				return {
					key,
					valueA,
					valueB,
					delta: valueB - valueA,
				};
			})
			.filter((entry) => Math.abs(entry.delta) > 1e-9)
			.sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta));
	}

	function collectBazaarItemIds(results: (DetailedDropsResult | null | undefined)[]) {
		const ids: Record<string, true> = {};
		for (const result of results) {
			if (!result) continue;
			for (const key of Object.keys(result.items ?? {})) ids[key] = true;
			for (const key of Object.keys(result.rngItems ?? {})) ids[key] = true;
		}
		delete ids[''];
		return Object.keys(ids);
	}

	function buildSideContext(side: RuntimeSideState, selectedTool: FarmingTool) {
		const snapshot = optionsSnapshot(side.options);
		const uniqueTools = [
			...new Map(
				Object.values(side.toolsByCrop).map((tool) => [tool.item.uuid ?? `${tool.type}-${tool.level}`, tool])
			).values(),
		];
		const activePet = side.pet;
		const options = {
			...snapshot,
			tools: uniqueTools,
			armor: new ArmorSet([...side.armor], [...side.equipment], snapshot),
			equipment: [...side.equipment],
			pets: [activePet],
			selectedPet: activePet,
			selectedTool,
			selectedCrop: selectedCropKey,
		} as PlayerOptions;
		const player = createFarmingPlayer(options);
		const cropFortune = player.getCropFortune(selectedCropKey);
		const effectiveFortune = cropFortune.fortune;
		const calculatorOptions = {
			farmingFortune: effectiveFortune,
			bountiful: selectedTool.reforge?.name === 'Bountiful',
			mooshroom: activePet.type === FarmingPets.MooshroomCow,
			blocksBroken: blocksActuallyBroken,
			armorPieces: player.armorSet.specialDropsCount(selectedCropKey),
			infestedPlotProbability: side.options.infestedPlotProbability,
			attributes: side.options.attributes,
			maxTool: selectedTool.level === 50,
			chips: side.options.chips,
			pet: activePet,
		} as Parameters<typeof calculateDetailedAverageDrops>[0];
		const result = calculateDetailedAverageDrops(calculatorOptions)[selectedCropKey] as
			| DetailedDropsResult
			| undefined;
		const npcProfit = result?.npcCoins ?? 0;
		const bazaarProfit =
			calculateBestBazaarProfit(result, selectedCropKey, bazaarData, $ratesData.bzMode) ?? npcProfit;
		return {
			selectedTool,
			activePet,
			cropFortune,
			effectiveFortune,
			result: result ?? null,
			npcProfit,
			bazaarProfit,
			coinBreakdown: result ? Object.entries(result.coinSources).sort(([, a], [, b]) => b - a) : [],
			collectionBreakdown: result ? Object.entries(result.otherCollection).sort(([, a], [, b]) => b - a) : [],
		};
	}

	function buildSimpleContext() {
		const activePet = simplePet;
		const effectiveFortune = simpleFarmingFortune + simpleCropFortune;
		const calculatorOptions = {
			farmingFortune: effectiveFortune,
			bountiful: false,
			mooshroom: activePet.type === FarmingPets.MooshroomCow,
			blocksBroken: blocksActuallyBroken,
			armorPieces: simpleArmorSet === 'none' ? 0 : 4,
			infestedPlotProbability: 0,
			attributes: {},
			maxTool: true,
			chips: {},
			pet: activePet,
		} as Parameters<typeof calculateDetailedAverageDrops>[0];
		const result = calculateDetailedAverageDrops(calculatorOptions)[selectedCropKey] as
			| DetailedDropsResult
			| undefined;
		const npcProfit = result?.npcCoins ?? 0;
		const bazaarProfit =
			calculateBestBazaarProfit(result, selectedCropKey, bazaarData, $ratesData.bzMode) ?? npcProfit;
		return {
			selectedTool: selectedToolA,
			activePet,
			cropFortune: { fortune: effectiveFortune, breakdown: [] },
			effectiveFortune,
			result: result ?? null,
			npcProfit,
			bazaarProfit,
			coinBreakdown: result ? Object.entries(result.coinSources).sort(([, a], [, b]) => b - a) : [],
			collectionBreakdown: result ? Object.entries(result.otherCollection).sort(([, a], [, b]) => b - a) : [],
		};
	}

	function resolveMetricValueForData(
		metric: FortuneCompareMetric,
		dataA: FortuneSandboxSideData,
		dataB: FortuneSandboxSideData
	) {
		const runtimeA = createRuntimeSide(dataA);
		const runtimeB = createRuntimeSide(dataB);
		const contextA = buildSideContext(
			runtimeA,
			runtimeA.toolsByCrop[String(selectedCropKey)] ?? createDefaultTool(selectedCropKey, runtimeA.options)
		);
		const contextB = buildSideContext(
			runtimeB,
			runtimeB.toolsByCrop[String(selectedCropKey)] ?? createDefaultTool(selectedCropKey, runtimeB.options)
		);
		if (metric === 'npcProfit') {
			return {
				A: contextA.npcProfit,
				B: contextB.npcProfit,
			};
		}
		return {
			A: contextA.bazaarProfit,
			B: contextB.bazaarProfit,
		};
	}

	function onDiffMetricChange(value?: string) {
		if (value === 'bazaarProfit' || value === 'npcProfit') {
			diffMetric = value;
		}
	}

	function onDiffScanSideChange(value?: string) {
		if (value === 'A' || value === 'B') {
			diffScanSide = value;
			diffResult = null;
			diffMessage = '';
		}
	}

	function onDiffFieldChange(value?: string) {
		if (!value) return;
		diffFieldId = value;
		const field = breakEvenFields.find((entry) => entry.id === value);
		if (field) {
			diffRange = { ...field.range };
		}
		diffResult = null;
		diffMessage = '';
	}

	function onDiffRangeInput() {
		diffResult = null;
		diffMessage = '';
	}

	function runBreakEvenScan() {
		const field = breakEvenFields.find((entry) => entry.id === diffFieldId);
		if (!field) {
			diffResult = null;
			diffMessage = 'Select a numeric field first';
			return;
		}

		const sideDataA = runtimeSideToData(sideA, selectedCropKey);
		const sideDataB = runtimeSideToData(sideB, selectedCropKey);
		diffResult = scanFortuneBreakEven({
			sideA: sideDataA,
			sideB: sideDataB,
			scanSide: diffScanSide,
			field,
			range: diffRange,
			metricResolver: (a, b) => resolveMetricValueForData(diffMetric, a, b),
		});
		if (diffResult.status === 'invalid-range') {
			diffMessage = 'Invalid range. Ensure step is positive and start/end are valid numbers.';
			return;
		}
		if (diffResult.status === 'not-found') {
			diffMessage = 'No break-even point found within the selected range.';
			return;
		}
		diffMessage = `Break-even found at ${diffResult.value.toFixed(2)}.`;
	}

	function applyBreakEvenValue() {
		const field = breakEvenFields.find((entry) => entry.id === diffFieldId);
		const result = diffResult;
		if (!field || !result || result.status !== 'found') return;
		ensureSectionEditable(diffScanSide, field.section);
		patchRuntimeSide(diffScanSide, (sideData) => {
			field.setValue(sideData, result.value);
		});
		compareActiveSide = diffScanSide;
	}

	let sideA = $state<RuntimeSideState>(createRuntimeSide());
	let sideB = $state<RuntimeSideState>(untrack(() => createRuntimeSide(runtimeSideToData(sideA, Crop.Wheat))));

	let simpleMode = $state(false);
	let simpleFarmingFortune = $state(1100);
	let simpleCropFortune = $state(300);
	let simplePetType = $state<FarmingPets>(FarmingPets.Elephant);
	let simpleArmorSet = $state<'melon' | 'cropie' | 'squash' | 'fermento' | 'helianthus' | 'none'>('helianthus');

	let compareMode = $state(false);
	let compareActiveSide = $state<SideKey>('A');
	let compareMobileTab = $state<'A' | 'B' | 'diff'>('A');
	let compareLinkedSections = $state<Record<LinkSection, boolean>>({ ...defaultCompareLinkedSections });

	let diffMode = $state<FortuneCompareDiffMode>('summary');
	let diffMetric = $state<FortuneCompareMetric>('bazaarProfit');
	let diffScanSide = $state<SideKey>('B');
	let diffFieldId = $state('');
	let diffRange = $state<FortuneCompareFieldRange>({ start: 1, end: 100, step: 1 });
	let diffResult = $state<FortuneBreakEvenScanResult | null>(null);
	let diffMessage = $state('');

	let loadedSharedSetup = $state<{
		name: string;
		description: string;
		compareEnabled: boolean;
		sideSources: Partial<Record<SideKey, FortuneSandboxPlayerGearSource | null>>;
	} | null>(null);

	let importMessage = $state('');
	let sideAImportState = $state<SideImportState>(createSideImportState());
	let sideBImportState = $state<SideImportState>(createSideImportState());

	let blocksBroken = $state(72_000);
	let bps = $state(20);

	let bazaarData = $state<RatesItemPriceData | undefined>(undefined);
	let bazaarLoading = $state(false);
	let bazaarError = $state('');
	let bazaarRequestId = 0;
	let bazaarItemsCacheKey = '';

	const maxedPetOptions = Object.keys(FARMING_PETS).map((petType) => ({
		value: petType,
		label: FARMING_PETS[petType as FarmingPets]?.name ?? petType,
	}));
	const simpleArmorOptions = [
		{ value: 'helianthus', label: 'Helianthus (4/4)' },
		{ value: 'fermento', label: 'Fermento (4/4)' },
		{ value: 'squash', label: 'Squash (4/4)' },
		{ value: 'cropie', label: 'Cropie (4/4)' },
		{ value: 'melon', label: 'Melon (4/4)' },
		{ value: 'none', label: 'No Set Bonus' },
	];

	const selectedCrop = $derived(Object.entries($selectedCrops).find(([, value]) => value)?.[0] ?? 'Wheat');
	const selectedCropKey = $derived((getCropFromName(selectedCrop) ?? Crop.Wheat) as Crop);
	const blocksActuallyBroken = $derived(blocksBroken * (bps / 20));

	const selectedToolA = $derived.by(
		() => sideA.toolsByCrop[String(selectedCropKey)] ?? createDefaultTool(selectedCropKey, sideA.options)
	);
	const selectedToolB = $derived.by(
		() => sideB.toolsByCrop[String(selectedCropKey)] ?? createDefaultTool(selectedCropKey, sideB.options)
	);

	const simplePet = $derived.by(() => {
		const petInfo = FARMING_PETS[simplePetType];
		const rarity = petInfo?.maxRarity ?? Rarity.Legendary;
		return new FarmingPet(
			{
				type: simplePetType,
				uuid: `simple-${simplePetType}`,
				tier: rarity.toUpperCase(),
				exp: getXpForLevel(100, rarity),
			},
			optionsSnapshot(sideA.options)
		);
	});

	const sideAContext = $derived.by(() => buildSideContext(sideA, selectedToolA));
	const sideBContext = $derived.by(() => (compareMode ? buildSideContext(sideB, selectedToolB) : sideAContext));
	const simpleContext = $derived.by(() => (simpleMode && !compareMode ? buildSimpleContext() : sideAContext));
	const primaryContext = $derived.by(() => {
		if (simpleMode && !compareMode) return simpleContext;
		return sideAContext;
	});

	const compareSummaryRows = $derived.by(() => {
		if (!compareMode) return [];
		const row = [
			{
				label: 'Fortune',
				a: sideAContext.effectiveFortune,
				b: sideBContext.effectiveFortune,
				format: (value: number) => value.toFixed(0),
			},
			{
				label: 'NPC Profit',
				a: sideAContext.npcProfit,
				b: sideBContext.npcProfit,
				format: (value: number) => value.toLocaleString(),
			},
			{
				label: 'Best Bazaar Profit',
				a: sideAContext.bazaarProfit,
				b: sideBContext.bazaarProfit,
				format: (value: number) => value.toLocaleString(),
			},
			{
				label: 'Collection',
				a: sideAContext.result?.collection ?? 0,
				b: sideBContext.result?.collection ?? 0,
				format: (value: number) => value.toLocaleString(),
			},
			{
				label: 'Special Crop Bonus',
				a: (sideAContext.result?.specialCropBonus ?? 0) * 100,
				b: (sideBContext.result?.specialCropBonus ?? 0) * 100,
				format: (value: number) => `${value.toFixed(2)}%`,
			},
			{
				label: 'Rare Item Bonus',
				a: (sideAContext.result?.rareItemBonus ?? 0) * 100,
				b: (sideBContext.result?.rareItemBonus ?? 0) * 100,
				format: (value: number) => `${value.toFixed(2)}%`,
			},
		];
		return row.map((entry) => ({
			...entry,
			delta: entry.b - entry.a,
			percent: formatDeltaPercent(entry.a, entry.b),
		}));
	});

	const compareCoinSourceDiff = $derived.by(() => {
		if (!compareMode) return [];
		return compareBreakdown(sideAContext.result?.coinSources, sideBContext.result?.coinSources);
	});

	const compareCollectionSourceDiff = $derived.by(() => {
		if (!compareMode) return [];
		return compareBreakdown(sideAContext.result?.otherCollection, sideBContext.result?.otherCollection);
	});

	const breakEvenFields = $derived.by(() => {
		if (!compareMode) return [];
		const target = diffScanSide === 'A' ? sideA : sideB;
		return getFortuneBreakEvenFields(runtimeSideToData(target, selectedCropKey), selectedCropKey);
	});

	const breakEvenFieldOptions = $derived.by(() =>
		breakEvenFields.map((field) => ({
			value: field.id,
			label: field.label,
		}))
	);

	const currentBreakEvenField = $derived.by(
		() => breakEvenFields.find((field) => field.id === diffFieldId) as FortuneCompareFieldDefinition | undefined
	);
	const currentBreakEvenFieldSectionLabel = $derived.by(() =>
		currentBreakEvenField ? linkSectionLabels[currentBreakEvenField.section] : null
	);

	const sideAPetSyncHash = $derived.by(() =>
		compareMode && compareLinkedSections.pet ? JSON.stringify(sideA.pet.pet) : ''
	);
	const sideAToolSyncHash = $derived.by(() =>
		compareMode && compareLinkedSections.tool
			? JSON.stringify(
					Object.fromEntries(Object.entries(sideA.toolsByCrop).map(([crop, tool]) => [crop, tool.item]))
				)
			: ''
	);
	const sideAArmorSyncHash = $derived.by(() =>
		compareMode && compareLinkedSections.armorEquipment
			? JSON.stringify({
					armor: sideA.armor.map((piece) => piece.item),
					equipment: sideA.equipment.map((piece) => piece.item),
				})
			: ''
	);
	const sideAStatsSyncHash = $derived.by(() =>
		compareMode && compareLinkedSections.stats ? JSON.stringify(optionsSnapshot(sideA.options)) : ''
	);

	watch([() => sideAPetSyncHash, () => compareMode, () => compareLinkedSections.pet], () => {
		if (compareMode && compareLinkedSections.pet) {
			cloneSectionFromA('pet');
		}
	});

	watch([() => sideAToolSyncHash, () => compareMode, () => compareLinkedSections.tool], () => {
		if (compareMode && compareLinkedSections.tool) {
			cloneSectionFromA('tool');
		}
	});

	watch([() => sideAArmorSyncHash, () => compareMode, () => compareLinkedSections.armorEquipment], () => {
		if (compareMode && compareLinkedSections.armorEquipment) {
			cloneSectionFromA('armorEquipment');
		}
	});

	watch([() => sideAStatsSyncHash, () => compareMode, () => compareLinkedSections.stats], () => {
		if (compareMode && compareLinkedSections.stats) {
			cloneSectionFromA('stats');
		}
	});

	$effect(() => {
		const fields = breakEvenFields;
		if (fields.length === 0) {
			diffFieldId = '';
			return;
		}
		if (!fields.some((field) => field.id === diffFieldId)) {
			diffFieldId = fields[0]!.id;
			diffRange = { ...fields[0]!.range };
		}
	});

	$effect(() => {
		if (!browser) return;
		const activeResults = compareMode ? [sideAContext.result, sideBContext.result] : [primaryContext.result];
		const ids = collectBazaarItemIds(activeResults);
		const sortedIds = [...ids].sort();
		const nextCacheKey = sortedIds.join('|');
		if (!nextCacheKey) {
			bazaarItemsCacheKey = '';
			bazaarData = undefined;
			bazaarError = '';
			bazaarLoading = false;
			return;
		}
		if (nextCacheKey === bazaarItemsCacheKey) {
			return;
		}
		bazaarItemsCacheKey = nextCacheKey;
		const requestId = ++bazaarRequestId;
		bazaarLoading = true;
		bazaarError = '';
		void getItems(sortedIds)
			.then((next) => {
				if (requestId !== bazaarRequestId) return;
				bazaarData = next ?? undefined;
			})
			.catch(() => {
				if (requestId !== bazaarRequestId) return;
				bazaarData = undefined;
				bazaarError = 'Bazaar data unavailable, metrics fallback to NPC profit.';
			})
			.finally(() => {
				if (requestId !== bazaarRequestId) return;
				bazaarLoading = false;
			});
	});

	onMount(() => {
		selectedCrops.update((crops) =>
			Object.values(crops).some((isSelected) => isSelected) ? crops : { ...DEFAULT_SELECTED_CROPS, Wheat: true }
		);
		const shareId = (data.shareId ?? new URL(window.location.href).searchParams.get('share') ?? '').trim();
		if (shareId) {
			void importSharedSetup(shareId);
		}
	});
</script>

<Head title="Farming Fortune Sandbox | Elite" description="Configure your farming setup and see your rates!" />

<div class="flex w-full flex-col items-center gap-6 p-4">
	<div class="flex w-full max-w-6xl items-center justify-between gap-3">
		<div class="flex flex-col">
			<h1 class="text-3xl font-bold">Farming Fortune Sandbox</h1>
			<p class="text-muted-foreground">Experiment with different setups without being tied to a profile.</p>
		</div>
		<FortuneShareControls
			authorized={gbl.authorized}
			loginRedirectHref={getLoginRedirectHref()}
			{compareMode}
			sideAPlayerGear={sideA.playerGearSource}
			sideBPlayerGear={sideB.playerGearSource}
			{createSharePayload}
		/>
	</div>

	{#if loadedSharedSetup}
		<section class="bg-card flex w-full max-w-6xl flex-col gap-1 rounded-lg border p-4">
			<p class="text-sm font-semibold">Loaded Shared Setup: {loadedSharedSetup.name}</p>
			{#if loadedSharedSetup.description}
				<p class="text-muted-foreground text-sm">{loadedSharedSetup.description}</p>
			{/if}
			{#if loadedSharedSetup.compareEnabled}
				<p class="text-muted-foreground text-sm">Compare Mode Enabled</p>
			{/if}
			{#if loadedSharedSetup.sideSources.A}
				<p class="text-muted-foreground text-sm">
					Side A includes loaded gear from player {loadedSharedSetup.sideSources.A.playerName}
					{#if loadedSharedSetup.sideSources.A.profileName}
						({loadedSharedSetup.sideSources.A.profileName})
					{/if}
				</p>
			{/if}
			{#if loadedSharedSetup.sideSources.B}
				<p class="text-muted-foreground text-sm">
					Side B includes loaded gear from player {loadedSharedSetup.sideSources.B.playerName}
					{#if loadedSharedSetup.sideSources.B.profileName}
						({loadedSharedSetup.sideSources.B.profileName})
					{/if}
				</p>
			{/if}
		</section>
	{/if}

	{#if compareMode}
		<section class="w-full max-w-6xl rounded-lg border p-4">
			<h2 class="mb-2 text-sm font-semibold">Loaded Player Gear Sources</h2>
			<div class="text-muted-foreground flex flex-col gap-1 text-sm">
				<p>
					Side A:
					{#if sideA.playerGearSource}
						{sideA.playerGearSource.playerName}
						{#if sideA.playerGearSource.profileName}
							({sideA.playerGearSource.profileName})
						{/if}
					{:else}
						No imported player gear
					{/if}
				</p>
				<p>
					Side B:
					{#if sideB.playerGearSource}
						{sideB.playerGearSource.playerName}
						{#if sideB.playerGearSource.profileName}
							({sideB.playerGearSource.profileName})
						{/if}
					{:else}
						No imported player gear
					{/if}
				</p>
			</div>
		</section>
	{:else if sideA.playerGearSource}
		<p class="text-muted-foreground w-full max-w-6xl text-sm">
			Current setup includes loaded gear from player {sideA.playerGearSource.playerName}
			{#if sideA.playerGearSource.profileName}
				({sideA.playerGearSource.profileName})
			{/if}
		</p>
	{/if}

	<section class="bg-card flex w-full max-w-6xl flex-col gap-3 rounded-lg border p-4">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 class="text-lg font-semibold">Configuration Mode</h2>
				<p class="text-muted-foreground text-sm">Use simple inputs, full controls, or compare A/B setups.</p>
			</div>
			<div class="flex flex-wrap items-center gap-6">
				<div class="flex items-center gap-3">
					<Label for="simple-mode">Simple</Label>
					<Switch
						id="simple-mode"
						checked={simpleMode}
						onCheckedChange={(value) => {
							if (compareMode && value) return;
							simpleMode = value;
						}}
						disabled={compareMode}
					/>
				</div>
				<div class="flex items-center gap-3">
					<Label for="compare-mode">Compare A/B</Label>
					<Switch id="compare-mode" checked={compareMode} onCheckedChange={setCompareMode} />
				</div>
			</div>
		</div>
		{#if compareMode}
			<p class="text-muted-foreground text-sm">
				Compare mode is full-configuration only. Simple mode is disabled while compare is active.
			</p>
		{/if}
	</section>

	{#if !compareMode}
		<section class="bg-card flex w-full max-w-6xl flex-col gap-4 rounded-lg border p-4">
			<div class="flex flex-col gap-1">
				<h2 class="text-lg font-semibold">Import from Player</h2>
				<p class="text-muted-foreground text-sm">
					Search for a player and load their farming pet, tool, armor, and equipment.
				</p>
			</div>
			<FortuneSideImport
				sideKey="A"
				bind:state={sideAImportState}
				{loadPlayer}
				{reloadSelectedProfile}
				showHeading={false}
			/>
		</section>
	{/if}

	{#if importMessage}
		<p class="text-destructive text-sm">{importMessage}</p>
	{/if}

	<CropSelector radio={true} />

	<section class="bg-card flex w-full max-w-6xl flex-col gap-4 rounded-lg border p-4">
		<div class="flex flex-col gap-1">
			<h2 class="text-lg font-semibold">Rate Assumptions</h2>
			<p class="text-muted-foreground text-sm">These apply to all result panels and diff calculations.</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			<div class="flex flex-col gap-1">
				<span class="text-sm font-semibold">Time Spent Farming</span>
				<Select.Simple bind:value={blocksBroken} options={farmingDurationOptions} />
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-sm font-semibold">Blocks Per Second ({bps.toFixed(2)})</span>
				<div class="flex items-center gap-2">
					<SliderSimple class="h-8" min={10} max={20} bind:value={bps} step={0.05} />
					<span class="text-muted-foreground w-16 text-right text-xs">{(bps / 0.2).toFixed(1)}%</span>
				</div>
			</div>
		</div>
		{#if bazaarLoading}
			<p class="text-muted-foreground text-xs">Refreshing bazaar data...</p>
		{:else if bazaarError}
			<p class="text-muted-foreground text-xs">{bazaarError}</p>
		{/if}
	</section>

	<div class="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-12">
		<div class="flex flex-col gap-6 {compareMode ? 'lg:col-span-12' : 'lg:col-span-7'}">
			{#if !compareMode && simpleMode}
				<section class="bg-card flex flex-col gap-5 rounded-lg border p-5">
					<div>
						<h2 class="text-xl font-semibold">Simple Configuration</h2>
						<p class="text-muted-foreground text-sm">
							Set total fortune values and quick assumptions for rate estimates.
						</p>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="flex flex-col gap-2">
							<Label>General Farming Fortune</Label>
							<NumberInput
								min="0"
								bind:value={simpleFarmingFortune}
								class="h-14 text-xl font-semibold"
								placeholder="1200"
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label>{selectedCrop} Fortune</Label>
							<NumberInput
								min="0"
								bind:value={simpleCropFortune}
								class="h-14 text-xl font-semibold"
								placeholder="350"
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label>Maxed Pet</Label>
							<Select.Simple
								options={maxedPetOptions}
								value={simplePetType}
								change={(value) => {
									if (value) simplePetType = value as FarmingPets;
								}}
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label>Armor Set Assumption</Label>
							<Select.Simple
								options={simpleArmorOptions}
								value={simpleArmorSet}
								change={(value) => {
									if (value)
										simpleArmorSet = value as
											| 'melon'
											| 'cropie'
											| 'squash'
											| 'fermento'
											| 'helianthus'
											| 'none';
								}}
							/>
						</div>
					</div>
				</section>
			{:else if compareMode}
				<Accordion.Root type="multiple" class="w-full space-y-4">
					<Accordion.Item value="A" class="rounded-lg border">
						<Accordion.Trigger class="px-4 py-3 hover:no-underline">
							<div class="flex w-full items-center justify-between gap-4">
								<div class="flex flex-col text-left">
									<span class="text-lg font-semibold">Side A Settings</span>
									<span class="text-muted-foreground text-xs">
										Pet: {sideA.pet.info.name} | Tool: {selectedToolA.info.name}
									</span>
								</div>
								<span class="text-sm font-semibold"
									>Fortune: {sideAContext.effectiveFortune.toFixed(0)}</span
								>
							</div>
						</Accordion.Trigger>
						<Accordion.Content class="px-4 pt-2 pb-4">
							<FortuneSideImport
								sideKey="A"
								bind:state={sideAImportState}
								{loadPlayer}
								{reloadSelectedProfile}
								class="mb-4"
							/>
							<FortuneSideEditor
								sideKey="A"
								bind:side={sideA}
								{selectedCropKey}
								{onSectionInteraction}
								{createDefaultTool}
							/>
						</Accordion.Content>
					</Accordion.Item>

					<Accordion.Item value="B" class="rounded-lg border">
						<Accordion.Trigger class="px-4 py-3 hover:no-underline">
							<div class="flex w-full items-center justify-between gap-4">
								<div class="flex flex-col text-left">
									<span class="text-lg font-semibold">Side B Settings</span>
									<span class="text-muted-foreground text-xs">
										Pet: {sideB.pet.info.name} | Tool: {selectedToolB.info.name}
									</span>
								</div>
								<span class="text-sm font-semibold"
									>Fortune: {sideBContext.effectiveFortune.toFixed(0)}</span
								>
							</div>
						</Accordion.Trigger>
						<Accordion.Content class="px-4 pt-2 pb-4">
							<FortuneSideImport
								sideKey="B"
								bind:state={sideBImportState}
								{loadPlayer}
								{reloadSelectedProfile}
								class="mb-4"
							/>
							<div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
								{#each Object.keys(compareLinkedSections) as sectionKey (sectionKey)}
									{@const section = sectionKey as LinkSection}
									<div class="bg-muted/20 flex items-center justify-between rounded-md border p-3">
										<span class="text-sm font-medium">{linkSectionLabels[section]}</span>
										<div class="flex items-center gap-2">
											<span class="text-muted-foreground text-xs">Linked</span>
											<Switch
												checked={compareLinkedSections[section]}
												onCheckedChange={(value) => setSectionLinked(section, value)}
											/>
										</div>
									</div>
								{/each}
							</div>
							<FortuneSideEditor
								sideKey="B"
								bind:side={sideB}
								{selectedCropKey}
								{onSectionInteraction}
								{createDefaultTool}
							/>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			{:else}
				<FortuneSideEditor
					sideKey="A"
					bind:side={sideA}
					{selectedCropKey}
					{onSectionInteraction}
					{createDefaultTool}
				/>
			{/if}
		</div>

		<div class="flex flex-col gap-6 {compareMode ? 'lg:col-span-12' : 'lg:col-span-5'}">
			{#if !compareMode}
				<FortuneResultPanel
					title={`${selectedCrop} Results`}
					context={primaryContext}
					{selectedCropKey}
					showFortuneBreakdown={!simpleMode}
				/>
			{:else}
				<div class="hidden gap-4 md:grid md:grid-cols-2">
					<FortuneResultPanel
						title={`Side A - ${selectedCrop}`}
						context={sideAContext}
						{selectedCropKey}
						showFortuneBreakdown={true}
					/>
					<FortuneResultPanel
						title={`Side B - ${selectedCrop}`}
						context={sideBContext}
						{selectedCropKey}
						showFortuneBreakdown={true}
					/>
				</div>

				<div class="md:hidden">
					<Tabs.Root bind:value={compareMobileTab} class="w-full">
						<Tabs.List class="w-full">
							<Tabs.Trigger value="A" class="flex-1">Side A</Tabs.Trigger>
							<Tabs.Trigger value="B" class="flex-1">Side B</Tabs.Trigger>
							<Tabs.Trigger value="diff" class="flex-1">Diff</Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="A" class="mt-4">
							<FortuneResultPanel
								title={`Side A - ${selectedCrop}`}
								context={sideAContext}
								{selectedCropKey}
								showFortuneBreakdown={true}
							/>
						</Tabs.Content>
						<Tabs.Content value="B" class="mt-4">
							<FortuneResultPanel
								title={`Side B - ${selectedCrop}`}
								context={sideBContext}
								{selectedCropKey}
								showFortuneBreakdown={true}
							/>
						</Tabs.Content>
						<Tabs.Content value="diff" class="mt-4">
							<p class="text-muted-foreground text-sm">
								Use the diff panel below for summary, source deltas, and break-even scans.
							</p>
						</Tabs.Content>
					</Tabs.Root>
				</div>

				<FortuneDiffPanel
					bind:diffMode
					bind:diffRange
					{selectedCrop}
					{diffMetric}
					{diffScanSide}
					{diffFieldId}
					{diffResult}
					{diffMessage}
					{compareSummaryRows}
					{compareCoinSourceDiff}
					{compareCollectionSourceDiff}
					{compareMetricOptions}
					{compareSideOptions}
					{breakEvenFieldOptions}
					{currentBreakEvenFieldSectionLabel}
					onMetricChange={onDiffMetricChange}
					onScanSideChange={onDiffScanSideChange}
					onFieldChange={onDiffFieldChange}
					onRangeInput={onDiffRangeInput}
					onRunBreakEven={runBreakEvenScan}
					onApplyBreakEven={applyBreakEvenValue}
					{formatSigned}
				/>
			{/if}
		</div>
	</div>
</div>
