<script lang="ts">
	import CopyToClipboard from '$comp/copy-to-clipboard.svelte';
	import FloatingButton from '$comp/floating-button.svelte';
	import Head from '$comp/head.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import JumpLink from '$comp/jump-link.svelte';
	import CategoryProgress from '$comp/rates/category-progress.svelte';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import FarmingGear from '$comp/rates/farming-gear.svelte';
	import PetSelector from '$comp/rates/pet-selector.svelte';
	import ToolSelector from '$comp/rates/tool-selector.svelte';
	import Cropselector from '$comp/stats/contests/crop-selector.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_API_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import { getItemsFromUpgrades, getUpgradeCost } from '$lib/items';
	import { getItems } from '$lib/remote/items.remote';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getRatesPlayer } from '$lib/stores/ratesPlayer.svelte';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import Settings from '@lucide/svelte/icons/settings';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import {
		ArmorSet,
		calculateDetailedAverageDrops,
		createFarmingPlayer,
		createFarmingWeightCalculator,
		Crop,
		CROP_INFO,
		FarmingArmor,
		FarmingPet,
		FarmingPets,
		FarmingTool,
		getCropFromName,
		getCropMilestoneLevels,
		getCropUpgrades,
		getGardenLevel,
		LotusGear,
		Stat,
		type EliteItemDto,
		type FortuneSourceProgress,
		type FortuneUpgrade,
		type GearSlot,
		type PlayerOptions,
		type UpgradeTreeNode,
	} from 'farming-weight';
	import { Debounced } from 'runed';
	import { onMount, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import BazaarRates from './bazaar-rates.svelte';
	import CheapestUpgrades from './cheapest-upgrades.svelte';
	import RatesSettings from './rates-settings.svelte';

	const ctx = getStatsContext();

	let blocksBroken = $state(24_000 * 3);
	let bps = $state(20);

	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	function updateSelectedTool(c: string) {
		const crop = getCropFromName(c);
		if (!crop) return;

		const newTool = $player.getBestTool(crop);
		if (newTool === selectedTool) {
			player.refresh();
			return;
		}

		selectedTool = newTool;
		selectedToolId = selectedTool?.item.uuid ?? '';

		if (selectedTool) {
			$player.selectTool(selectedTool);
		}
		player.refresh();
	}

	function delayedUpdateSelectedTool(c: string) {
		setTimeout(() => updateSelectedTool(c), 0);
	}

	const cropKey = (crop: string) =>
		(PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ?? getCropFromName(crop)) as Crop;

	const blocksActuallyBroken = $derived(blocksBroken * (bps / 20));

	let pets = $derived.by(() => (ctx.member.ready ? FarmingPet.fromArray(ctx.pets) : []));
	let tools = $derived.by(() => (ctx.member.ready ? FarmingTool.fromArray(ctx.tools as EliteItemDto[]) : []));
	let armor = $derived.by(() => (ctx.member.ready ? FarmingArmor.fromArray(ctx.armor as EliteItemDto[]) : []));
	let equipment = $derived.by(() => (ctx.member.ready ? LotusGear.fromArray(ctx.equipment as EliteItemDto[]) : []));

	// Deselect pet if it's not on this player
	onMount(() => {
		$ratesData.selectedPet = pets.some((pet) => pet.pet.uuid === $ratesData.selectedPet)
			? $ratesData.selectedPet
			: undefined;

		if (!$ratesData.selectedPet && pets.length > 0) {
			pets.sort((a, b) => b.fortune - a.fortune);

			$ratesData.selectedPet = pets[0]?.pet.uuid ?? undefined;
			selectedPet = pets[0];

			$player.selectPet(selectedPet);
			player.refresh();
		}
	});

	let selectedTool = $state<FarmingTool | undefined>(undefined);
	let selectedToolId = $state('');

	let selectedPet = $derived<FarmingPet | undefined>(pets.find((pet) => pet.pet.uuid === $ratesData.selectedPet));

	let armorSet = $derived(new ArmorSet(armor, equipment));

	const selectedCrop = $derived(Object.entries($selectedCrops).find(([, value]) => value)?.[0] ?? '');
	const selectedCropKey = $derived(cropKey(selectedCrop));

	let options = $derived({
		tools: tools,
		armor: armorSet,
		accessories: (ctx.member.current?.farmingWeight?.inventory?.accessories ?? []) as EliteItemDto[],
		pets: pets,

		selectedPet: (() => selectedPet)(),
		selectedTool: (() => selectedTool)(),

		refinedTruffles: ctx.member.current?.chocolateFactory?.refinedTrufflesConsumed ?? 0,
		personalBestsUnlocked: ctx.member.current?.jacob?.perks?.personalBests ?? false,
		personalBests: (ctx.member.current?.jacob?.stats?.personalBests ?? {}) as unknown as Record<string, number>,
		anitaBonus: ctx.member.current?.jacob?.perks?.doubleDrops ?? 0,
		plots: ctx.member.current?.garden?.plots,
		farmingXp: ctx.member.current?.skills?.farming,
		bestiaryKills: (ctx.member.current?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
		uniqueVisitors: ctx.member.current?.garden?.uniqueVisitors ?? 0,
		exportableCrops: ctx.member.current?.unparsed.exportedCrops ?? {},
		dnaMilestone: ctx.member.current?.unparsed?.dnaMilestone ?? 0,
		attributes: ctx.member.current?.memberData?.attributes ?? {},
		chips: ctx.member.current?.memberData?.garden?.chips ?? {},

		perks: ctx.member.current?.unparsed?.perks ?? undefined,

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
		gardenLevel: getGardenLevel(ctx.member.current?.garden?.experience ?? 0).level,

		communityCenter: $ratesData.communityCenter,
		filledRosewaterFlask: $ratesData.rosewaterFlasks,
		strength: $ratesData.strength,

		sprayedPlot: $ratesData.sprayedPlot,
		infestedPlotProbability: $ratesData.infestedPlotProbability,

		cocoaFortuneUpgrade: ctx.member.current?.chocolateFactory?.cocoaFortuneUpgrades,
		temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,

		zorro: $ratesData.zorroMode
			? {
					enabled: ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
					mode: $ratesData.zorroMode,
				}
			: undefined,

		selectedCrop: selectedCropKey,
	} as PlayerOptions);

	// svelte-ignore state_referenced_locally
	let player = $state(getRatesPlayer(options));

	const cropFortune = $derived($player.getCropFortune(getCropFromName(selectedCrop) ?? undefined));
	const selectedCropFortuneType = $derived(selectedCropKey ? CROP_INFO[selectedCropKey]?.fortuneType : undefined);

	const cropOnlyBreakdown = $derived.by(() => {
		if (!selectedCropKey || !selectedCropFortuneType) return {};
		const filtered: typeof cropFortune.breakdown = {};
		for (const [key, entry] of Object.entries(cropFortune.breakdown ?? {})) {
			if (entry.stat === selectedCropFortuneType) {
				filtered[key] = entry;
			}
		}
		return filtered;
	});

	const generalProgress = $derived($player.getProgress([Stat.FarmingFortune]));
	const gearProgress = $derived($player.armorSet.getProgress([Stat.FarmingFortune]));
	const cropProgress = $derived($player.getCropProgress(getCropFromName(selectedCrop) ?? Crop.Wheat));

	const cropToolSwitchOptions = $derived.by(() => {
		const list = selectedCropKey ? tools.filter((t) => t.crop === selectedCropKey) : tools;
		return list.filter((t) => !!t.item.uuid).map((t) => ({ value: t.item.uuid ?? '', label: t.name }));
	});

	const allToolOptions = $derived.by(() =>
		tools.filter((t) => !!t.item.uuid).map((t) => ({ value: t.item.uuid ?? '', label: t.name }))
	);

	function getToolEquipConfig(
		p: FortuneSourceProgress,
		options: { value: string; label: string }[]
	): {
		options: { value: string; label: string }[];
		value?: string;
		placeholder?: string;
		onChange: (value: string) => void;
	} | null {
		const uuid = p.item?.uuid;
		if (!uuid) return null;
		if (!$player.tools.some((t) => t.item.uuid === uuid)) return null;
		return {
			options,
			value: selectedToolId,
			placeholder: 'Equip tool',
			onChange: (value) => {
				selectedToolId = value;
			},
		};
	}

	function getGearEquipConfig(p: FortuneSourceProgress): {
		options: { value: string; label: string }[];
		value?: string;
		placeholder?: string;
		onChange: (value: string) => void;
	} | null {
		const uuid = p.item?.uuid;
		if (!uuid) return null;

		const set = $player.armorSet;
		const slot = (Object.entries(set.slots) as [GearSlot, (typeof set.slots)[GearSlot]][])?.find(
			([, piece]) => piece?.item.uuid === uuid
		)?.[0];
		if (!slot) return null;

		const options = (set.slotOptions[slot] ?? [])
			.filter((piece) => !!piece.item.uuid)
			.map((piece) => ({ value: piece.item.uuid ?? '', label: piece.item.name ?? slot }));

		return {
			options,
			value: set.getPiece(slot)?.item.uuid ?? uuid,
			placeholder: `Swap ${slot}`,
			onChange: (value) => {
				const piece =
					set.pieces.find((a) => a.item.uuid === value) ??
					set.equipmentPieces.find((e) => e.item.uuid === value);
				if (!piece) return;
				set.setPiece(piece);
				player.refresh();
			},
		};
	}

	function getProgressUpgrades(p: FortuneSourceProgress): FortuneUpgrade[] {
		const uuid = p.item?.uuid;
		if (uuid) {
			// Check if this is a tool and call getUpgrades() directly on the tool
			const tool = $player.tools.find((t) => t.item.uuid === uuid);
			if (tool) {
				// Use crop-specific fortune type if available
				const stat = tool.crops[0] ? CROP_INFO[tool.crops[0]]?.fortuneType : Stat.FarmingFortune;
				return tool.getUpgrades({ stat: stat ?? Stat.FarmingFortune });
			}
		}
		// Fall back to the progress upgrades
		return p.upgrades ?? [];
	}

	const allProgress = $derived([...generalProgress, ...gearProgress, ...cropProgress]);

	function getUpgradeKey(upgrade: FortuneUpgrade): string {
		const metaKey = upgrade.meta?.id ?? upgrade.meta?.key ?? '';
		return `${upgrade.category}|${upgrade.title}|${metaKey}|${upgrade.conflictKey ?? ''}`;
	}

	const allTreeUpgrades = $derived.by(() => {
		const result: FortuneUpgrade[] = [];
		const seen = new SvelteSet<string>();

		const traverse = (node: UpgradeTreeNode) => {
			const key = getUpgradeKey(node.upgrade);
			if (!seen.has(key)) {
				seen.add(key);
				result.push(node.upgrade);
			}
			node.children.forEach(traverse);
		};

		for (const p of allProgress) {
			// Use getProgressUpgrades to get tool upgrades correctly
			const upgrades = getProgressUpgrades(p);
			for (const u of upgrades) {
				const tree = $player.expandUpgrade(u);
				traverse(tree);
			}
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
		if (!ctx.member.ready) return;

		options = {
			...untrack(() => $player.options),
			selectedPet: untrack(() => $player.selectedPet),
			selectedTool: untrack(() => $player.selectedTool),
			armor: untrack(() => $player.armorSet),
			communityCenter: $ratesData.communityCenter,
			filledRosewaterFlask: $ratesData.rosewaterFlasks,
			strength: $ratesData.strength,
			temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,
			sprayedPlot: $ratesData.sprayedPlot,
			infestedPlotProbability: $ratesData.infestedPlotProbability,
			zorro: {
				enabled: ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
				mode: $ratesData.zorroMode,
			},
			selectedCrop: selectedCropKey,
		};

		untrack(() => {
			player.update(() => createFarmingPlayer(options));
		});
	});

	const calculatorOptions = $derived.by(() => {
		return {
			farmingFortune: cropFortune.fortune,
			bountiful: $player.selectedTool?.reforge?.name === 'Bountiful',
			mooshroom: $player.selectedPet?.type === FarmingPets.MooshroomCow,
			blocksBroken: blocksActuallyBroken,
			armorPieces: $player.armorSet.specialDropsCount(selectedCropKey),
			infestedPlotProbability: $ratesData.infestedPlotProbability,
			maxTool: $player.selectedTool?.level === 50,
			pet: $player.selectedPet,
		} as Parameters<typeof calculateDetailedAverageDrops>[0];
	});
	const calculator = $derived(calculateDetailedAverageDrops(calculatorOptions));

	const selected = $derived(
		Object.entries(calculator).find(([cropId]) => $selectedCrops[PROPER_CROP_NAME[cropId] ?? ''])
	);

	const weightGain = $derived.by(() => {
		if (!selected) return 0;
		return createFarmingWeightCalculator({
			collection: {
				[Crop.Mushroom]: selected[1].otherCollection[Crop.Mushroom],
				[selected[0]]: selected[1].collection,
			},
		}).getWeightInfo().cropWeight;
	});

	const totalFortune = $derived(cropFortune.fortune);
	const fortuneBreakdown = $derived(cropFortune.breakdown);

	$effect(() => {
		if (selectedToolId !== untrack(() => selectedTool?.item.uuid)) {
			untrack(() => {
				selectedTool = $player.tools.find((tool) => tool.item.uuid === selectedToolId);
				if (selectedTool) {
					$player.selectTool(selectedTool);
					player.refresh();
				}
			});
		}
	});

	$effect(() => {
		delayedUpdateSelectedTool(selectedCrop);
	});
</script>

<Head
	title="{ctx.ignMeta} | Farming Fortune"
	description="See missing fortune upgrades, overall progress, and your expected farming rates in Hypixel Skyblock!"
/>

<FloatingButton onclick={() => ($ratesData.settings = !$ratesData.settings)}>
	<Settings class="transition-all group-hover:rotate-90 md:size-6!" />
</FloatingButton>

<div class="flex w-full flex-col items-center justify-center gap-4">
	<Cropselector radio={true} />

	<div class="flex w-full max-w-6xl flex-col justify-center gap-4 md:flex-row">
		<section class="bg-card flex w-full flex-1 flex-col items-center gap-4 rounded-md border-2 p-4 md:py-4">
			<div class="flex w-full flex-row items-center justify-between">
				<div class="hidden flex-1 sm:block"></div>
				<div class="my-2 flex flex-3 flex-row items-center gap-2">
					<h2 class="mb-2 text-lg leading-none md:text-2xl">Farming Fortune</h2>
					<Fortunebreakdown title="Total Farming Fortune" total={totalFortune} breakdown={fortuneBreakdown} />
				</div>
				<div class="flex flex-1 justify-end">
					<Button
						variant="outline"
						class="m-1"
						size="sm"
						onclick={() => ($ratesData.settings = !$ratesData.settings)}
					>
						<Settings size={20} />
					</Button>
				</div>
			</div>

			{#if selectedCrop}
				<div class="mb-2 flex flex-row items-center gap-2">
					<h3 class="text-xl">{selectedCrop} Fortune</h3>

					<Fortunebreakdown title="{selectedCrop} Fortune" breakdown={cropOnlyBreakdown}>
						<p class="text-xs">
							This shows only {selectedCrop} Fortune sources. Total farming fortune (including crop fortune)
							is shown above.
						</p>
					</Fortunebreakdown>
				</div>
			{/if}

			<div class="flex flex-col items-center justify-evenly gap-4 md:flex-row md:gap-8">
				<div class="flex flex-row items-center gap-4 align-middle">
					<p class="text-sm">Garden Level</p>
					<p class="font-semibold">{options.gardenLevel}</p>
				</div>
				<div class="flex flex-row items-center gap-4 align-middle">
					<p class="text-sm">Unlocked Plots</p>
					<p class="font-semibold">{options.plotsUnlocked}</p>
				</div>
			</div>

			{#if selectedCrop}
				<div class="flex w-full max-w-lg flex-row items-center justify-center gap-2 md:gap-4">
					<img
						src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
						alt={selectedCrop}
						class="pixelated m-1 h-12 w-12 p-1"
					/>
					<div class="flex flex-col gap-4">
						<div class="flex flex-1 flex-row justify-center gap-4">
							<div class="flex flex-col items-center gap-2">
								<p class="text-md">Garden Milestone</p>
								<p class="text-lg font-semibold">
									{options.milestones?.[selectedCropKey] ?? 0}
								</p>
							</div>
							<div class="flex flex-col items-center gap-2">
								<p class="text-md">Crop Upgrade</p>
								<p class="text-lg font-semibold">
									{options.cropUpgrades?.[selectedCropKey] ?? 0}
								</p>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<p class="text-center text-lg font-semibold">Select a crop to see its fortune!</p>
			{/if}

			<PetSelector {player} bind:selected={selectedPet} />
			<div id="rates-tool-selector" class="w-full">
				<ToolSelector {tools} {player} bind:selectedToolId {selectedCropKey} />
			</div>

			<div id="rates-gear-selector" class="flex w-full flex-col gap-2">
				<FarmingGear {player} />
			</div>
		</section>
		<section class="bg-card w-full flex-1 rounded-md border-2 p-4">
			<div class="flex h-full w-full max-w-lg flex-col gap-2 p-2">
				{#if selected}
					{@const [cropId, info] = selected}
					{@const coinBreakdown = Object.entries(info.coinSources).sort(([, a], [, b]) => b - a)}
					{@const otherBreakdown = Object.entries(info.otherCollection).sort(([, a], [, b]) => b - a)}

					<div class="flex flex-col items-start gap-2">
						<div class="flex flex-row items-center gap-2 align-middle">
							<img
								src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
								alt={selectedCrop}
								class="pixelated h-8 w-8"
							/>

							<h2 class="flex-2 pb-1 text-2xl">{PROPER_CROP_NAME[cropId]} Rates</h2>
						</div>
						<div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
							<div class="flex flex-1 flex-col justify-start gap-1">
								<div class="flex flex-row items-center gap-1">
									<p class="text-sm font-semibold">Time Spent Farming</p>
								</div>
								<Select.Simple
									class="flex-1"
									bind:value={blocksBroken}
									options={[
										{ value: 24_000, label: 'Contest (20 minutes)' },
										{ value: 72_000, label: '1 Hour' },
										{ value: 72_000 * 4, label: '4 Hours' },
										{ value: 72_000 * 8, label: '8 Hours' },
										{ value: 72_000 * 12, label: '12 Hours' },
										{ value: 72_000 * 24, label: '24 Hours' },
									]}
								/>
							</div>
							<div class="flex flex-1 flex-col justify-start gap-1">
								<div class="flex flex-row items-center gap-1">
									<p class="ml-2 text-sm font-semibold">
										Blocks Per Second ({bps.toFixed(2)})
									</p>
								</div>
								<div class="flex flex-1 flex-row items-center gap-1">
									<SliderSimple class="h-8" min={10} max={20} bind:value={bps} step={0.05} />
									<p class="w-20 p-2 pb-2.5 pl-4 text-center leading-none">
										{(bps / 0.2).toFixed(1)}%
									</p>
								</div>
							</div>
						</div>
					</div>

					<hr class="mt-2" />

					<h3 class="mt-2 mb-2 text-xl font-semibold">Results</h3>
					<div class="flex flex-col gap-3">
						<Accordion.Root type="single" class="w-full" value="npc">
							<Accordion.Item value="npc" class="outline-border w-full rounded-md px-2 outline">
								<Accordion.Trigger class="py-2 hover:no-underline">
									<div class="flex w-full items-center justify-between gap-2 pr-2">
										<span class="text-xl font-semibold">NPC Profit</span>
										<CoinsBreakdown coins={info.npcCoins} />
									</div>
								</Accordion.Trigger>
								<Accordion.Content class="pb-2">
									<div class="flex flex-col">
										{#each coinBreakdown as [name, value] (name)}
											<div class="flex w-full items-center justify-between py-1">
												<span class="text-lg"
													>{name === 'Collection' ? selectedCrop : name}</span
												>
												<CoinsBreakdown coins={value} />
											</div>
										{/each}
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
						<BazaarRates
							result={info}
							crop={selectedCropKey}
							amount={info.items[selectedCropKey] ?? info.collection}
							otherCoins={info.npcCoins -
								(info.items[selectedCropKey] ?? info.collection) * info.npcPrice}
						/>
						<Accordion.Root type="single" class="w-full">
							<Accordion.Item value="collection" class="outline-border w-full rounded-md px-2 outline">
								<Accordion.Trigger class="py-2 hover:no-underline">
									<div class="flex w-full items-center justify-between gap-2 pr-2">
										<span class="text-xl font-semibold">Collection Gain</span>
										<span class="text-lg font-semibold">{info.collection.toLocaleString()}</span>
									</div>
								</Accordion.Trigger>
								<Accordion.Content class="pb-2">
									<div class="flex flex-col">
										{#each otherBreakdown as [name, value] (name)}
											<div class="flex w-full items-center justify-between py-1">
												<span class="text-lg">{name === 'Normal' ? selectedCrop : name}</span>
												<span class="text-lg">{value.toLocaleString()}</span>
											</div>
										{/each}
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
						<div
							class="outline-border flex w-full items-center justify-between rounded-md px-2 py-2 outline"
						>
							<span class="text-xl font-semibold">Farming Weight Gain</span>
							<span class="text-xl font-semibold">{weightGain.toLocaleString()}</span>
						</div>
						{#if info.specialCropBonus > 0 || info.rareItemBonus > 0}
							<Accordion.Root type="single" class="w-full">
								<Accordion.Item value="modifiers" class="outline-border w-full rounded-md px-2 outline">
									<Accordion.Trigger class="py-2 hover:no-underline">
										<div class="flex w-full items-center justify-between gap-2 pr-2">
											<span class="text-muted-foreground text-lg font-semibold"
												>Rate Modifiers</span
											>
											<span class="text-muted-foreground text-sm">Active</span>
										</div>
									</Accordion.Trigger>
									<Accordion.Content class="pb-2">
										<div class="flex flex-col">
											{#if info.specialCropBonus > 0}
												<div class="flex w-full items-center justify-between py-1">
													<span class="text-lg">Special Crop Bonus</span>
													<span class="text-progress text-lg font-semibold"
														>+{(info.specialCropBonus * 100).toFixed(1)}%</span
													>
												</div>
												{#each Object.entries(info.specialCropBonusBreakdown) as [name, value] (name)}
													<div class="flex w-full items-center justify-between py-1 pl-4">
														<span class="text-muted-foreground text-sm">{name}</span>
														<span class="text-muted-foreground text-sm"
															>+{(value * 100).toFixed(1)}%</span
														>
													</div>
												{/each}
											{/if}
											{#if info.rareItemBonus > 0}
												<div class="flex w-full items-center justify-between py-1">
													<span class="text-lg">Rare Drop Bonus</span>
													<span class="text-link text-lg font-semibold"
														>+{(info.rareItemBonus * 100).toFixed(1)}%</span
													>
												</div>
												{#each Object.entries(info.rareItemBonusBreakdown).filter(([, v]) => v > 0) as [name, value] (name)}
													<div class="flex w-full items-center justify-between py-1 pl-4">
														<span class="text-muted-foreground text-sm">{name}</span>
														<span class="text-muted-foreground text-sm"
															>+{(value * 100).toFixed(1)}%</span
														>
													</div>
												{/each}
											{/if}
										</div>
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						{/if}
					</div>

					{#if $ratesData.useTemp && $player.tempFortune > 0 && blocksBroken > 24_000}
						<div class="flex-1"></div>
						<div class="mt-2 flex flex-row items-center justify-center gap-2">
							<TriangleAlert size={20} class="text-completed -mb-1" />
							<p class="text-sm">
								Temporary Fortune is enabled! Some sources might not last the whole time.
							</p>
						</div>
					{/if}
				{:else}
					<p class="my-8 text-center text-lg font-semibold">Select a crop to see its rates!</p>
				{/if}
			</div>
		</section>
	</div>

	<Cropselector radio={true} href="#fortune" id="fortune" />

	<div class="flex w-full max-w-6xl flex-col justify-center gap-4 md:flex-row">
		<section class="bg-card flex w-full flex-1 flex-col items-center gap-4 rounded-lg border-2 p-4">
			<div class="flex w-full flex-row items-center justify-center gap-1">
				<div class="flex flex-1 flex-row justify-end">
					<JumpLink id="fortune" self={false} />
				</div>
				<h2 class="mb-1 text-2xl">Farming Fortune</h2>
				<div class="flex-1">
					<div class="flex flex-1 justify-start">
						<Button
							variant="ghost"
							class="text-muted-foreground mx-2"
							size="sm"
							onclick={() => ($ratesData.settings = !$ratesData.settings)}
						>
							<Settings size={20} />
						</Button>
					</div>
				</div>
			</div>
			{#key $player.fortune}
				<div class="flex w-full flex-col justify-start gap-4">
					{#if !selectedCrop}
						<div class="flex w-full items-center justify-center">
							<p class="font-semibold">Select a crop above to see its fortune!</p>
						</div>
					{:else if CROP_INFO[selectedCropKey]}
						<CategoryProgress
							name="{selectedCrop || 'Wheat'} Fortune"
							progress={$player.getCropProgress(selectedCropKey, [
								Stat.FarmingFortune,
								CROP_INFO[selectedCropKey].fortuneType,
								// Stat.BonusPestChance,
							])}
							expandUpgrade={(u) =>
								$player.expandUpgrade(u, {
									stats: [
										Stat.FarmingFortune,
										CROP_INFO[selectedCropKey].fortuneType,
										// Stat.BonusPestChance,
									],
								})}
							costFn={getUpgradeCost}
							items={itemsData}
							equip={(p) => getToolEquipConfig(p, cropToolSwitchOptions)}
							getUpgrades={getProgressUpgrades}
						>
							<img
								src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
								alt={selectedCrop}
								class="pixelated ml-1 h-8 w-8"
							/>
						</CategoryProgress>
					{/if}
					<CategoryProgress
						name="Gear Fortune"
						progress={$player.armorSet.getProgress([Stat.FarmingFortune])}
						expandUpgrade={(u) => $player.expandUpgrade(u, { stats: [Stat.FarmingFortune] })}
						costFn={getUpgradeCost}
						items={itemsData}
						equip={(p) => getGearEquipConfig(p)}
					/>
					<CategoryProgress
						name="General Fortune"
						progress={$player.getProgress([Stat.FarmingFortune])}
						expandUpgrade={(u) => $player.expandUpgrade(u, { stats: [Stat.FarmingFortune] })}
						costFn={getUpgradeCost}
						items={itemsData}
						equip={(p) => getToolEquipConfig(p, allToolOptions) ?? getGearEquipConfig(p)}
						getUpgrades={getProgressUpgrades}
					/>
				</div>
			{/key}
		</section>
	</div>

	<Cropselector radio={true} href="#upgrades" id="upgrades" />

	<section class="bg-card flex w-full max-w-6xl flex-col items-center gap-4 rounded-lg border-2 p-4">
		<svelte:boundary>
			<CheapestUpgrades {player} crop={selectedCropKey} />
			{#snippet failed(error, reset)}
				<div class="flex w-full flex-col items-center justify-center gap-4">
					<p class="text-lg font-semibold">Failed to load upgrades!</p>
					<CopyToClipboard text={JSON.stringify(error, null, 2)} class="text-sm">Copy Error</CopyToClipboard>
					<p class="text-muted-foreground text-sm">
						Please report the error in the <a href="/support" class="text-link underline"
							>Support Discord Server</a
						>!
					</p>
					<Button variant="outline" onclick={reset}>Retry</Button>
				</div>
			{/snippet}
		</svelte:boundary>
	</section>
</div>

<Dialog.Root bind:open={$ratesData.settings}>
	<Dialog.ScrollContent parentClass="max-w-2xl">
		<RatesSettings {player} />
	</Dialog.ScrollContent>
</Dialog.Root>
