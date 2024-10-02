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
	import { getRatesPlayer } from '$lib/stores/ratesPlayer';
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
	export let data: PageData;

	let blocksBroken = 24_000 * 3;
	let bps = 20;
	$: blocksActuallyBroken = blocksBroken * (bps / 20);

	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	$: pestTurnInChecked = $ratesData.temp.pestTurnIn > 0;
	$: tools = FarmingTool.fromArray((data.member?.farmingWeight?.inventory?.tools ?? []) as EliteItemDto[]);
	$: pets = FarmingPet.fromArray(data.member?.pets ?? []);

	$: armor = FarmingArmor.fromArray((data.member?.farmingWeight?.inventory?.armor ?? []) as EliteItemDto[]);
	$: equipment = LotusGear.fromArray((data.member?.farmingWeight?.inventory?.equipment ?? []) as EliteItemDto[]);
	$: armorSet = new ArmorSet(armor, equipment);

	// Deselect pet if it's not on this player
	$: $ratesData.selectedPet = pets.some((pet) => pet.pet.uuid === $ratesData.selectedPet)
		? setPet($ratesData.selectedPet)
		: undefined;

	function setPet(uuid?: string) {
		$ratesData.selectedPet = uuid;
		selectedPet = pets.find((pet) => pet.pet.uuid === uuid) ?? undefined;
		return uuid;
	}

	$: selectedPet = undefined as FarmingPet | undefined;
	$: selectedTool = undefined as FarmingTool | undefined;

	$: options = {
		tools: tools,
		armor: armorSet,
		equipment: equipment,
		accessories: (data.member?.farmingWeight?.inventory?.accessories ?? []) as EliteItemDto[],
		pets: pets,

		selectedTool: selectedTool,
		selectedPet: selectedPet,

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
	} satisfies PlayerOptions;

	$: player = getRatesPlayer(options);

	$: cropFortune = $player.getCropFortune(getCropFromName(selectedCrop) ?? Crop.Wheat);

	$: calculator = calculateDetailedAverageDrops({
		farmingFortune: $player.fortune + cropFortune.fortune,
		bountiful: $player.selectedTool?.reforge?.name === 'Bountiful',
		mooshroom: selectedPet?.type === FarmingPets.MooshroomCow,
		dicerLevel: +(selectedTool?.item.skyblockId?.match(/DICER_(\d+)/)?.[1] ?? 3) as 1 | 2 | 3,
		blocksBroken: blocksActuallyBroken,
	});

	$: selectedCrop = Object.entries($selectedCrops).find(([, value]) => value)?.[0] ?? '';
	$: selectedCropKey = cropKey(selectedCrop);
	$: selected = Object.entries(calculator).find(([cropId]) => $selectedCrops[PROPER_CROP_NAME[cropId] ?? '']);

	$: delayedUpdateSelectedTool(selectedCrop);
	$: selectedToolId = $player.selectedTool?.item.uuid?.slice() ?? '';

	function updateSelectedTool(c: string) {
		const crop = cropKey(c);
		if (selectedTool?.crop === crop) return;

		selectedTool = tools.find((tool) => tool.crop === crop);
		selectedToolId = selectedTool?.item.uuid ?? '';

		player.refresh();
	}

	function delayedUpdateSelectedTool(c: string) {
		setTimeout(() => updateSelectedTool(c), 0);
	}

	const cropKey = (crop: string) =>
		(PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ?? crop) as Crop;
</script>

<Head
	title="{data.account.name} | Rate Calculator"
	description="Calculate your expected farming rates in Hypixel Skyblock!"
/>

