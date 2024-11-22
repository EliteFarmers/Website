<script lang="ts">
	import {
		calculateDetailedAverageDrops,
		Crop,
		getCropFromName,
		FarmingArmor,
		FarmingPet,
		FarmingTool,
		LotusGear,
		FarmingPets,
		ArmorSet,
		type EliteItemDto,
		type PlayerOptions,
		getGardenLevel,
		getCropMilestoneLevels,
		getCropUpgrades,
		getCropInfo,
		ZorroMode,
		TEMPORARY_FORTUNE,
	} from 'farming-weight';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_API_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getRatesPlayer } from '$lib/stores/ratesPlayer.svelte';
	import { getLevelProgress } from '$lib/format';

	import { Button } from '$ui/button';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import Settings from 'lucide-svelte/icons/settings';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';

	import Fortunebreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import Head from '$comp/head.svelte';
	import FarmingGear from '$comp/rates/farming-gear.svelte';
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import CategoryProgress from '$comp/rates/category-progress.svelte';
	import ToolSelector from '$comp/rates/tool-selector.svelte';
	import PetSelector from '$comp/rates/pet-selector.svelte';
	import JumpLink from '$comp/jump-link.svelte';

	import type { PageData } from './$types';
	import { onMount, untrack } from 'svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let blocksBroken = $state(24_000 * 3);
	let bps = $state(20);

	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	$inspect($ratesData);

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
	const pestTurnInChecked = $derived($ratesData.temp.pestTurnIn > 0);

	let pets = FarmingPet.fromArray(data.member?.pets ?? []);
	let tools = FarmingTool.fromArray((data.member?.farmingWeight?.inventory?.tools ?? []) as EliteItemDto[]);
	let armor = FarmingArmor.fromArray((data.member?.farmingWeight?.inventory?.armor ?? []) as EliteItemDto[]);
	let equipment = LotusGear.fromArray((data.member?.farmingWeight?.inventory?.equipment ?? []) as EliteItemDto[]);

	// Deselect pet if it's not on this player
	onMount(() => {
		$ratesData.selectedPet = pets.some((pet) => pet.pet.uuid === $ratesData.selectedPet)
			? $ratesData.selectedPet
			: undefined;
	});

	let selectedTool = $state<FarmingTool | undefined>(undefined);
	let selectedToolId = $state('');

	let selectedPet = $state<FarmingPet | undefined>(pets.find((pet) => pet.pet.uuid === $ratesData.selectedPet));

	let armorSet = $state(new ArmorSet(armor, equipment));

	let options = $state({
		tools: tools,
		armor: armorSet,
		accessories: (data.member?.farmingWeight?.inventory?.accessories ?? []) as EliteItemDto[],
		pets: pets,

		selectedPet: (() => selectedPet)(),
		selectedTool: (() => selectedTool)(),

		refinedTruffles: data.member.chocolateFactory?.refinedTrufflesConsumed ?? 0,
		personalBests: data.member?.jacob?.stats?.personalBests ?? {},
		anitaBonus: data.member?.jacob?.perks?.doubleDrops ?? 0,
		plotsUnlocked: data.member.garden?.plots?.length ?? 0,
		farmingXp: data.member?.skills?.farming,
		bestiaryKills: (data.member?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
		uniqueVisitors: data.member?.garden?.uniqueVisitors ?? 0,

		farmingLevel: getLevelProgress(
			'farming',
			data.member?.skills?.farming ?? 0,
			(data.member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		).level,
		milestones: getCropMilestoneLevels(data.member?.garden?.crops ?? {}),
		cropUpgrades: getCropUpgrades(data.member?.garden?.cropUpgrades ?? {}),
		gardenLevel: getGardenLevel(data.member.garden?.experience ?? 0).level,

		exportableCrops: $ratesData.exported,
		communityCenter: $ratesData.communityCenter,
		strength: $ratesData.strength,

		cocoaFortuneUpgrade: data.member.chocolateFactory?.cocoaFortuneUpgrades,
		temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,

		zorro: $ratesData.zorroMode
			? {
					enabled: data.member.chocolateFactory?.unlockedZorro ?? false,
					mode: $ratesData.zorroMode,
				}
			: undefined,
	} as PlayerOptions);

	// svelte-ignore state_referenced_locally
	let player = $state(getRatesPlayer(options));

	$effect(() => {
		options = {
			...untrack(() => $player.options),
			selectedPet: untrack(() => $player.selectedPet),
			selectedTool: untrack(() => $player.selectedTool),
			armor: untrack(() => $player.armorSet),
			exportableCrops: $ratesData.exported,
			communityCenter: $ratesData.communityCenter,
			strength: $ratesData.strength,
			temporaryFortune: $ratesData.useTemp ? $ratesData.temp : undefined,
			sprayedPlot: $ratesData.sprayedPlot,
			zorro: $ratesData.zorroMode
				? {
						enabled: data.member.chocolateFactory?.unlockedZorro ?? false,
						mode: $ratesData.zorroMode,
					}
				: undefined,
		};

		untrack(() => {
			player = getRatesPlayer(options);
			player.refresh();
		});
	});

	const selectedCrop = $derived(Object.entries($selectedCrops).find(([, value]) => value)?.[0] ?? '');

	const cropFortune = $derived($player.getCropFortune(getCropFromName(selectedCrop) ?? Crop.Wheat));
	const calculator = $derived(
		calculateDetailedAverageDrops({
			farmingFortune: $player.fortune + cropFortune.fortune,
			bountiful: $player.selectedTool?.reforge?.name === 'Bountiful',
			mooshroom: $player.selectedPet?.type === FarmingPets.MooshroomCow,
			dicerLevel: +(selectedTool?.item.skyblockId?.match(/DICER_(\d+)/)?.[1] ?? 3) as 1 | 2 | 3,
			blocksBroken: blocksActuallyBroken,
		})
	);
	const selectedCropKey = $derived(cropKey(selectedCrop));
	const selected = $derived(
		Object.entries(calculator).find(([cropId]) => $selectedCrops[PROPER_CROP_NAME[cropId] ?? ''])
	);

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
	title="{data.account.name} | Rate Calculator"
	description="Calculate your expected farming rates in Hypixel Skyblock!"
/>

<div class="flex w-full flex-col items-center justify-center gap-4">
	<Cropselector radio={true} />

	<div class="flex w-full max-w-6xl flex-col justify-center gap-4 md:flex-row">
		<section
			class="flex w-full flex-1 flex-col items-center gap-4 rounded-md bg-primary-foreground p-4 md:px-6 md:pb-6"
		>
			<div class="flex w-full flex-row items-center justify-between">
				<div class="hidden flex-1 sm:block"></div>
				<div class="flex-3 my-2 flex flex-row items-center gap-2">
					<h2 class="text-lg md:text-2xl">Total Farming Fortune</h2>

					<Fortunebreakdown
						title="Total Farming Fortune"
						total={$player.fortune + cropFortune.fortune}
						breakdown={{ ...$player.breakdown, ...cropFortune.breakdown }}
					/>
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

			<div
				class="{$ratesData.settings
					? 'flex'
					: 'hidden'} w-full max-w-lg flex-1 flex-col justify-center gap-4 rounded-md border-solid border-primary-foreground p-4 outline outline-2"
			>
				<div class="flex flex-col items-center justify-center gap-8 md:flex-row">
					<div class="flex flex-col justify-start gap-1">
						<p class="text-sm">Community Center Upgrade</p>
						<div class="flex flex-row items-center gap-1">
							<SliderSimple
								class="h-12"
								min={0}
								max={10}
								bind:value={$ratesData.communityCenter}
								step={1}
							/>
							<p class="w-12 p-2 pl-4 text-center text-lg">{$ratesData.communityCenter}</p>
						</div>
					</div>
					<div class="flex flex-col items-start gap-1">
						<p class="text-sm">Strength</p>
						<NumberInput
							class="my-1 h-10"
							type="text"
							inputmode="numeric"
							placeholder="0"
							bind:value={$ratesData.strength}
							min={0}
							max={1500}
						/>
					</div>
				</div>
				<div class="flex flex-col items-center justify-evenly gap-4 md:flex-row">
					<div class="flex flex-row items-center gap-4 align-middle">
						<p class="text-sm">Garden Level</p>
						<p class="font-semibold">{options.gardenLevel}</p>
					</div>
					<div class="flex flex-row items-center gap-4 align-middle">
						<p class="text-sm">Unlocked Plots</p>
						<p class="font-semibold">{options.plotsUnlocked}</p>
					</div>
				</div>
				<div class="m-2 flex flex-col items-center justify-center gap-1">
					<div class="flex min-h-10 flex-row items-center gap-2">
						<p class="text-center text-lg leading-none">Temporary Fortune</p>
						<FortuneBreakdown total={$player.tempFortune} breakdown={$player.tempFortuneBreakdown} />
					</div>
					<div class="flex flex-row items-center justify-center gap-2">
						<p class="text-md mb-1 leading-none">Enabled</p>
						{#if $ratesData.useTemp !== undefined}
							<Switch bind:checked={$ratesData.useTemp} />
						{/if}
					</div>
				</div>
				<div
					class="flex flex-col flex-wrap items-start justify-start md:flex-row md:items-start md:justify-center"
				>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.pestTurnIn.name} (40 Pests)</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch
								checked={$ratesData.temp.pestTurnIn > 0}
								onCheckedChange={(check) => {
									$ratesData.temp.pestTurnIn = check ? 200 : 0;
								}}
								disabled={!$ratesData.useTemp}
							/>
							<FortuneBreakdown total={200} enabled={pestTurnInChecked && $ratesData.useTemp} />
						</div>
					</div>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.centuryCake.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							{#if $ratesData.temp.centuryCake !== undefined}
								<Switch bind:checked={$ratesData.temp.centuryCake} disabled={!$ratesData.useTemp} />
							{/if}
							<FortuneBreakdown total={5} enabled={$ratesData.temp.centuryCake && $ratesData.useTemp} />
						</div>
					</div>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.harvestPotion.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							{#if $ratesData.temp.harvestPotion !== undefined}
								<Switch bind:checked={$ratesData.temp.harvestPotion} disabled={!$ratesData.useTemp} />
							{/if}
							<FortuneBreakdown
								total={50}
								enabled={$ratesData.temp.harvestPotion && $ratesData.useTemp}
							/>
						</div>
					</div>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.magic8Ball.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							{#if $ratesData.temp.magic8Ball !== undefined}
								<Switch bind:checked={$ratesData.temp.magic8Ball} disabled={!$ratesData.useTemp} />
							{/if}
							<FortuneBreakdown total={25} enabled={$ratesData.temp.magic8Ball && $ratesData.useTemp} />
						</div>
					</div>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.springFilter.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							{#if $ratesData.temp.springFilter !== undefined}
								<Switch bind:checked={$ratesData.temp.springFilter} disabled={!$ratesData.useTemp} />
							{/if}
							<FortuneBreakdown total={25} enabled={$ratesData.temp.springFilter && $ratesData.useTemp} />
						</div>
					</div>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.anitaContest.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							{#if $ratesData.temp.anitaContest !== undefined}
								<Switch bind:checked={$ratesData.temp.anitaContest} disabled={!$ratesData.useTemp} />
							{/if}
							<FortuneBreakdown total={25} enabled={$ratesData.temp.anitaContest && $ratesData.useTemp} />
						</div>
					</div>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.chocolateTruffle.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							{#if $ratesData.temp.chocolateTruffle !== undefined}
								<Switch
									bind:checked={$ratesData.temp.chocolateTruffle}
									disabled={!$ratesData.useTemp}
								/>
							{/if}
							<FortuneBreakdown
								total={30}
								enabled={$ratesData.temp.chocolateTruffle && $ratesData.useTemp}
							/>
						</div>
					</div>
				</div>
				<div
					class="flex flex-col flex-wrap items-start justify-start md:flex-row md:items-start md:justify-center"
				>
					<div class="m-2 flex w-full flex-col items-center gap-3 md:basis-48">
						<p class="text-md leading-none">Sprayed Plot</p>
						<div class="flex flex-row items-center justify-center gap-2">
							{#if $ratesData.sprayedPlot !== undefined}
								<Switch bind:checked={$ratesData.sprayedPlot} />
							{/if}
						</div>
					</div>
					<div class="m-2 flex w-full flex-col items-start gap-1 md:basis-48">
						<p class="text-md mb-1 leading-none">Zorro's Cape Mode</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Select.Simple
								class="md:w-48"
								value={$ratesData.zorroMode}
								change={(value) => {
									$ratesData.zorroMode = value ?? $ratesData.zorroMode;
								}}
								options={[
									{
										value: ZorroMode.Normal,
										label: 'Outside Contest',
									},
									{
										value: ZorroMode.Averaged,
										label: 'Averaged',
									},
									{
										value: ZorroMode.Contest,
										label: 'Inside Contest',
									},
								]}
							/>
						</div>
					</div>
				</div>
			</div>

			{#if selectedCrop}
				<div class="mb-2 flex flex-row items-center gap-2">
					<h3 class="text-xl">{selectedCrop} Fortune</h3>

					<Fortunebreakdown
						title="{selectedCrop} Fortune"
						total={$player.getCropFortune(selectedCropKey).fortune}
						breakdown={$player.getCropFortune(selectedCropKey).breakdown}
					/>
				</div>
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
								{#if $ratesData.exported[selectedCropKey]}
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

			<div class="flex w-full items-center justify-between pt-2">
				<p class="text-lg font-semibold">Farming Tool</p>
				{#if selectedTool && selectedTool.crop === selectedCropKey}
					<FortuneBreakdown breakdown={$player.selectedTool?.fortuneBreakdown} />
				{:else}
					<FortuneBreakdown total={0} />
				{/if}
			</div>
			<ToolSelector {tools} {player} bind:selectedToolId />

			<div class="flex w-full flex-col gap-2">
				<FarmingGear {player} />
				{#if $player.armor.length === 0 && $player.equipment.length === 0}
					<p class="my-4 text-center text-lg font-semibold">No gear found!</p>
				{/if}
			</div>
		</section>
		<section class="w-full flex-1 rounded-md bg-primary-foreground p-4">
			<div class="flex w-full max-w-lg flex-col gap-2 p-2">
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

					<h3 class="mb-1 mt-2 text-xl">Results</h3>
					<div class="flex flex-col text-lg font-semibold">
						<div class="flex w-full items-center justify-between px-4 py-2">
							<span class="text-xl">Coins</span>
							<span>{info.npcCoins.toLocaleString()}</span>
						</div>
						<div class="flex w-full items-center justify-between px-4 py-2">
							<span class="text-xl">Collection</span>
							<span>{info.collection.toLocaleString()}</span>
						</div>
					</div>

					<h3 class="mb-1 mt-2 text-xl">Coin Breakdown</h3>
					<div class="flex flex-col">
						{#each coinBreakdown as [name, value] (name)}
							<div class="flex w-full items-center justify-between px-4 py-2">
								<span class="text-lg font-semibold">{name}</span>
								<span class="text-lg font-semibold">{value.toLocaleString()}</span>
							</div>
						{/each}
					</div>

					<h3 class="my-2 text-xl">Collection Breakdown</h3>
					<div class="flex flex-col">
						{#each otherBreakdown as [name, value] (name)}
							<div class="flex w-full items-center justify-between px-4 py-2">
								<span class="text-lg font-semibold">{name}</span>
								<span class="text-lg font-semibold">{value.toLocaleString()}</span>
							</div>
						{/each}
					</div>
					{#if $ratesData.useTemp && $player.tempFortune > 0 && blocksBroken > 24_000}
						<div class="mt-2 flex flex-row items-center gap-2">
							<TriangleAlert size={20} class="-mb-1 text-yellow-600 dark:text-yellow-300" />
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
		<section class="flex w-full flex-1 flex-col items-center gap-4 rounded-md bg-primary-foreground p-4">
			<div class="flex w-full flex-row items-center justify-center gap-1">
				<div class="flex flex-1 flex-row justify-end">
					<JumpLink id="fortune" self={false} />
				</div>
				<h2 class="mb-1 text-2xl">Farming Fortune</h2>
				<div class="flex-1"></div>
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
			<div class="flex w-full flex-row justify-start text-muted-foreground">
				<p>Farming pet fortune not included yet, check back later!</p>
			</div>
		</section>
	</div>

	<div class="mx-2 my-8">
		<p class="max-w-xl text-center">
			Currently all coins are calculated using their NPC sell price. You may get better rates if you sell to the
			Bazaar, but typically the difference is not significant. Cactus and Cocoa are often higher in the Bazaar,
			make sure to check!
		</p>
	</div>
</div>
