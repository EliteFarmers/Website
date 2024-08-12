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
		type ExtraFarmingFortune,
	} from 'farming-weight';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_API_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getRatesPlayer } from '$lib/stores/ratesPlayer';
	import { getLevelProgress } from '$lib/format';

	import { Label } from '$ui/label';
	import { Button } from '$ui/button';
	import { SliderSimple } from '$ui/slider';
	import { Switch } from '$ui/switch';
	import { NumberInput } from '$ui/number-input';
	import * as Select from '$ui/select';
	import Settings from 'lucide-svelte/icons/settings';

	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import Head from '$comp/head.svelte';
	import Armorselect from '$comp/rates/armorselect.svelte';
	import Lotusgear from '$comp/rates/lotusgear.svelte';
	import Toolconfig from '$comp/rates/toolconfig.svelte';

	import type { PageData } from './$types';
	export let data: PageData;

	let blocksBroken = 24_000 * 3;

	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	$: tools = FarmingTool.fromArray((data.member?.farmingWeight?.inventory?.tools ?? []) as EliteItemDto[]);
	$: armor = FarmingArmor.fromArray((data.member?.farmingWeight?.inventory?.armor ?? []) as EliteItemDto[]);
	$: armorSet = new ArmorSet(armor);
	$: equipment = LotusGear.fromArray((data.member?.farmingWeight?.inventory?.equipment ?? []) as EliteItemDto[]);
	$: pets = FarmingPet.fromArray(data.member?.pets ?? []);

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
	$: extra = [
		data.member.chocolateFactory?.cocoaFortuneUpgrades
			? {
					fortune: data.member.chocolateFactory.cocoaFortuneUpgrades,
					name: 'Cocoa Fortune',
					crop: Crop.CocoaBeans,
			  }
			: undefined,
	] as ExtraFarmingFortune[];

	$: options = {
		tools: tools,
		armor: armorSet,
		equipment: equipment,
		accessories: (data.member?.farmingWeight?.inventory?.accessories ?? []) as EliteItemDto[],
		pets: pets,

		selectedTool: selectedTool,
		selectedPet: selectedPet,

		refinedTruffles: data.member.chocolateFactory?.refinedTrufflesConsumed ?? 0,
		exportableCrops: $ratesData.exported,
		personalBests: data.member?.jacob?.stats?.personalBests ?? {},
		anitaBonus: data.member?.jacob?.perks?.doubleDrops ?? 0,
		milestones: getCropMilestoneLevels(data.member?.garden?.crops ?? {}),
		cropUpgrades: getCropUpgrades(data.member?.garden?.cropUpgrades ?? {}),
		plotsUnlocked: data.member.garden?.plots?.length ?? 0,
		gardenLevel: getGardenLevel(data.member.garden?.experience ?? 0).level,
		communityCenter: $ratesData.communityCenter,
		strength: $ratesData.strength,

		farmingXp: data.member?.skills?.farming,
		bestiaryKills: (data.member?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
		farmingLevel: getLevelProgress(
			'farming',
			data.member?.skills?.farming ?? 0,
			(data.member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		).level,

		extraFortune: extra.filter((e) => e),
	} satisfies PlayerOptions;

	$: player = getRatesPlayer(options);
	$: cropFortune = $player.getCropFortune(getCropFromName(selectedCrop) ?? Crop.Wheat);

	$: calculator = calculateDetailedAverageDrops({
		farmingFortune: $player.fortune + cropFortune.fortune,
		bountiful: $player.selectedTool?.reforge?.name === 'Bountiful',
		mooshroom: selectedPet?.type === FarmingPets.MooshroomCow,
		dicerLevel: +(selectedTool?.item.skyblockId?.match(/DICER_(\d+)/)?.[1] ?? 3) as 1 | 2 | 3,
		blocksBroken: blocksBroken,
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

<div class="flex flex-col justify-center items-center w-full">
	<Cropselector radio={true} />

	<div class="flex flex-col md:flex-row gap-4 max-w-6xl w-full justify-center">
		<section class="flex-1 flex flex-col items-center w-full gap-4 p-4 rounded-md bg-primary-foreground">
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

			{#if $ratesData.settings}
				<div
					class="flex flex-1 flex-col gap-4 w-full max-w-lg justify-center p-4 border-primary-foreground border-solid outline outline-2 rounded-md"
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
				</div>
			{/if}

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
			<div class="flex flex-col gap-2 max-w-lg w-full">
				<Label>Farming Pet</Label>
				<Select.Simple
					bind:value={$ratesData.selectedPet}
					options={$player.pets.map((pet) => ({
						value: pet.pet.uuid ?? '',
						label: `${pet.info.name} [${pet.level}] + ${pet.item?.name ?? 'No Fortune Item'}`,
					}))}
					change={() => {
						setPet($ratesData.selectedPet);
					}}
				/>
			</div>
			<div class="flex flex-col gap-2 max-w-lg w-full px-4">
				{#each $player.tools as tool (tool.item.uuid)}
					{#if $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']}
						<div class="flex flex-row gap-2 justify-start items-center w-full">
							<input
								type="radio"
								name="tool"
								value={tool.item.uuid}
								bind:group={selectedToolId}
								on:change={() => {
									selectedTool = tool;
								}}
							/>
							<Toolconfig {tool} {player} />
						</div>
					{/if}
				{/each}

				{#if $player.tools.length === 0}
					<p class="text-lg font-semibold text-center my-8">No matching tools found!</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				<Armorselect {player} />
				{#if $player.tools.length === 0}
					<p class="text-lg font-semibold text-center my-8">No armor found!</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				{#if $player.equipment.length === 0}
					<p class="text-lg font-semibold text-center my-8">No lotus equipment found!</p>
				{:else}
					<div class="flex justify-between items-center w-full px-4 py-2">
						<span class="text-lg font-semibold">Lotus Gear Total</span>
						<Fortunebreakdown total={$player.equipment.reduce((acc, l) => acc + l.fortune, 0)} />
					</div>
				{/if}
				<Lotusgear items={$player.equipment} />
			</div>
		</section>
		<section class="flex-1 w-full p-4 rounded-md bg-primary-foreground">
			<div class="flex flex-col gap-2 max-w-lg w-full p-2">
				{#if selected}
					{@const [cropId, info] = selected}
					{@const coinBreakdown = Object.entries(info.coinSources).sort(([, a], [, b]) => b - a)}
					{@const otherBreakdown = Object.entries(info.otherCollection).sort(([, a], [, b]) => b - a)}

					<div class="flex flex-row gap-2 items-center align-middle">
						<h2 class="text-2xl pb-1 flex-2">{PROPER_CROP_NAME[cropId]} Rates</h2>

						<Select.Simple
							class="flex-1"
							bind:value={blocksBroken}
							options={[
								{ value: 24_000, label: 'Per Contest' },
								{ value: 72_000, label: 'Per Hour' },
								{ value: 72_000 * 4, label: 'Per 4 Hours' },
								{ value: 72_000 * 8, label: 'Per 8 Hours' },
								{ value: 72_000 * 12, label: 'Per 12 Hours' },
								{ value: 72_000 * 24, label: 'Per 24 Hours' },
							]}
						/>
					</div>
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

					<h3 class="text-xl my-2">Coin Breakdown</h3>
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
				{:else}
					<p class="text-lg font-semibold text-center my-8">Select a crop to see its rates!</p>
				{/if}
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