<div class="flex flex-col justify-center items-center w-full gap-4">
	<Cropselector radio={true} />

	<div class="flex flex-col md:flex-row gap-4 max-w-6xl w-full justify-center">
		<section
			class="flex-1 flex flex-col items-center w-full gap-4 p-4 md:pb-6 md:px-6 rounded-md bg-primary-foreground"
		>
			<div class="flex flex-row justify-between items-center w-full">
				<div class="flex-1 hidden sm:block" />
				<div class="flex flex-3 flex-row gap-2 my-2 items-center">
					<h2 class="text-lg md:text-2xl">Total Farming Fortune</h2>

					<Fortunebreakdown
						title="Total Farming Fortune"
						total={$player.fortune + cropFortune.fortune}
						breakdown={{ ...$player.breakdown, ...cropFortune.breakdown }}
					/>
				</div>
				<div class="flex-1 flex justify-end">
					<Button
						variant="outline"
						class="m-1"
						size="sm"
						on:click={() => ($ratesData.settings = !$ratesData.settings)}
					>
						<Settings size={20} />
					</Button>
				</div>
			</div>

			<div
				class="{$ratesData.settings
					? 'flex'
					: 'hidden'} flex-1 flex-col gap-4 w-full max-w-lg justify-center p-4 border-primary-foreground border-solid outline outline-2 rounded-md"
			>
				<div class="flex flex-col md:flex-row items-center justify-center gap-8">
					<div class="flex flex-col justify-start gap-1">
						<p class="text-sm">Community Center Upgrade</p>
						<div class="flex flex-row gap-1 items-center">
							<SliderSimple
								class="h-12"
								min={0}
								max={10}
								bind:value={$ratesData.communityCenter}
								step={1}
							/>
							<p class="text-lg p-2 pl-4 w-12 text-center">{$ratesData.communityCenter}</p>
						</div>
					</div>
					<div class="flex flex-col items-start gap-1">
						<p class="text-sm">Strength</p>
						<NumberInput
							class="h-10 my-1"
							type="text"
							inputmode="numeric"
							placeholder="0"
							bind:value={$ratesData.strength}
							min={0}
							max={1500}
						/>
					</div>
				</div>
				<div class="flex flex-col md:flex-row items-center justify-evenly gap-4">
					<div class="flex flex-row gap-4 items-center align-middle">
						<p class="text-sm">Garden Level</p>
						<p class="font-semibold">{options.gardenLevel}</p>
					</div>
					<div class="flex flex-row gap-4 items-center align-middle">
						<p class="text-sm">Unlocked Plots</p>
						<p class="font-semibold">{options.plotsUnlocked}</p>
					</div>
				</div>
				<div class="flex flex-col items-center justify-center gap-1 m-2">
					<div class="flex flex-row gap-2 items-center min-h-10">
						<p class="text-lg text-center leading-none">Temporary Fortune</p>
						{#if $ratesData.useTemp}
							<FortuneBreakdown total={$player.tempFortune} breakdown={$player.tempFortuneBreakdown} />
						{/if}
					</div>
					<div class="flex flex-row items-center justify-center gap-2">
						<p class="text-md leading-none mb-1">Enabled</p>
						<Switch bind:checked={$ratesData.useTemp} />
					</div>
				</div>
				<div class="flex flex-col md:flex-row md:flex-wrap items-center md:items-start justify-center">
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.pestTurnIn.name} (40 Pests)</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch
								checked={$ratesData.temp.pestTurnIn > 0}
								onCheckedChange={(check) => {
									$ratesData.temp.pestTurnIn = check ? 200 : 0;
								}}
							/>
							<FortuneBreakdown total={200} bind:enabled={pestTurnInChecked} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.centuryCake.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch bind:checked={$ratesData.temp.centuryCake} />
							<FortuneBreakdown total={5} bind:enabled={$ratesData.temp.centuryCake} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.flourSpray.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch bind:checked={$ratesData.temp.flourSpray} />
							<FortuneBreakdown total={20} bind:enabled={$ratesData.temp.flourSpray} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.harvestPotion.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch bind:checked={$ratesData.temp.harvestPotion} />
							<FortuneBreakdown total={50} bind:enabled={$ratesData.temp.harvestPotion} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.magic8Ball.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch bind:checked={$ratesData.temp.magic8Ball} />
							<FortuneBreakdown total={25} bind:enabled={$ratesData.temp.magic8Ball} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.springFilter.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch bind:checked={$ratesData.temp.springFilter} />
							<FortuneBreakdown total={25} bind:enabled={$ratesData.temp.springFilter} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.anitaContest.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch bind:checked={$ratesData.temp.anitaContest} />
							<FortuneBreakdown total={25} bind:enabled={$ratesData.temp.anitaContest} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none">{TEMPORARY_FORTUNE.chocolateTruffle.name}</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Switch bind:checked={$ratesData.temp.chocolateTruffle} />
							<FortuneBreakdown total={30} bind:enabled={$ratesData.temp.chocolateTruffle} />
						</div>
					</div>
					<div class="flex flex-col items-start gap-1 md:basis-48 m-2">
						<p class="text-md leading-none mb-1">Zorro's Cape Mode</p>
						<div class="flex flex-row items-center justify-center gap-2">
							<Select.Simple
								class="md:w-48"
								value={$ratesData.zorroMode}
								change={(value) => {
									$ratesData.zorroMode = value;
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
				<div class="flex flex-row gap-2 items-center mb-2">
					<h3 class="text-xl">{selectedCrop} Fortune</h3>

					<Fortunebreakdown
						title="{selectedCrop} Fortune"
						total={$player.getCropFortune(selectedCropKey).fortune}
						breakdown={$player.getCropFortune(selectedCropKey).breakdown}
					/>
				</div>
				<div class="flex flex-row items-center justify-center gap-2 md:gap-4 w-full max-w-lg">
					<img
						src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
						alt={selectedCrop}
						class="w-12 h-12 pixelated m-1 p-1"
					/>
					<div class="flex flex-col gap-4">
						<div class="flex flex-1 flex-row gap-4 justify-center">
							<div class="flex flex-col items-center gap-2">
								<p class="text-md">Garden Milestone</p>
								<p class="text-lg font-semibold">
									{options.milestones[selectedCropKey] ?? 0}
								</p>
							</div>
							<div class="flex flex-col items-center gap-2">
								<p class="text-md">Crop Upgrade</p>
								<p class="text-lg font-semibold">
									{options.cropUpgrades[selectedCropKey] ?? 0}
								</p>
							</div>
						</div>
						{#if getCropInfo(selectedCropKey).exportable}
							<div class="flex flex-row items-center justify-center gap-2">
								<p class="text-md leading-none mb-1">Carrolyn Fortune (+12)</p>
								<Switch bind:checked={$ratesData.exported[selectedCropKey]} />
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<p class="text-lg font-semibold text-center">Select a crop to see its fortune!</p>
			{/if}
			<div class="flex justify-between items-center w-full pt-2">
				<p class="text-lg font-semibold">Farming Pet</p>
				{#if selectedPet}
					<FortuneBreakdown breakdown={selectedPet.breakdown} />
				{:else}
					<FortuneBreakdown total={0} />
				{/if}
			</div>
			<PetSelector {player} {pets} onChange={setPet} />

			<div class="flex justify-between items-center w-full pt-2">
				<p class="text-lg font-semibold">Farming Tool</p>
				{#if selectedTool && selectedTool.crop === selectedCropKey}
					<FortuneBreakdown breakdown={$player.selectedTool?.fortuneBreakdown} />
				{:else}
					<FortuneBreakdown total={0} />
				{/if}
			</div>
			<ToolSelector {player} bind:selectedToolId />

			<div class="flex flex-col gap-2 w-full">
				<FarmingGear {player} />
				{#if $player.armor.length === 0 && $player.equipment.length === 0}
					<p class="text-lg font-semibold text-center my-4">No gear found!</p>
				{/if}
			</div>
		</section>
		<section class="flex-1 w-full p-4 rounded-md bg-primary-foreground">
			<div class="flex flex-col gap-2 max-w-lg w-full p-2">
				{#if selected}
					{@const [cropId, info] = selected}
					{@const coinBreakdown = Object.entries(info.coinSources).sort(([, a], [, b]) => b - a)}
					{@const otherBreakdown = Object.entries(info.otherCollection).sort(([, a], [, b]) => b - a)}

					<div class="flex flex-col items-start gap-2">
						<div class="flex flex-row gap-2 items-center align-middle">
							<img
								src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
								alt={selectedCrop}
								class="w-8 h-8 pixelated"
							/>

							<h2 class="text-2xl pb-1 flex-2">{PROPER_CROP_NAME[cropId]} Rates</h2>
						</div>
						<div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
							<div class="flex flex-col gap-1 justify-start flex-1">
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
							<div class="flex flex-col gap-1 justify-start flex-1">
								<div class="flex flex-row items-center gap-1">
									<p class="ml-2 text-sm font-semibold">
										Blocks Per Second ({bps.toFixed(2)})
									</p>
								</div>
								<div class="flex flex-row gap-1 items-center flex-1">
									<SliderSimple class="h-8" min={10} max={20} bind:value={bps} step={0.05} />
									<p class="pb-2.5 p-2 pl-4 w-20 text-center leading-none">
										{(bps / 0.2).toFixed(1)}%
									</p>
								</div>
							</div>
						</div>
					</div>

					<hr class="mt-2" />

					<h3 class="text-xl mt-2 mb-1">Results</h3>
					<div class="flex flex-col text-lg font-semibold">
						<div class="flex justify-between items-center w-full px-4 py-2">
							<span class="text-xl">Coins</span>
							<span>{info.npcCoins.toLocaleString()}</span>
						</div>
						<div class="flex justify-between items-center w-full px-4 py-2">
							<span class="text-xl">Collection</span>
							<span>{info.collection.toLocaleString()}</span>
						</div>
					</div>

					<h3 class="text-xl mt-2 mb-1">Coin Breakdown</h3>
					<div class="flex flex-col">
						{#each coinBreakdown as [name, value] (name)}
							<div class="flex justify-between items-center w-full px-4 py-2">
								<span class="text-lg font-semibold">{name}</span>
								<span class="text-lg font-semibold">{value.toLocaleString()}</span>
							</div>
						{/each}
					</div>

					<h3 class="text-xl my-2">Collection Breakdown</h3>
					<div class="flex flex-col">
						{#each otherBreakdown as [name, value] (name)}
							<div class="flex justify-between items-center w-full px-4 py-2">
								<span class="text-lg font-semibold">{name}</span>
								<span class="text-lg font-semibold">{value.toLocaleString()}</span>
							</div>
						{/each}
					</div>
					{#if $ratesData.useTemp && $player.tempFortune > 0 && blocksBroken > 24_000}
						<div class="flex flex-row gap-2 items-center mt-2">
							<TriangleAlert size={20} class="-mb-1 text-yellow-600 dark:text-yellow-300" />
							<p class="text-sm">
								Temporary Fortune is enabled! Some sources might not last the whole time.
							</p>
						</div>
					{/if}
				{:else}
					<p class="text-lg font-semibold text-center my-8">Select a crop to see its rates!</p>
				{/if}
			</div>
		</section>
	</div>

	<Cropselector radio={true} />

	<div class="flex flex-col md:flex-row gap-4 max-w-6xl w-full justify-center">
		<section class="flex-1 flex flex-col items-center w-full gap-4 p-4 rounded-md bg-primary-foreground">
			<div class="flex flex-row gap-1 items-center justify-center w-full">
				<div class="flex-1 flex flex-row justify-end">
					<JumpLink id="fortune" />
				</div>
				<h2 class="text-2xl mb-1">Farming Fortune</h2>
				<div class="flex-1" />
			</div>
			{#key $player.fortune}
				<div class="flex flex-wrap md:flex-row gap-4 w-full justify-start">
					<CategoryProgress name="General Fortune" progress={$player.getProgress()} />
					<CategoryProgress name="Gear Fortune" progress={$player.armorSet.getProgress()} />
					{#key $player.selectedTool}
						{#if !selectedCrop}
							<div class="text-center flex-1 items-center basis-64">
								<p class="font-semibold text-center my-4 max-w-sm">
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
									class="w-8 h-8 pixelated ml-1"
								/>
							</CategoryProgress>
						{/if}
					{/key}
				</div>
			{/key}
			<div class="flex flex-row justify-start w-full text-muted-foreground">
				<p>Farming pet fortune not included yet, check back later!</p>
			</div>
		</section>
	</div>

	<div class="my-8 mx-2">
		<p class="text-center max-w-xl">
			Currently all coins are calculated using their NPC sell price. You may get better rates if you sell to the
			Bazaar, but typically the difference is not significant. Cactus and Cocoa are often higher in the Bazaar,
			make sure to check!
		</p>
	</div>
</div>
