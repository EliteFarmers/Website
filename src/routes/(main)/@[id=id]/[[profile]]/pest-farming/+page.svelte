<script lang="ts">
	import Head from '$comp/head.svelte';
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import CategoryProgress from '$comp/rates/category-progress.svelte';
	import PestGearSelector from '$comp/rates/pest/pest-gear-selector.svelte';
	import PestStatsSummary from '$comp/rates/pest/pest-stats-summary.svelte';
	import VacuumSelector from '$comp/rates/pest/vacuum-selector.svelte';
	import UpgradeList from '$comp/rates/upgrades/upgrade-list.svelte';
	import Cropselector from '$comp/stats/contests/crop-selector.svelte';
	import { trackAnalytics } from '$lib/analytics';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { PROPER_CROP_TO_API_CROP } from '$lib/constants/crops';
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import { getItemsFromUpgrades, getUpgradeCost } from '$lib/items';
	import { getHarvestFeast } from '$lib/remote/harvest-feast.remote';
	import { getItems } from '$lib/remote/items.remote';
	import { getRatesData } from '$lib/stores/ratesData';
	import { DEFAULT_SELECTED_CROPS, getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import { Skeleton } from '$ui/skeleton';
	import { Switch } from '$ui/switch';
	import * as Tabs from '$ui/tabs';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Shield from '@lucide/svelte/icons/shield';
	import SprayCan from '@lucide/svelte/icons/spray-can';
	import {
		createPestFarmingPlayer,
		Crop,
		CROP_INFO,
		FarmingArmor,
		FarmingEquipment,
		FarmingPet,
		FarmingTool,
		GearSlot,
		getCropFromName,
		getCropMilestoneLevels,
		getCropUpgrades,
		getGardenLevel,
		getPestPhaseUpgradePriority,
		PEST_ARMOR_SLOTS,
		PEST_DEFAULT_WEIGHTS,
		PEST_EQUIPMENT_SLOTS,
		PEST_FARMING_PHASE_STATS,
		PEST_FARMING_STATS,
		PestFarmingPhase,
		PEST_PHASE_WEIGHTS,
		Stat,
		STAT_NAMES,
		Vacuum,
		VACUUM_STATS,
		type EliteItemDto,
		type FortuneSourceProgress,
		type FortuneUpgrade,
		type PestArmorSetLoadout,
		type PestFarmingPlayerOptions,
		type StatBreakdown,
		type UpgradeTreeNode,
	} from 'farming-weight';
	import { Debounced } from 'runed';
	import { onMount, untrack } from 'svelte';

	const ctx = getStatsContext();
	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();
	const harvestFeast = getHarvestFeast();

	const PHASE_CONFIG = [
		{
			phase: PestFarmingPhase.Farm,
			label: 'Farm',
			title: 'Farm Phase',
			description: 'Crop output while pest spawn cooldown is running.',
			progress: 'Farm Sources',
		},
		{
			phase: PestFarmingPhase.Spawn,
			label: 'Spawn',
			title: 'Spawn Phase',
			description: 'Bonus Pest Chance and cooldown reduction when pests are about to spawn.',
			progress: 'Spawn Sources',
		},
		{
			phase: PestFarmingPhase.Kill,
			label: 'Kill',
			title: 'Kill Phase',
			description: 'Vacuuming pests and maximizing pest drop stats.',
			progress: 'Kill Sources',
		},
	] as const;

	const SHARED_EQUIPMENT_STATS = [
		Stat.BonusPestChance,
		Stat.PestCooldownReduction,
		Stat.PestKillFortune,
		Stat.FarmingFortune,
		Stat.Overbloom,
	];

	const cropKey = (crop: string) =>
		(PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ??
			getCropFromName(crop) ??
			Crop.Wheat) as Crop;

	let pestVersion = $state(0);
	let selectedVacuumId = $state('');
	let activePhase = $state<PestFarmingPhase>(PestFarmingPhase.Farm);

	let pets = $derived.by(() => (ctx.ready ? FarmingPet.fromArray(ctx.pets) : []));
	let tools = $derived.by(() => (ctx.ready ? FarmingTool.fromArray(ctx.tools as EliteItemDto[]) : []));
	let vacuums = $derived.by(() => (ctx.ready ? Vacuum.fromArray(ctx.tools as EliteItemDto[]) : []));
	let armor = $derived.by(() => (ctx.ready ? FarmingArmor.fromArray(ctx.armor as EliteItemDto[]) : []));
	let equipment = $derived.by(() => (ctx.ready ? FarmingEquipment.fromArray(ctx.equipment as EliteItemDto[]) : []));

	const selectedCropName = $derived(Object.entries($selectedCrops).find(([, value]) => value)?.[0] ?? 'Wheat');
	const selectedCropKey = $derived(cropKey(selectedCropName));
	const selectedVacuum = $derived(vacuums.find((vacuum) => vacuum.item.uuid === selectedVacuumId) ?? vacuums[0]);

	const harvestFeastPerks = $derived.by(() => {
		const current = ctx.member.current?.stats?.carnival?.harvestFeast;
		if (!current) return undefined;

		return {
			natural_talent: current.naturalTalent,
			fortunate_feasting: current.fortunateFeasting,
			feast_crashers: current.feastCrashers,
		};
	});

	const harvestFeastOptions = $derived.by<PestFarmingPlayerOptions['harvestFeast']>(() => {
		const current = harvestFeast.current;
		const inSeasonCrops = (current?.current ?? [])
			.map((crop) => cropKey(crop))
			.filter((crop) => crop !== undefined);

		return {
			active: inSeasonCrops.length > 0,
			inSeasonCrops,
			grandFeast: current?.isGrandFeast ?? false,
			perks: harvestFeastPerks,
		};
	});

	let options = $derived({
		tools,
		vacuums,
		armor,
		equipment,
		accessories: ctx.accessories as EliteItemDto[],
		pets,
		selectedVacuumId,
		armorSets: $ratesData.pestFarming.armorSets,
		phaseLoadouts: $ratesData.pestFarming.phaseLoadouts,
		sharedEquipment: $ratesData.pestFarming.sharedEquipment,
		selectedCrop: selectedCropKey,

		refinedTruffles: ctx.member.current?.chocolateFactory?.refinedTrufflesConsumed ?? 0,
		personalBestsUnlocked: ctx.member.current?.jacob?.perks?.personalBests ?? false,
		personalBests: (ctx.member.current?.jacob?.stats?.personalBests ?? {}) as unknown as Record<string, number>,
		anitaBonus: ctx.member.current?.jacob?.perks?.doubleDrops ?? 0,
		plots: ctx.member.current?.garden?.plots,
		farmingXp: ctx.member.current?.skills?.farming,
		bestiaryKills: (ctx.member.current?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
		uniqueVisitors: ctx.member.current?.garden?.uniqueVisitors ?? 0,
		exportableCrops: ctx.member.current?.unparsed?.exportedCrops ?? {},
		dnaMilestone: ctx.member.current?.unparsed?.dnaMilestone ?? 0,
		attributes: ctx.member.current?.memberData?.attributes ?? {},
		chips: ctx.member.current?.memberData?.garden?.chips ?? {},
		perks: ctx.member.current?.unparsed?.perks ?? undefined,
		harvestFeast: harvestFeastOptions,

		farmingLevel: getLevelProgress(
			'farming',
			ctx.member.current?.skills?.farming ?? 0,
			(ctx.member.current?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		).level,
		milestones: getCropMilestoneLevels(
			(ctx.member.current?.garden?.crops ?? {}) as unknown as Record<string, number>
		),
		cropUpgrades: getCropUpgrades(
			(ctx.member.current?.garden?.cropUpgrades ?? {}) as unknown as Record<string, number>
		),
		gardenLevel: getGardenLevel(Number(ctx.member.current?.garden?.experience ?? 0)).level,

		communityCenter: $ratesData.communityCenter,
		filledRosewaterFlask: $ratesData.rosewaterFlasks,
		strength: $ratesData.strength,
		wrigglingLarva: Number(ctx.member.current?.unparsed?.consumed?.wriggling_larva ?? 0),
		sprayedPlot: $ratesData.pestFarming.sprayedPlot,
		pesthunterAccessoryEnabled: true,
		mantidPestKills: 0,
		infestedPlotProbability: $ratesData.infestedPlotProbability,
		cocoaFortuneUpgrade: ctx.member.current?.chocolateFactory?.cocoaFortuneUpgrades,
		temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,
		zorro: $ratesData.zorroMode
			? {
					enabled: ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
					mode: $ratesData.zorroMode,
				}
			: undefined,
	} as PestFarmingPlayerOptions);

	// svelte-ignore state_referenced_locally
	let pestPlayer = $state(createPestFarmingPlayer(options));

	function refreshPestPlayer() {
		pestPlayer = createPestFarmingPlayer(options);
		pestVersion++;
	}

	function refreshPestPlayerWith(patch: Partial<PestFarmingPlayerOptions>): void {
		options = { ...options, ...patch } as PestFarmingPlayerOptions;
		refreshPestPlayer();
	}

	const activePhaseConfig = $derived(PHASE_CONFIG.find((config) => config.phase === activePhase) ?? PHASE_CONFIG[0]);
	const activePhaseLoadout = $derived(pestPlayer.phaseLoadouts[activePhase]);
	const activeArmorSet = $derived(pestPlayer.getArmorSetModel(activePhaseLoadout.armorSetId));
	const activePhasePlayer = $derived(pestPlayer.getPhasePlayer(activePhase));
	const activePhasePet = $derived(activePhasePlayer.pets.find((pet) => pet.pet.uuid === activePhaseLoadout.petId));

	function trackPestVersion(): number {
		return pestVersion;
	}

	function getPieceBreakdown(piece: FarmingArmor | FarmingEquipment, stats = PEST_FARMING_STATS): StatBreakdown {
		const breakdown: StatBreakdown = {};
		const cropStat = CROP_INFO[selectedCropKey]?.fortuneType;
		const statList = cropStat && !stats.includes(cropStat) ? [...stats, cropStat] : stats;
		for (const stat of statList) {
			const value = piece.getStat(stat, selectedCropKey);
			if (value) {
				breakdown[STAT_NAMES[stat]] = { value, stat };
			}
		}
		return breakdown;
	}

	function getPhasePieceBreakdown(piece: FarmingArmor | FarmingEquipment): StatBreakdown {
		return getPieceBreakdown(piece, PEST_FARMING_PHASE_STATS[activePhase]);
	}

	function getSharedEquipmentPieceBreakdown(piece: FarmingArmor | FarmingEquipment): StatBreakdown {
		return getPieceBreakdown(piece, SHARED_EQUIPMENT_STATS);
	}

	function getPhasePieceScore(piece: FarmingArmor | FarmingEquipment): number {
		return pestPlayer.getPieceScore(piece, PEST_PHASE_WEIGHTS[activePhase]);
	}

	function getSharedEquipmentPieceScore(piece: FarmingArmor | FarmingEquipment): number {
		return pestPlayer.getPieceScore(piece, PEST_DEFAULT_WEIGHTS);
	}

	function getPetBreakdown(pet: FarmingPet, phase: PestFarmingPhase): StatBreakdown {
		const breakdown: StatBreakdown = {};
		for (const stat of PEST_FARMING_PHASE_STATS[phase]) {
			const value = pet.getFortune(stat, pestPlayer.getPhasePlayer(phase));
			if (value) breakdown[STAT_NAMES[stat]] = { value, stat };
		}
		return breakdown;
	}

	function getPetPhaseScore(pet: FarmingPet, phase: PestFarmingPhase): number {
		return pestPlayer.getPetScore(pet, phase);
	}

	function getProgressUpgrades(progress: FortuneSourceProgress): FortuneUpgrade[] {
		const uuid = progress.item?.uuid;
		if (!uuid) return progress.upgrades ?? [];

		const vacuum = pestPlayer.vacuums.find((item) => item.item.uuid === uuid);
		if (vacuum) return vacuum.getUpgrades({ stats: VACUUM_STATS });

		return progress.upgrades ?? [];
	}

	function expandPhaseUpgrade(phase: PestFarmingPhase, upgrade: FortuneUpgrade): UpgradeTreeNode {
		return pestPlayer.expandPhaseUpgrade(phase, upgrade, {
			stats: PEST_FARMING_PHASE_STATS[phase],
			crop: selectedCropKey,
		});
	}

	function expandActivePhaseUpgrade(upgrade: FortuneUpgrade): UpgradeTreeNode {
		return expandPhaseUpgrade(activePhase, upgrade);
	}

	function applyPhaseUpgrade(phase: PestFarmingPhase, upgrade: FortuneUpgrade): void {
		pestPlayer.applyPhaseUpgrade(phase, upgrade);
		selectedVacuumId = pestPlayer.selectedVacuum?.item.uuid ?? selectedVacuumId;
		pestVersion++;
		trackAnalytics('pest_farming.upgrade_applied', { phase });
	}

	function applyActivePhaseUpgrade(upgrade: FortuneUpgrade): void {
		applyPhaseUpgrade(activePhase, upgrade);
	}

	function selectVacuum(id: string): void {
		selectedVacuumId = id;
		$ratesData.pestFarming = { ...$ratesData.pestFarming, selectedVacuum: id };
		const vacuum = pestPlayer.vacuums.find((item) => item.item.uuid === id);
		if (vacuum) pestPlayer.selectVacuum(vacuum);
		pestVersion++;
	}

	function getStoredArmorSets(): PestArmorSetLoadout[] {
		return (
			$ratesData.pestFarming.armorSets.length ? $ratesData.pestFarming.armorSets : pestPlayer.armorSetLoadouts
		).map((set) => ({
			...set,
			pieces: { ...set.pieces },
		}));
	}

	function updateArmorSets(armorSets: PestArmorSetLoadout[]): void {
		$ratesData.pestFarming = {
			...$ratesData.pestFarming,
			armorSets,
		};
		refreshPestPlayerWith({ armorSets });
	}

	function selectArmorSetPiece(armorSetId: string, slot: GearSlot, uuid: string): void {
		if (!PEST_ARMOR_SLOTS.includes(slot as (typeof PEST_ARMOR_SLOTS)[number])) return;
		if (pestPlayer.getArmorSetConflict(uuid, armorSetId)) return;

		const armorSets = getStoredArmorSets();
		const next = armorSets.map((set) =>
			set.id === armorSetId
				? {
						...set,
						pieces: {
							...set.pieces,
							[slot]: uuid,
						},
					}
				: set
		);
		updateArmorSets(next);
		trackAnalytics('pest_farming.armor_selected', { slot, phase: activePhase });
	}

	function clearArmorSetPiece(armorSetId: string, slot: GearSlot): void {
		const armorSets = getStoredArmorSets();
		const next = armorSets.map((set) => {
			if (set.id !== armorSetId) return set;
			const pieces = { ...set.pieces };
			pieces[slot] = null;
			return { ...set, pieces };
		});
		updateArmorSets(next);
		trackAnalytics('pest_farming.armor_cleared', { slot, phase: activePhase });
	}

	function selectSharedEquipment(slot: GearSlot, uuid: string): void {
		if (!PEST_EQUIPMENT_SLOTS.includes(slot as (typeof PEST_EQUIPMENT_SLOTS)[number])) return;
		const sharedEquipment = {
			...$ratesData.pestFarming.sharedEquipment,
			[slot]: uuid,
		};
		$ratesData.pestFarming = {
			...$ratesData.pestFarming,
			sharedEquipment,
		};
		refreshPestPlayerWith({ sharedEquipment });
		trackAnalytics('pest_farming.equipment_selected', { slot });
	}

	function clearSharedEquipment(slot: GearSlot): void {
		const sharedEquipment = { ...$ratesData.pestFarming.sharedEquipment };
		delete sharedEquipment[slot];
		$ratesData.pestFarming = {
			...$ratesData.pestFarming,
			sharedEquipment,
		};
		refreshPestPlayerWith({ sharedEquipment });
		trackAnalytics('pest_farming.equipment_cleared', { slot });
	}

	function selectPhaseArmorSet(phase: PestFarmingPhase, armorSetId: string): void {
		const phaseLoadouts = {
			...$ratesData.pestFarming.phaseLoadouts,
			[phase]: {
				...$ratesData.pestFarming.phaseLoadouts[phase],
				armorSetId,
			},
		};
		$ratesData.pestFarming = {
			...$ratesData.pestFarming,
			phaseLoadouts,
		};
		refreshPestPlayerWith({ phaseLoadouts });
		trackAnalytics('pest_farming.phase_armor_set_selected', { phase });
	}

	function selectPhasePet(phase: PestFarmingPhase, petId: string): void {
		const phaseLoadouts = {
			...$ratesData.pestFarming.phaseLoadouts,
			[phase]: {
				...$ratesData.pestFarming.phaseLoadouts[phase],
				petId,
			},
		};
		$ratesData.pestFarming = {
			...$ratesData.pestFarming,
			phaseLoadouts,
		};
		refreshPestPlayerWith({ phaseLoadouts });
		trackAnalytics('pest_farming.phase_pet_selected', { phase });
	}

	function getPhaseUpgradeScore(upgrade: FortuneUpgrade): number {
		return getPestPhaseUpgradePriority(activePhase, upgrade);
	}

	const pestStats = $derived.by(() => {
		trackPestVersion();
		return PEST_FARMING_PHASE_STATS[activePhase].map((stat) => ({
			stat,
			total: pestPlayer.getPhaseStat(activePhase, stat, selectedCropKey),
			breakdown: pestPlayer.getPhaseStatBreakdown(activePhase, stat, selectedCropKey),
		}));
	});

	const cropFortune = $derived.by(() => {
		trackPestVersion();
		return pestPlayer.crop.getCropFortune(selectedCropKey);
	});

	const cropContextStats = $derived.by(() => {
		const cropStat = CROP_INFO[selectedCropKey]?.fortuneType ?? Stat.FarmingFortune;
		return cropStat === Stat.FarmingFortune
			? [Stat.FarmingFortune, Stat.Overbloom]
			: [cropStat, Stat.FarmingFortune, Stat.Overbloom];
	});

	const cropContextSummary = $derived.by(() => {
		trackPestVersion();
		return cropContextStats.map((stat) => ({
			stat,
			total: pestPlayer.crop.getStat(stat, selectedCropKey),
			breakdown: pestPlayer.crop.getStatBreakdown(stat, selectedCropKey),
		}));
	});

	const cropProgress = $derived.by(() => {
		trackPestVersion();
		return pestPlayer.getCropProgress(selectedCropKey, cropContextStats);
	});

	const sharedEquipmentProgress = $derived.by(() => {
		trackPestVersion();
		return pestPlayer.getSharedEquipmentProgress(SHARED_EQUIPMENT_STATS);
	});

	const activeArmorSetProgress = $derived.by(() => {
		trackPestVersion();
		return pestPlayer.getArmorSetProgress(activePhaseLoadout.armorSetId, PEST_FARMING_PHASE_STATS[activePhase]);
	});

	const activePhaseGeneralProgress = $derived.by(() => {
		trackPestVersion();
		return pestPlayer.getPhaseProgress(activePhase, PEST_FARMING_PHASE_STATS[activePhase]);
	});

	const vacuumProgress = $derived.by(() => {
		trackPestVersion();
		return pestPlayer.getVacuumProgress(VACUUM_STATS);
	});

	const activePhaseUpgrades = $derived.by(() => {
		trackPestVersion();
		return pestPlayer.getPhaseUpgrades(activePhase, {
			stats: PEST_FARMING_PHASE_STATS[activePhase],
			includeUpgradeGroups: true,
		});
	});

	const armorSetConflictLabels = $derived.by(() => {
		trackPestVersion();
		const result: Record<string, string> = {};
		for (const set of pestPlayer.armorSetLoadouts) {
			if (set.id === activePhaseLoadout.armorSetId) continue;
			for (const uuid of Object.values(set.pieces)) {
				if (uuid) result[uuid] = set.name;
			}
		}
		return result;
	});

	const visibleProgressUpgrades = $derived.by(() => {
		trackPestVersion();
		const progress = [
			...cropProgress,
			...sharedEquipmentProgress,
			...activeArmorSetProgress,
			...activePhaseGeneralProgress,
			...(activePhase === PestFarmingPhase.Kill ? vacuumProgress : []),
		];
		return progress.flatMap(getProgressUpgrades);
	});

	const allTreeUpgrades = $derived.by(() => {
		trackPestVersion();
		const result: FortuneUpgrade[] = [...visibleProgressUpgrades];
		const seen: Record<string, true> = {};
		const traverse = (node: UpgradeTreeNode) => {
			const key = node.upgrade.conflictKey ?? `${node.upgrade.title}:${node.upgrade.action}`;
			if (!seen[key]) {
				seen[key] = true;
				result.push(node.upgrade);
			}
			node.children.forEach(traverse);
		};

		for (const upgrade of activePhaseUpgrades) {
			traverse(expandActivePhaseUpgrade(upgrade));
		}
		return result;
	});

	const neededItems = $derived(getItemsFromUpgrades(allTreeUpgrades));
	const debouncedItems = new Debounced(() => neededItems, 1000);
	let itemsData = $state<RatesItemPriceData>({});

	$effect(() => {
		const items = debouncedItems.current;
		if (items.length > 0) {
			getItems(items).then((data) => {
				itemsData = { ...itemsData, ...data };
			});
		}
	});

	$effect(() => {
		if (!ctx.ready) return;
		const previous = untrack(() => options);
		options = {
			...previous,
			tools,
			vacuums,
			armor,
			equipment,
			accessories: ctx.accessories as EliteItemDto[],
			pets,
			selectedVacuumId,
			armorSets: $ratesData.pestFarming.armorSets,
			phaseLoadouts: $ratesData.pestFarming.phaseLoadouts,
			sharedEquipment: $ratesData.pestFarming.sharedEquipment,
			selectedCrop: selectedCropKey,
			wrigglingLarva: Number(ctx.member.current?.unparsed?.consumed?.wriggling_larva ?? 0),
			sprayedPlot: $ratesData.pestFarming.sprayedPlot,
			pesthunterAccessoryEnabled: true,
			mantidPestKills: 0,
			temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,
		};
		untrack(refreshPestPlayer);
	});

	$effect(() => {
		if (!ctx.ready) return;
		if ($ratesData.pestFarming.selectedCrop !== selectedCropName) {
			$ratesData.pestFarming = { ...$ratesData.pestFarming, selectedCrop: selectedCropName };
		}
	});

	$effect(() => {
		if (!ctx.ready || !vacuums.length) return;
		const savedId = $ratesData.pestFarming.selectedVacuum;
		const nextId = vacuums.some((vacuum) => vacuum.item.uuid === savedId) ? savedId : (vacuums[0]?.item.uuid ?? '');
		if (nextId && selectedVacuumId !== nextId) selectVacuum(nextId);
	});

	onMount(() => {
		const savedCrop = $ratesData.pestFarming.selectedCrop;
		if (savedCrop) {
			selectedCrops.set({ ...DEFAULT_SELECTED_CROPS, [savedCrop]: true });
		}
	});
</script>

<Head
	title="{ctx.ignMeta} | Pest Farming"
	description="Track pest farming phases, shared equipment, vacuum progress, and phase-scoped upgrades for Hypixel SkyBlock farming."
	canonicalPath="/@{ctx.ign}/{encodeURIComponent(ctx.selectedProfile?.profileName ?? '')}/pest-farming"
	noindex={ctx.hideFromIndex}
/>

{#if ctx.ready}
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-2 py-4 md:gap-10 md:py-6">
		<section class="flex flex-col gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
				<h1 class="text-3xl leading-tight font-semibold md:text-4xl">Pest Farming</h1>
				<div class="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						href="/@{ctx.ign}/{encodeURIComponent(ctx.selectedProfile?.profileName ?? '')}/fortune"
					>
						Fortune Stats
					</Button>
				</div>
			</div>
			<Cropselector radio={true} analyticsEvent="pest_farming.crop_selected" />
		</section>

		<section class="bg-card grid gap-3 rounded-lg border p-4 md:grid-cols-2 md:p-5">
			<div class="bg-muted/30 flex items-center justify-between gap-3 rounded-md p-3">
				<div class="flex items-center gap-2">
					<SprayCan class="size-4" />
					<h2 class="text-sm font-semibold">Sprayed Plot</h2>
				</div>
				<Switch
					checked={$ratesData.pestFarming.sprayedPlot}
					onCheckedChange={(checked) => {
						$ratesData.pestFarming = { ...$ratesData.pestFarming, sprayedPlot: checked };
						refreshPestPlayer();
					}}
				/>
			</div>
			<div class="bg-muted/30 flex items-center justify-between gap-3 rounded-md p-3">
				<h2 class="text-sm font-semibold">Stinky Cheese Potion</h2>
				<Switch
					checked={$ratesData.useTemp && $ratesData.temp.stinkyCheesePotion}
					onCheckedChange={(checked) => {
						$ratesData.useTemp = checked ? true : $ratesData.useTemp;
						$ratesData.temp = { ...$ratesData.temp, stinkyCheesePotion: checked };
						refreshPestPlayer();
					}}
				/>
			</div>
		</section>

		<section class="bg-card flex flex-col gap-4 rounded-lg border p-4 md:p-6">
			<header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h2 class="text-xl leading-tight font-semibold">Crop Context</h2>
				<Fortunebreakdown
					title="{selectedCropName} Fortune"
					stat={cropContextStats[0]}
					total={cropFortune.fortune}
					breakdown={cropFortune.breakdown}
				/>
			</header>
			<PestStatsSummary entries={cropContextSummary} />
			<CategoryProgress
				name="{selectedCropName} Progress"
				progress={cropProgress}
				items={itemsData}
				costFn={getUpgradeCost}
				applyUpgrade={(upgrade) => applyPhaseUpgrade(PestFarmingPhase.Farm, upgrade)}
				expandUpgrade={(upgrade) => expandPhaseUpgrade(PestFarmingPhase.Farm, upgrade)}
				getUpgrades={getProgressUpgrades}
			/>
		</section>

		<PestGearSelector
			title="Shared Equipment"
			armorSet={pestPlayer.sharedEquipmentSet}
			slots={PEST_EQUIPMENT_SLOTS}
			selectPiece={selectSharedEquipment}
			clearPiece={clearSharedEquipment}
			getPieceBreakdown={getSharedEquipmentPieceBreakdown}
			getPieceScore={getSharedEquipmentPieceScore}
		>
			<CategoryProgress
				name="Shared Equipment Progress"
				progress={sharedEquipmentProgress}
				items={itemsData}
				costFn={getUpgradeCost}
				applyUpgrade={applyActivePhaseUpgrade}
				expandUpgrade={expandActivePhaseUpgrade}
				getUpgrades={getProgressUpgrades}
			/>
		</PestGearSelector>

		<section class="flex flex-col gap-5">
			<header class="flex flex-col gap-3">
				<h2 class="text-2xl leading-tight font-semibold">Phases</h2>
				<Tabs.Root bind:value={activePhase} class="w-full">
					<div class="bg-muted/40 grid w-full gap-1 rounded-lg border p-1 sm:w-fit sm:grid-cols-3">
						{#each PHASE_CONFIG as config (config.phase)}
							<Tabs.Trigger
								value={config.phase}
								class="text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground rounded-md border border-transparent px-5 py-2 text-sm font-semibold transition-colors data-[state=active]:shadow-sm"
							>
								{config.label}
							</Tabs.Trigger>
						{/each}
					</div>
				</Tabs.Root>
			</header>

			<section class="bg-card flex flex-col gap-4 rounded-lg border p-4 md:p-6">
				<h3 class="text-xl leading-tight font-semibold">{activePhaseConfig.title}</h3>

				<div class="grid gap-3 md:grid-cols-2">
					<!-- Armor set loadout card -->
					<div class="bg-muted/30 flex flex-col gap-3 rounded-md border p-3">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="hover:bg-muted/40 group focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-md p-1 text-left transition-colors outline-none focus-visible:ring-2"
								aria-label="Change armor set"
							>
								<div
									class="bg-card text-foreground flex size-11 shrink-0 items-center justify-center rounded-md border"
								>
									<Shield class="size-5" />
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
										Armor Set
									</p>
									<p class="truncate text-base font-semibold">
										{pestPlayer.armorSetLoadouts.find(
											(set) => set.id === activePhaseLoadout.armorSetId
										)?.name ?? 'Select armor set'}
									</p>
								</div>
								<ChevronDown
									class="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
								/>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="min-w-(--bits-dropdown-menu-anchor-width)" align="start">
								<DropdownMenu.Label>Armor Sets</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.RadioGroup
									value={activePhaseLoadout.armorSetId}
									onValueChange={(value) => value && selectPhaseArmorSet(activePhase, value)}
								>
									{#each pestPlayer.armorSetLoadouts as set (set.id)}
										<DropdownMenu.RadioItem value={set.id}>{set.name}</DropdownMenu.RadioItem>
									{/each}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<div class="grid grid-cols-2 gap-2">
							{#each pestPlayer.armorSetLoadouts as set (set.id)}
								<Button
									type="button"
									size="sm"
									variant={set.id === activePhaseLoadout.armorSetId ? 'default' : 'outline'}
									class="min-w-0 justify-start"
									aria-pressed={set.id === activePhaseLoadout.armorSetId}
									onclick={() => selectPhaseArmorSet(activePhase, set.id)}
								>
									<span class="truncate">{set.name}</span>
								</Button>
							{/each}
						</div>

						<div class="flex items-center gap-1.5">
							{#each PEST_ARMOR_SLOTS as slot (slot)}
								{@const piece = activeArmorSet?.slots[slot]}
								{#if piece}
									<ItemRender skyblockId={piece.item.skyblockId ?? ''} class="size-9" />
								{:else}
									<div
										class="bg-muted/40 text-muted-foreground/40 flex size-9 items-center justify-center rounded-sm border border-dashed text-[0.6rem] uppercase"
										title={slot}
									>
										{slot.slice(0, 2)}
									</div>
								{/if}
							{/each}
						</div>
					</div>

					<!-- Pet loadout card -->
					<div class="bg-muted/30 flex flex-col gap-3 rounded-md border p-3">
						{#if pets.length > 0}
							<div class="flex items-center gap-2">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="hover:bg-muted/40 group focus-visible:ring-ring/50 flex flex-1 items-center gap-3 rounded-md p-1 text-left transition-colors outline-none focus-visible:ring-2"
										aria-label="Change pet"
									>
										{#if activePhasePet}
											<ItemRender
												skyblockId={activePhasePet.pet.type ?? ''}
												pet
												class="size-11 shrink-0"
											/>
										{:else}
											<div
												class="bg-card text-muted-foreground/60 flex size-11 shrink-0 items-center justify-center rounded-md border"
											>
												<CircleHelp class="size-5" />
											</div>
										{/if}
										<div class="min-w-0 flex-1">
											<p
												class="text-muted-foreground text-xs font-medium tracking-wide uppercase"
											>
												Active Pet
											</p>
											<div class="truncate text-base font-semibold">
												{#if activePhasePet}
													<FormattedText text={activePhasePet.getFormattedName()} />
												{:else}
													<span class="text-muted-foreground">Select pet</span>
												{/if}
											</div>
										</div>
										<ChevronDown
											class="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
										/>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content
										class="max-h-96 min-w-(--bits-dropdown-menu-anchor-width) overflow-y-auto"
										align="start"
									>
										<DropdownMenu.Label
											>Pets ranked for {activePhaseConfig.label.toLowerCase()} phase</DropdownMenu.Label
										>
										<DropdownMenu.Separator />
										<DropdownMenu.RadioGroup
											value={activePhaseLoadout.petId ?? ''}
											onValueChange={(value) => value && selectPhasePet(activePhase, value)}
										>
											{#each pets
												.filter((pet) => !!pet.pet.uuid)
												.sort((a, b) => getPetPhaseScore(b, activePhase) - getPetPhaseScore(a, activePhase)) as pet, i (pet.pet.uuid ?? i)}
												<DropdownMenu.RadioItem value={pet.pet.uuid ?? ''}>
													<div class="flex flex-row items-center gap-2">
														<ItemRender
															skyblockId={pet.pet.type ?? ''}
															pet
															class="size-6"
														/>
														<FormattedText text={pet.getFormattedName()} />
													</div>
												</DropdownMenu.RadioItem>
											{/each}
										</DropdownMenu.RadioGroup>
									</DropdownMenu.Content>
								</DropdownMenu.Root>

								{#if activePhasePet}
									<Fortunebreakdown
										title="{activePhaseConfig.label} Pet Stats"
										breakdown={getPetBreakdown(activePhasePet, activePhase)}
									/>
								{/if}
							</div>
						{:else}
							<div class="flex items-center gap-3 p-1">
								<div
									class="bg-card text-muted-foreground/60 flex size-11 shrink-0 items-center justify-center rounded-md border"
								>
									<CircleHelp class="size-5" />
								</div>
								<div class="min-w-0">
									<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
										Active Pet
									</p>
									<p class="text-muted-foreground text-sm">No farming pets found.</p>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<PestStatsSummary entries={pestStats} />
			</section>

			{#if activeArmorSet}
				<PestGearSelector
					title="{activePhaseConfig.label} Armor"
					armorSet={activeArmorSet}
					slots={PEST_ARMOR_SLOTS}
					selectPiece={(slot, uuid) => selectArmorSetPiece(activePhaseLoadout.armorSetId, slot, uuid)}
					clearPiece={(slot) => clearArmorSetPiece(activePhaseLoadout.armorSetId, slot)}
					getPieceBreakdown={getPhasePieceBreakdown}
					getPieceScore={getPhasePieceScore}
					blockedUuids={armorSetConflictLabels}
				>
					<CategoryProgress
						name="{activePhaseConfig.label} Armor Progress"
						progress={activeArmorSetProgress}
						items={itemsData}
						costFn={getUpgradeCost}
						applyUpgrade={applyActivePhaseUpgrade}
						expandUpgrade={expandActivePhaseUpgrade}
						getUpgrades={getProgressUpgrades}
					/>
				</PestGearSelector>
			{/if}

			{#if activePhase === PestFarmingPhase.Kill}
				<VacuumSelector {vacuums} selected={selectedVacuum} onSelect={selectVacuum}>
					<CategoryProgress
						name="Vacuum Upgrades"
						progress={vacuumProgress}
						items={itemsData}
						costFn={getUpgradeCost}
						applyUpgrade={applyActivePhaseUpgrade}
						expandUpgrade={expandActivePhaseUpgrade}
						getUpgrades={getProgressUpgrades}
					/>
				</VacuumSelector>
			{/if}

			<section class="bg-card flex flex-col gap-3 rounded-lg border p-4 md:p-6">
				<header class="flex items-center justify-between gap-3">
					<h2 class="text-xl leading-tight font-semibold">{activePhaseConfig.progress}</h2>
					<CircleHelp class="text-muted-foreground size-4" />
				</header>
				<CategoryProgress
					name=""
					progress={activePhaseGeneralProgress}
					items={itemsData}
					costFn={getUpgradeCost}
					applyUpgrade={applyActivePhaseUpgrade}
					expandUpgrade={expandActivePhaseUpgrade}
					getUpgrades={getProgressUpgrades}
				/>
			</section>

			<section class="flex flex-col gap-4">
				<h2 class="text-2xl leading-tight font-semibold">{activePhaseConfig.label} Upgrades</h2>
				<UpgradeList
					upgrades={activePhaseUpgrades}
					items={itemsData}
					costFn={getUpgradeCost}
					applyUpgrade={applyActivePhaseUpgrade}
					expandUpgrade={expandActivePhaseUpgrade}
					costPerValueFn={getPhaseUpgradeScore}
					costPerHeader="Cost Per Phase Score"
					version={pestVersion}
				/>
			</section>
		</section>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 py-4 md:py-6">
		<Skeleton class="h-24 w-full" />
		<div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
			{#each [0, 1, 2, 3, 4] as i (i)}
				<Skeleton class="h-32 w-full" />
			{/each}
		</div>
		<Skeleton class="h-72 w-full" />
		<Skeleton class="h-72 w-full" />
		<Skeleton class="h-96 w-full" />
	</div>
{/if}
