import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import type { RatesItemPriceData } from '$lib/api/elite';
import {
	calculateBestBazaarProfit,
	getWhatIfFields,
	scanFortuneBreakEven,
	type FortuneBreakEvenScanResult,
	type FortuneCompareDiffMode,
	type FortuneCompareFieldDefinition,
	type FortuneCompareFieldRange,
	type FortuneCompareFieldSection,
	type FortuneCompareMetric,
	type FortuneCompareSideKey,
} from '$lib/calc/fortune-compare';
import {
	cloneItemDto,
	collectBazaarItemIds,
	compareBreakdown,
	createDefaultOptions,
	createDefaultTool,
	createRuntimeSide,
	createSideImportState,
	defaultCompareLinkedSections,
	defaultPetItem,
	defaultSideNames,
	extractImportedOptions,
	formatDeltaPercent,
	formatSigned,
	linkSectionLabels,
	mapToolsByCrop,
	normalizePlayerGearSource,
	normalizeSideName,
	optionsSnapshot,
	runtimeSideToData,
	toEliteItemDto,
	type ImportedSandboxState,
	type RuntimeSideState,
	type SandboxMode,
	type SideImportState,
} from '$lib/calc/fortune-sandbox-helpers';
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
import {
	ArmorSet,
	calculateDetailedAverageDrops,
	createFarmingPlayer,
	Crop,
	FarmingPet,
	FarmingPets,
	FarmingTool,
	getCropFromName,
	type DetailedDropsResult,
	type PlayerOptions,
} from 'farming-weight';
import { watch } from 'runed';
import { onMount, untrack } from 'svelte';
import { get } from 'svelte/store';

type SideKey = FortuneCompareSideKey;
type LinkSection = FortuneCompareFieldSection;

