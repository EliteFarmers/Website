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
		type PlayerOptions,
	} from 'farming-weight';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_API_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getRatesPlayer } from '$lib/stores/ratesPlayer';
	import { getLevelProgress } from '$lib/format';

	import { Label } from '$ui/label';
	import { Button } from '$ui/button';
	import { SliderSimple } from '$ui/slider';
	import * as Select from '$ui/select';
	import Settings from 'lucide-svelte/icons/settings';

	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import Head from '$comp/head.svelte';
	import Armorselect from '$comp/rates/armorselect.svelte';
	import Lotusgear from '$comp/rates/lotusgear.svelte';
	import Toolconfig from '$comp/rates/toolconfig.svelte';

	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';

	import type { PageData } from './$types';

	export let data: PageData;

	let optionsShown = true;
	let blocksBroken = 24_000 * 3;

	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	$: tools = FarmingTool.fromArray(data.member?.farmingWeight?.inventory?.tools ?? []);
	$: armor = FarmingArmor.fromArray(data.member?.farmingWeight?.inventory?.armor ?? []);
	$: equipment = LotusGear.fromArray(data.member?.farmingWeight?.inventory?.equipment ?? []);
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

	$: options = {
		tools: tools,
		armor: armor,
		equipment: equipment,
		accessories: data.member?.farmingWeight?.inventory?.accessories ?? [],
		pets: pets,

		selectedTool: selectedTool,
		selectedPet: selectedPet,

		personalBests: data.member?.jacob?.stats?.personalBests ?? {},
		anitaBonus: data.member?.jacob?.perks?.doubleDrops ?? 0,
		milestones: $ratesData.milestones,
		cropUpgrades: $ratesData.cropUpgrades as Record<string, number>,
		plotsUnlocked: $ratesData.plotsUnlocked,
		gardenLevel: $ratesData.gardenLevel,
		communityCenter: $ratesData.communityCenter,
		strength: $ratesData.strength,

		farmingXp: data.member?.skills?.farming,
		bestiaryKills: (data.member?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
		farmingLevel: getLevelProgress(
			'farming',
			data.member?.skills?.farming ?? 0,
			(data.member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		).level,
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
	$: selected = Object.entries(calculator).find(([cropId]) => $selectedCrops[PROPER_CROP_NAME[cropId] ?? '']);

	$: selectedToolId = $player.selectedTool?.item.uuid?.slice() ?? '';

	const cropKey = (crop: string) =>
		(PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ?? crop) as Crop;
</script>

<Head title="Rate Calculator" description="Calculate your expected farming rates in Hypixel Skyblock!" />

<div class="flex flex-col justify-center items-center w-full pb-16">
	<Cropselector radio={true} />

	<div class="flex flex-col md:flex-row gap-4 max-w-6xl w-full justify-center">
		<section class="flex-1 flex flex-col items-center w-full gap-8 p-4 rounded-md bg-primary-foreground">
			<div class="flex flex-row justify-between items-center w-full">
				<div class="flex-1 hidden sm:block" />
				<div class="flex flex-3 flex-row gap-2 my-2 items-center">
					<h2 class="text-lg md:text-2xl">Total Farming Fortune</h2>

					<Fortunebreakdown
						title="Total Farming Fortune"
						total={$player.fortune + cropFortune.fortune}
						breakdown={{ ...$player.breakdown, ...cropFortune.breakdown }}
						side="bottom"
					/>
				</div>
				<div class="flex-1 flex justify-end">
					<Button variant="outline" class="m-1" size="sm" on:click={() => (optionsShown = !optionsShown)}>
						<Settings size={20} />
					</Button>
				</div>
			</div>

			{#if optionsShown}
				<div class="flex flex-1 flex-col gap-2 w-full">
					<Label class="flex-1">
						Unlocked Plots
						<div class="flex flex-row gap-1 items-center">
							<SliderSimple min={0} max={24} bind:value={$ratesData.plotsUnlocked} step={1} />
							<p class="text-lg p-2 w-12">{$ratesData.plotsUnlocked}</p>
						</div>
					</Label>
					<Label class="flex-1">
						Community Center Upgrade
						<div class="flex flex-row gap-1 items-center">
							<SliderSimple min={0} max={10} bind:value={$ratesData.communityCenter} step={1} />
							<p class="text-lg p-2 w-12">{$ratesData.communityCenter}</p>
						</div>
					</Label>
					<Label class="flex-1">
						Garden Level
						<div class="flex flex-row gap-1 items-center">
							<SliderSimple min={0} max={15} bind:value={$ratesData.gardenLevel} step={1} />
							<p class="text-lg p-2 w-12">{$ratesData.gardenLevel}</p>
						</div>
					</Label>
					<Label class="flex-1">
						Strength
						<div class="flex flex-row gap-1 items-center">
							<SliderSimple min={0} max={1500} bind:value={$ratesData.strength} step={1} />
							<p class="text-lg p-2 w-12">{$ratesData.strength}</p>
						</div>
					</Label>
				</div>
			{/if}

			{#if selectedCrop}
				<div class="flex flex-row gap-2 items-center">
					<h3 class="text-xl">{selectedCrop} Fortune</h3>

					<Fortunebreakdown
						title="{selectedCrop} Fortune"
						total={$player.getCropFortune(getCropFromName(selectedCrop) ?? Crop.Wheat).fortune}
						breakdown={$player.getCropFortune(getCropFromName(selectedCrop) ?? Crop.Wheat).breakdown}
						side="bottom"
					/>
				</div>
				<div class="flex flex-row items-center gap-2 md:gap-4 w-full max-w-lg">
					<img
						src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
						alt={selectedCrop}
						class="w-12 h-12 pixelated m-1 p-1"
					/>
					<div class="flex flex-1 flex-col gap-2">
						<Label class="flex-1">
							Garden Milestone
							<div class="flex flex-row gap-1 items-center">
								<SliderSimple
									min={0}
									max={46}
									bind:value={$ratesData.milestones[cropKey(selectedCrop)]}
									step={1}
								/>
								<p class="text-lg p-2 w-6">{$ratesData.milestones[cropKey(selectedCrop)] ?? 0}</p>
							</div>
						</Label>
						<Label class="flex-1">
							Crop Upgrade
							<div class="flex flex-row gap-1 items-center">
								<SliderSimple
									min={0}
									max={9}
									bind:value={$ratesData.cropUpgrades[cropKey(selectedCrop)]}
									step={1}
								/>
								<p class="text-lg p-2 w-6">{$ratesData.cropUpgrades[cropKey(selectedCrop)] ?? 0}</p>
							</div>
						</Label>
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
				<Armorselect {options} />
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
