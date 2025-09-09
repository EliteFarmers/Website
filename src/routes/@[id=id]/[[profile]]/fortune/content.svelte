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
	import { PROPER_CROP_NAME, PROPER_CROP_TO_API_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getLevelProgress } from '$lib/format';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getRatesPlayer } from '$lib/stores/ratesPlayer.svelte';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import * as Select from '$ui/select';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import Settings from '@lucide/svelte/icons/settings';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import {
		ArmorSet,
		calculateDetailedAverageDrops,
		createFarmingPlayer,
		createFarmingWeightCalculator,
		Crop,
		FarmingArmor,
		FarmingPet,
		FarmingPets,
		FarmingTool,
		getCropFromName,
		getCropInfo,
		getCropMilestoneLevels,
		getCropUpgrades,
		getGardenLevel,
		LotusGear,
		type EliteItemDto,
		type PlayerOptions,
	} from 'farming-weight';
	import { onMount, untrack } from 'svelte';
	import BazaarRates from './bazaar-rates.svelte';
	import CheapestUpgrades from './cheapest-upgrades.svelte';
	import RatesSettings from './rates-settings.svelte';

	const ctx = getStatsContext();

	let blocksBroken = $state(24_000 * 3);
	let bps = $state(20);

	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	function updateSelectedTool(c: string) {
		const crop = cropKey(c);
		if (selectedTool?.crop === crop) return;

		selectedTool = $player.tools.find((tool) => tool.crop === crop);
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
	let tools = $derived.by(() => (ctx.member.ready ? FarmingTool.fromArray(ctx.tools) : []));
	let armor = $derived.by(() => (ctx.member.ready ? FarmingArmor.fromArray(ctx.armor) : []));
	let equipment = $derived.by(() => (ctx.member.ready ? LotusGear.fromArray(ctx.equipment) : []));

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

	let options = $derived({
		tools: tools,
		armor: armorSet,
		accessories: (ctx.member.current?.farmingWeight?.inventory?.accessories ?? []) as EliteItemDto[],
		pets: pets,

		selectedPet: (() => selectedPet)(),
		selectedTool: (() => selectedTool)(),

		refinedTruffles: ctx.member.current?.chocolateFactory?.refinedTrufflesConsumed ?? 0,
		personalBests: (ctx.member.current?.jacob?.stats?.personalBests ?? {}) as unknown as Record<string, number>,
		anitaBonus: ctx.member.current?.jacob?.perks?.doubleDrops ?? 0,
		plots: ctx.member.current?.garden?.plots,
		farmingXp: ctx.member.current?.skills?.farming,
		bestiaryKills: (ctx.member.current?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
		uniqueVisitors: ctx.member.current?.garden?.uniqueVisitors ?? 0,

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

		exportableCrops: $ratesData.exported,
		communityCenter: $ratesData.communityCenter,
		strength: $ratesData.strength,
		attributes: $ratesData.attributes,

		cocoaFortuneUpgrade: ctx.member.current?.chocolateFactory?.cocoaFortuneUpgrades,
		temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,

		zorro: $ratesData.zorroMode
			? {
					enabled: ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
					mode: $ratesData.zorroMode,
				}
			: undefined,
	} as PlayerOptions);

	// svelte-ignore state_referenced_locally
	let player = $state(getRatesPlayer(options));

	$effect(() => {
		if (!ctx.member.ready) return;

		options = {
			...untrack(() => $player.options),
			selectedPet: untrack(() => $player.selectedPet),
			selectedTool: untrack(() => $player.selectedTool),
			armor: untrack(() => $player.armorSet),
			attributes: $ratesData.attributes,
			exportableCrops: $ratesData.exported,
			communityCenter: $ratesData.communityCenter,
			strength: $ratesData.strength,
			temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,
			sprayedPlot: $ratesData.sprayedPlot,
			infestedPlotProbability: $ratesData.infestedPlotProbability,
			zorro: {
				enabled: ctx.member.current?.chocolateFactory?.unlockedZorro ?? false,
				mode: $ratesData.zorroMode,
			},
		};

		untrack(() => {
			player.update(() => createFarmingPlayer(options));
		});
	});

	const selectedCrop = $derived(Object.entries($selectedCrops).find(([, value]) => value)?.[0] ?? '');
	const cropFortune = $derived($player.getCropFortune(getCropFromName(selectedCrop) ?? Crop.Wheat));
	const selectedCropKey = $derived(cropKey(selectedCrop));

	const calculatorOptions = $derived.by(() => {
		return {
			farmingFortune: $player.fortune + cropFortune.fortune,
			bountiful: $player.selectedTool?.reforge?.name === 'Bountiful',
			mooshroom: $player.selectedPet?.type === FarmingPets.MooshroomCow,
			dicerLevel: +(selectedTool?.item.skyblockId?.match(/DICER_(\d+)/)?.[1] ?? 3) as 1 | 2 | 3,
			blocksBroken: blocksActuallyBroken,
			armorPieces: $player.armorSet.specialDropsCount(selectedCropKey),
			infestedPlotProbability: $ratesData.infestedPlotProbability,
			attributes: $ratesData.attributes,
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

	const totalFortune = $derived($player.fortune + cropFortune.fortune);
	const fortuneBreakdown = $derived({ ...$player.breakdown, ...cropFortune.breakdown });

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

					<Fortunebreakdown
						title="{selectedCrop} Fortune"
						total={$player.getCropFortune(selectedCropKey).fortune}
						breakdown={$player.getCropFortune(selectedCropKey).breakdown}
					>
						<p class="text-xs">
							This fortune is not representative of the actual "{selectedCrop} Fortune" stat seen in-game.
							Currently, it includes all crop-related options on this page instead of breaking up the fortune
							into its components. For example, farming tools also have general fortune, but it's included
							here instead.
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
						{#if selectedCropKey && getCropInfo(selectedCropKey).exportable}
							<div class="flex flex-row items-center justify-center gap-2">
								<p class="text-md mb-1 leading-none">Carrolyn Fortune (+12)</p>
								{#if $ratesData.exported[selectedCropKey] !== undefined}
									<Switch bind:checked={$ratesData.exported[selectedCropKey]} />
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<p class="text-center text-lg font-semibold">Select a crop to see its fortune!</p>
			{/if}

			<PetSelector {player} bind:selected={selectedPet} />
			<ToolSelector {tools} {player} bind:selectedToolId {selectedCropKey} />

			<div class="flex w-full flex-col gap-2">
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

					<h3 class="mt-2 mb-1 text-xl font-semibold">Results</h3>
					<div class="flex flex-col text-lg">
						<div class="flex w-full items-center justify-between py-2">
							<span class="text-xl">NPC Coins</span>
							<CoinsBreakdown coins={info.npcCoins} breakdown={info.coinSources} />
						</div>
						<div class="flex w-full items-center justify-between py-2">
							<span class="text-xl">Collection</span>
							<span>{info.collection.toLocaleString()}</span>
						</div>
						<div class="flex w-full items-center justify-between py-2">
							<span class="text-xl">Farming Weight</span>
							<span>{weightGain.toLocaleString()}</span>
						</div>
					</div>

					<h3 class="mt-2 mb-1 text-xl font-semibold">Coin Breakdown</h3>
					<div class="flex flex-col">
						{#each coinBreakdown as [name, value] (name)}
							<div class="flex w-full items-center justify-between py-2">
								<span class="text-lg">{name === 'Collection' ? selectedCrop : name}</span>
								<CoinsBreakdown coins={value} />
							</div>
						{/each}
					</div>

					<h3 class="my-2 text-xl font-semibold">Collection Breakdown</h3>
					<div class="flex flex-col">
						{#each otherBreakdown as [name, value] (name)}
							<div class="flex w-full items-center justify-between py-2">
								<span class="text-lg">{name === 'Normal' ? selectedCrop : name}</span>
								<span class="text-lg">{value.toLocaleString()}</span>
							</div>
						{/each}
					</div>

					<div class="-mx-2">
						<BazaarRates
							result={info}
							crop={selectedCropKey}
							amount={info.items[selectedCropKey] ?? info.collection}
							otherCoins={info.npcCoins -
								(info.items[selectedCropKey] ?? info.collection) * info.npcPrice}
						/>
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
				<div class="flex w-full flex-wrap justify-start gap-4 md:flex-row">
					<CategoryProgress name="General Fortune" progress={$player.getProgress()} />
					<CategoryProgress name="Gear Fortune" progress={$player.armorSet.getProgress()} />
					{#key $player.selectedTool}
						{#if !selectedCrop}
							<div class="flex-1 basis-64 items-center text-center">
								<p class="my-4 max-w-sm text-center font-semibold">
									Select a crop above to see its fortune!
								</p>
							</div>
						{:else}
							<CategoryProgress
								name="{selectedCrop || 'Wheat'} Fortune"
								progress={$player.getCropProgress(getCropFromName(selectedCrop) ?? Crop.Wheat)}
							>
								<img
									src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
									alt={selectedCrop}
									class="pixelated ml-1 h-8 w-8"
								/>
							</CategoryProgress>
						{/if}
					{/key}
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