interface NormalizedSharedSetup {
	sideA: FortuneSandboxSideData;
	sideB: FortuneSandboxSideData;
	sideNames: Record<SideKey, string>;
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

type InitialShareIdSource = string | (() => string | undefined) | undefined;

function getUniqueTools(toolsByCrop: Record<string, FarmingTool>) {
	const uniqueTools: Record<string, FarmingTool> = {};

	for (const tool of Object.values(toolsByCrop)) {
		const key = tool.item.uuid ?? `${tool.type}-${tool.level}`;
		uniqueTools[key] = tool;
	}

	return Object.values(uniqueTools);
}

export function createFortuneSandboxState(initialShareId?: InitialShareIdSource) {
	const gbl = getGlobalContext();
	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	// ── Core side state ──
	let sideA = $state<RuntimeSideState>(createRuntimeSide());
	let sideB = $state<RuntimeSideState>(untrack(() => createRuntimeSide(runtimeSideToData(sideA, Crop.Wheat))));

	// ── Mode state ──
	let mode = $state<SandboxMode>('full');

	// ── Compare state ──
	let compareActiveSide = $state<SideKey>('A');
	let compareMobileTab = $state<'A' | 'B' | 'diff'>('A');
	let compareLinkedSections = $state<Record<LinkSection, boolean>>({ ...defaultCompareLinkedSections });
	let sideNames = $state<Record<SideKey, string>>({ ...defaultSideNames });

	// ── What-If state (formerly break-even) ──
	let diffMode = $state<FortuneCompareDiffMode>('summary');
	let diffMetric = $state<FortuneCompareMetric>('bazaarProfit');
	let diffScanSide = $state<SideKey>('B');
	let diffFieldId = $state('');
	let diffRange = $state<FortuneCompareFieldRange>({ start: 1, end: 100, step: 1 });
	let diffResult = $state<FortuneBreakEvenScanResult | null>(null);
	let diffMessage = $state('');

	// ── Shared setup state ──
	let loadedSharedSetup = $state<{
		name: string;
		description: string;
		compareEnabled: boolean;
		sideSources: Partial<Record<SideKey, FortuneSandboxPlayerGearSource | null>>;
	} | null>(null);

	// ── Walkthrough ──
	let walkthroughOpen = $state(false);

	// ── Import state ──
	let importMessage = $state('');
	let sideAImportState = $state<SideImportState>(createSideImportState());
	let sideBImportState = $state<SideImportState>(createSideImportState());

	// ── Rate assumptions ──
	let blocksBroken = $state(72_000);
	let bps = $state(20);

	// ── Bazaar data ──
	let bazaarData = $state<RatesItemPriceData | undefined>(undefined);
	let bazaarLoading = $state(false);
	let bazaarError = $state('');
	let bazaarRequestId = 0;
	let bazaarItemsCacheKey = '';

	// ── Derived state ──
	const compareMode = $derived(mode === 'compare');
	const selectedCrop = $derived(Object.entries(get(selectedCrops)).find(([, value]) => value)?.[0] ?? 'Wheat');
	const selectedCropKey = $derived((getCropFromName(selectedCrop) ?? Crop.Wheat) as Crop);
	const blocksActuallyBroken = $derived(blocksBroken * (bps / 20));
	const sideNameA = $derived.by(() => normalizeSideName(sideNames.A, defaultSideNames.A));
	const sideNameB = $derived.by(() => normalizeSideName(sideNames.B, defaultSideNames.B));
	const compareSideOptions = $derived.by(() => [
		{ value: 'A', label: sideNameA },
		{ value: 'B', label: sideNameB },
	]);

	const selectedToolA = $derived.by(
		() => sideA.toolsByCrop[String(selectedCropKey)] ?? createDefaultTool(selectedCropKey, sideA.options)
	);
	const selectedToolB = $derived.by(
		() => sideB.toolsByCrop[String(selectedCropKey)] ?? createDefaultTool(selectedCropKey, sideB.options)
	);

	function buildSideContext(side: RuntimeSideState, selectedTool: FarmingTool) {
		const snapshot = optionsSnapshot(side.options);
		const uniqueTools = getUniqueTools(side.toolsByCrop);
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
			calculateBestBazaarProfit(result, selectedCropKey, bazaarData, get(ratesData).bzMode) ?? npcProfit;
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

	const sideAContext = $derived.by(() => buildSideContext(sideA, selectedToolA));
	const sideBContext = $derived.by(() => (compareMode ? buildSideContext(sideB, selectedToolB) : sideAContext));
	const primaryContext = $derived(sideAContext);

	const compareSummaryRows = $derived.by(() => {
		if (!compareMode) return [];
		return [
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
		].map((entry) => ({
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

	// Use curated what-if fields instead of all break-even fields
	const whatIfFields = $derived.by(() => {
		if (!compareMode) return [];
		const target = diffScanSide === 'A' ? sideA : sideB;
		return getWhatIfFields(runtimeSideToData(target, selectedCropKey), selectedCropKey);
	});

	const whatIfFieldOptions = $derived.by(() =>
		whatIfFields.map((field) => ({
			value: field.id,
			label: field.label,
		}))
	);

	const currentWhatIfField = $derived.by(
		() => whatIfFields.find((field) => field.id === diffFieldId) as FortuneCompareFieldDefinition | undefined
	);
	const currentWhatIfFieldSectionLabel = $derived.by(() =>
		currentWhatIfField ? linkSectionLabels[currentWhatIfField.section] : null
	);

	// ── Unified sync watcher (consolidated from 4 separate watchers) ──
	const sideASyncHash = $derived.by(() => {
		if (!compareMode) return '';
		const parts: string[] = [];
		if (compareLinkedSections.pet) parts.push(`pet:${JSON.stringify(sideA.pet.pet)}`);
		if (compareLinkedSections.tool)
			parts.push(
				`tool:${JSON.stringify(Object.fromEntries(Object.entries(sideA.toolsByCrop).map(([crop, tool]) => [crop, tool.item])))}`
			);
		if (compareLinkedSections.armorEquipment)
			parts.push(
				`armor:${JSON.stringify({ armor: sideA.armor.map((p) => p.item), equipment: sideA.equipment.map((p) => p.item) })}`
			);
		if (compareLinkedSections.stats) parts.push(`stats:${JSON.stringify(optionsSnapshot(sideA.options))}`);
		return parts.join('|');
	});

	watch(
		[
			() => sideASyncHash,
			() => compareMode,
			() => compareLinkedSections.pet,
			() => compareLinkedSections.tool,
			() => compareLinkedSections.armorEquipment,
			() => compareLinkedSections.stats,
		],
		() => {
			if (!compareMode) return;
			const sections: LinkSection[] = ['pet', 'tool', 'armorEquipment', 'stats'];
			for (const section of sections) {
				if (compareLinkedSections[section]) {
					cloneSectionFromA(section);
				}
			}
		}
	);

	// ── What-if field validity ──
	$effect(() => {
		const fields = whatIfFields;
		if (fields.length === 0) {
			diffFieldId = '';
			return;
		}
		if (!fields.some((field) => field.id === diffFieldId)) {
			diffFieldId = fields[0]!.id;
			diffRange = { ...fields[0]!.range };
		}
	});

	// ── Bazaar data fetching ──
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
		if (nextCacheKey === bazaarItemsCacheKey) return;
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

	// ── Side operations ──
	function patchRuntimeSide(sideKey: SideKey, mutator: (current: FortuneSandboxSideData) => void) {
		const currentSide = sideKey === 'A' ? sideA : sideB;
		const current = runtimeSideToData(currentSide, selectedCropKey);
		mutator(current);
		const next = createRuntimeSide(current);
		if (sideKey === 'A') {
			sideA = next;
		} else {
			sideB = next;
		}
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
						cloneItemDto(item as import('farming-weight').EliteItemDto),
					])
				);
				sideData.tool = sourceA.tool
					? cloneItemDto(sourceA.tool as import('farming-weight').EliteItemDto)
					: undefined;
			}
			if (section === 'armorEquipment') {
				sideData.armor = (sourceA.armor ?? []).map((piece) =>
					cloneItemDto(piece as import('farming-weight').EliteItemDto)
				);
				sideData.equipment = (sourceA.equipment ?? []).map((piece) =>
					cloneItemDto(piece as import('farming-weight').EliteItemDto)
				);
			}
			if (section === 'stats') {
				sideData.options = optionsSnapshot(sideA.options) as FortuneSandboxSideData['options'];
			}
		});
	}

	function setSectionLinked(section: LinkSection, next: boolean) {
		compareLinkedSections = { ...compareLinkedSections, [section]: next };
		if (next) cloneSectionFromA(section);
	}

	function ensureSectionEditable(sideKey: SideKey, section: LinkSection) {
		if (!compareMode || sideKey !== 'B' || !compareLinkedSections[section]) return;
		cloneSectionFromA(section);
		compareLinkedSections = { ...compareLinkedSections, [section]: false };
	}

	function onSectionInteraction(sideKey: SideKey, section: LinkSection) {
		compareActiveSide = sideKey;
		ensureSectionEditable(sideKey, section);
	}

	function getSideDisplayName(sideKey: SideKey) {
		return normalizeSideName(sideNames[sideKey], defaultSideNames[sideKey]);
	}

	function getSideImportState(sideKey: SideKey) {
		return sideKey === 'A' ? sideAImportState : sideBImportState;
	}

	// ── Mode switching ──
	function setMode(next: SandboxMode) {
		if (next === 'compare') {
			sideNames = { A: getSideDisplayName('A'), B: getSideDisplayName('B') };
			mode = 'compare';
			compareActiveSide = 'A';
			sideB = createRuntimeSide(runtimeSideToData(sideA, selectedCropKey));
			compareLinkedSections = { ...defaultCompareLinkedSections };
			compareMobileTab = 'A';
			return;
		}
		mode = next;
	}

	// ── Import / share ──
	function applyImportedSetupToSide(
		sideKey: SideKey,
		imported: ImportedSandboxState,
		importMode: 'merge' | 'replace' = 'replace'
	) {
		patchRuntimeSide(sideKey, (sideData) => {
			if (importMode === 'replace') {
				sideData.options = createDefaultOptions() as FortuneSandboxSideData['options'];
			}
			if (imported.options) {
				sideData.options = {
					...(sideData.options ?? {}),
					...(imported.options as Partial<PlayerOptions>),
				} as FortuneSandboxSideData['options'];
			}
			if (importMode === 'replace' || imported.pet) {
				sideData.pet = { ...defaultPetItem, ...(imported.pet ?? {}) };
			}
			if (importMode === 'replace') {
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
			if (importMode === 'replace') sideData.armor = [];
			if (imported.armor) {
				sideData.armor = imported.armor.map((item) => toEliteItemDto(item));
			}
			if (importMode === 'replace') sideData.equipment = [];
			if (imported.equipment) {
				sideData.equipment = imported.equipment.map((item) => toEliteItemDto(item));
			}
			if (importMode === 'replace') {
				sideData.source = imported.playerGearSource ? { playerGear: imported.playerGearSource } : undefined;
			} else if (imported.playerGearSource !== undefined) {
				sideData.source = imported.playerGearSource ? { playerGear: imported.playerGearSource } : undefined;
			}
		});
	}

	function unlinkImportedSections(targetSide: SideKey) {
		if (!compareMode || targetSide !== 'B') return;
		compareLinkedSections = { pet: false, tool: false, armorEquipment: false, stats: false };
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
				sideNames: { ...defaultSideNames },
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
			sideNames: {
				A: normalizeSideName(setting.sideNames?.A, defaultSideNames.A),
				B: normalizeSideName(setting.sideNames?.B, defaultSideNames.B),
			},
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
		sideNames = { ...normalized.sideNames };
		if (normalized.compare.enabled) {
			mode = 'compare';
		}
		compareActiveSide = normalized.compare.activeSide;
		compareLinkedSections = { ...normalized.compare.linkedSections };
		diffMode = normalized.compare.diff.mode;
		diffMetric = normalized.compare.diff.metric;
		diffFieldId = normalized.compare.diff.fieldId;
		diffRange = { ...normalized.compare.diff.range };
		diffScanSide = normalized.compare.diff.scanSide;
		diffResult = null;
		diffMessage = '';
	}

	function createSharePayload(): FortuneSandboxToolSettingData {
		return {
			schemaVersion: FORTUNE_SANDBOX_TOOL_SETTING_VERSION as 2,
			sides: {
				A: runtimeSideToData(sideA, selectedCropKey),
				B: compareMode ? runtimeSideToData(sideB, selectedCropKey) : undefined,
			},
			sideNames: { A: getSideDisplayName('A'), B: getSideDisplayName('B') },
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
			sideImportState.profileOptions = profiles.map((profile) => ({ value: profile.id, label: profile.name }));
			sideImportState.selectedProfileId = activeProfileId;
			sideImportState.loadedPlayerName = account.name;
			sideImportState.loadedPlayerUuid = account.id;

			const member = await getProfileMember({ playerUuid: account.id, profileUuid: activeProfileId });
			const inventory = member?.farmingWeight?.inventory;
			const farmingPets = FarmingPet.fromArray(member?.pets ?? []);
			const bestPet = [...farmingPets].sort((a, b) => b.fortune - a.fortune)[0];
			const importedOptions = extractImportedOptions(member);
			const importedOptionSnapshot = { ...createDefaultOptions(), ...importedOptions } as PlayerOptions;
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
			if (targetSide === 'B') unlinkImportedSections(targetSide);
			applyImportedSetupToSide(targetSide, importedData, 'replace');
			sideNames[targetSide] = account.name;
			compareActiveSide = targetSide;
			sideImportState.loadState = 'loaded';
			sideImportState.loadMessage = `Loaded ${sideImportState.loadedPlayerName}${activeProfile.profileName ? ` (${activeProfile.profileName})` : ''} to ${getSideDisplayName(targetSide)}`;
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
			const importedOptionSnapshot = { ...createDefaultOptions(), ...importedOptions } as PlayerOptions;
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
			if (targetSide === 'B') unlinkImportedSections(targetSide);
			applyImportedSetupToSide(targetSide, importedData, 'replace');
			sideNames[targetSide] = normalizeSideName(sideImportState.loadedPlayerName, getSideDisplayName(targetSide));
			compareActiveSide = targetSide;
			sideImportState.loadState = 'loaded';
			sideImportState.loadMessage = `Loaded ${sideImportState.loadedPlayerName}${selectedProfileLabel ? ` (${selectedProfileLabel})` : ''} to ${getSideDisplayName(targetSide)}`;
		} catch {
			sideImportState.loadState = 'error';
			sideImportState.loadMessage = 'Failed to load selected profile';
		}
	}

	// ── What-if analysis handlers ──
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
		return metric === 'npcProfit'
			? { A: contextA.npcProfit, B: contextB.npcProfit }
			: { A: contextA.bazaarProfit, B: contextB.bazaarProfit };
	}

	function onDiffMetricChange(value?: string) {
		if (value === 'bazaarProfit' || value === 'npcProfit') diffMetric = value;
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
		const field = whatIfFields.find((entry) => entry.id === value);
		if (field) diffRange = { ...field.range };
		diffResult = null;
		diffMessage = '';
	}

	function onDiffRangeInput() {
		diffResult = null;
		diffMessage = '';
	}

	function runWhatIfScan() {
		const field = whatIfFields.find((entry) => entry.id === diffFieldId);
		if (!field) {
			diffResult = null;
			diffMessage = 'Select a field to adjust first.';
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
			diffMessage = 'No match found within the selected range.';
			return;
		}
		diffMessage = `Match found at ${diffResult.value.toFixed(2)} by adjusting ${getSideDisplayName(diffScanSide)}.`;
	}

	function applyWhatIfValue() {
		const field = whatIfFields.find((entry) => entry.id === diffFieldId);
		const result = diffResult;
		if (!field || !result || result.status !== 'found') return;
		ensureSectionEditable(diffScanSide, field.section);
		patchRuntimeSide(diffScanSide, (sideData) => {
			field.setValue(sideData, result.value);
		});
		compareActiveSide = diffScanSide;
	}

	// ── Walkthrough ──
	const walkthroughStorageKey = 'fortune-sandbox-walkthrough-v3';
	const walkthroughSteps = [
		{
			target: 'fortune-guide-hero',
			title: 'Welcome to the Sandbox',
			description: 'Model farming fortune setups and see expected rates without touching your real profile.',
			position: 'bottom' as const,
		},
		{
			target: 'fortune-guide-mode',
			title: 'Pick a Mode',
			description: 'Full mode gives item-level control. Compare mode lets you test two setups side by side.',
			position: 'bottom' as const,
		},
		{
			target: 'fortune-guide-crop',
			title: 'Choose a Crop',
			description: 'All fortune calculations, tools, and rate outputs are based on the selected crop.',
			position: 'bottom' as const,
		},
		{
			target: 'fortune-guide-assumptions',
			title: 'Rate Settings',
			description:
				'Farming duration and blocks per second apply to all results. Higher efficiency means more drops per session.',
			position: 'top' as const,
		},
		{
			target: 'fortune-guide-results-column',
			title: 'Results',
			description: 'Fortune breakdown, profit, and collection estimates update live as you change your setup.',
			position: 'left' as const,
		},
	];

	function startWalkthrough() {
		walkthroughOpen = true;
	}

	function completeWalkthrough() {
		if (!browser) return;
		window.localStorage.setItem(walkthroughStorageKey, '1');
	}

	// ── Initialization ──
	onMount(() => {
		selectedCrops.update((crops) =>
			Object.values(crops).some((isSelected) => isSelected) ? crops : { ...DEFAULT_SELECTED_CROPS, Wheat: true }
		);
		const hasSeenWalkthrough = window.localStorage.getItem(walkthroughStorageKey) === '1';
		if (!hasSeenWalkthrough) {
			walkthroughOpen = true;
		}
		const initialShareIdValue = typeof initialShareId === 'function' ? initialShareId() : initialShareId;
		const shareId = (initialShareIdValue ?? page.url.searchParams.get('share') ?? '').trim();
		if (shareId) {
			void importSharedSetup(shareId);
		}
	});

	return {
		// Mode
		get mode() {
			return mode;
		},
		set mode(v: SandboxMode) {
			setMode(v);
		},
		get compareMode() {
			return compareMode;
		},

		// Sides
		get sideA() {
			return sideA;
		},
		set sideA(v) {
			sideA = v;
		},
		get sideB() {
			return sideB;
		},
		set sideB(v) {
			sideB = v;
		},
		get sideNameA() {
			return sideNameA;
		},
		get sideNameB() {
			return sideNameB;
		},
		get sideNames() {
			return sideNames;
		},
		set sideNames(v) {
			sideNames = v;
		},

		// Compare
		get compareActiveSide() {
			return compareActiveSide;
		},
		set compareActiveSide(v) {
			compareActiveSide = v;
		},
		get compareMobileTab() {
			return compareMobileTab;
		},
		set compareMobileTab(v) {
			compareMobileTab = v;
		},
		get compareLinkedSections() {
			return compareLinkedSections;
		},
		set compareLinkedSections(v) {
			compareLinkedSections = v;
		},

		// Crop / Rate
		get selectedCrop() {
			return selectedCrop;
		},
		get selectedCropKey() {
			return selectedCropKey;
		},
		get blocksBroken() {
			return blocksBroken;
		},
		set blocksBroken(v) {
			blocksBroken = v;
		},
		get bps() {
			return bps;
		},
		set bps(v) {
			bps = v;
		},
		get blocksActuallyBroken() {
			return blocksActuallyBroken;
		},

		// Bazaar
		get bazaarLoading() {
			return bazaarLoading;
		},
		get bazaarError() {
			return bazaarError;
		},

		// Contexts
		get sideAContext() {
			return sideAContext;
		},
		get sideBContext() {
			return sideBContext;
		},
		get primaryContext() {
			return primaryContext;
		},
		get selectedToolA() {
			return selectedToolA;
		},
		get selectedToolB() {
			return selectedToolB;
		},

		// Diff / What-If
		get diffMode() {
			return diffMode;
		},
		set diffMode(v) {
			diffMode = v;
		},
		get diffMetric() {
			return diffMetric;
		},
		get diffScanSide() {
			return diffScanSide;
		},
		get diffFieldId() {
			return diffFieldId;
		},
		get diffRange() {
			return diffRange;
		},
		set diffRange(v) {
			diffRange = v;
		},
		get diffResult() {
			return diffResult;
		},
		get diffMessage() {
			return diffMessage;
		},
		get compareSummaryRows() {
			return compareSummaryRows;
		},
		get compareCoinSourceDiff() {
			return compareCoinSourceDiff;
		},
		get compareCollectionSourceDiff() {
			return compareCollectionSourceDiff;
		},
		get compareSideOptions() {
			return compareSideOptions;
		},
		get whatIfFieldOptions() {
			return whatIfFieldOptions;
		},
		get currentWhatIfFieldSectionLabel() {
			return currentWhatIfFieldSectionLabel;
		},

		// Import
		get importMessage() {
			return importMessage;
		},
		get sideAImportState() {
			return sideAImportState;
		},
		set sideAImportState(v) {
			sideAImportState = v;
		},
		get sideBImportState() {
			return sideBImportState;
		},
		set sideBImportState(v) {
			sideBImportState = v;
		},
		get loadedSharedSetup() {
			return loadedSharedSetup;
		},

		// Walkthrough
		get walkthroughOpen() {
			return walkthroughOpen;
		},
		set walkthroughOpen(v) {
			walkthroughOpen = v;
		},
		walkthroughSteps,

		// Methods
		setMode,
		setSectionLinked,
		onSectionInteraction,
		getSideDisplayName,
		loadPlayer,
		reloadSelectedProfile,
		createSharePayload,
		startWalkthrough,
		completeWalkthrough,
		onDiffMetricChange,
		onDiffScanSideChange,
		onDiffFieldChange,
		onDiffRangeInput,
		runWhatIfScan,
		applyWhatIfValue,
		formatSigned,
		createDefaultTool,
		getLoginRedirectHref,

		// Global
		gbl,
	};
}

export type FortuneSandboxState = ReturnType<typeof createFortuneSandboxState>;
