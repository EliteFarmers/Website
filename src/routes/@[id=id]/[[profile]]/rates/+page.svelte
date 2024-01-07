<script lang="ts">
	import {
		CalculateDetailedAverageDrops,
		CreatePlayer,
		Crop,
		CropFromName,
		type PlayerOptions,
	} from 'farming-weight';
	import { Input, Label, Radio, Range, Select } from 'flowbite-svelte';
	import { PROPER_CROP_NAME, PROPER_CROP_TO_API_CROP, PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getSelectedCrops } from '$lib/stores/selectedCrops';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getLevelProgress } from '$lib/format';

	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import Head from '$comp/head.svelte';
	import Armorselect from '$comp/rates/armorselect.svelte';
	import Lotusgear from '$comp/rates/lotusgear.svelte';
	import Toolconfig from '$comp/rates/toolconfig.svelte';

	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';

	import type { PageData } from './$types';

	export let data: PageData;

	let bountiful = true;
	let mooshroom = true;
	let blocksBroken = 24_000 * 3;
	$: selectedToolIndex = 0;

	const ratesData = getRatesData();
	const selectedCrops = getSelectedCrops();

	$: calculator = CalculateDetailedAverageDrops({
		// farmingFortune: 1700,
		bountiful: bountiful,
		mooshroom: mooshroom,
		blocksBroken: blocksBroken,
	});

	$: selectedCrop = Object.entries($selectedCrops).find(([key, value]) => value)?.[0] ?? '';
	$: selected = Object.entries(calculator).find(([cropId]) => $selectedCrops[PROPER_CROP_NAME[cropId] ?? '']);

	$: options = {
		tools: data.member?.farmingWeight?.inventory?.tools ?? [],
		armor: data.member?.farmingWeight?.inventory?.armor ?? [],
		equipment: data.member?.farmingWeight?.inventory?.equipment ?? [],
		accessories: data.member?.farmingWeight?.inventory?.accessories ?? [],
		pets: data.member?.pets ?? [],

		personalBests: data.member.jacob?.stats?.personalBests ?? {},
		anitaBonus: data.member?.jacob?.perks?.doubleDrops ?? 0,
		milestones: $ratesData.milestones,
		cropUpgrades: $ratesData.cropUpgrades as Record<string, number>,
		plotsUnlocked: $ratesData.plotsUnlocked,
		gardenLevel: $ratesData.gardenLevel,

		farmingXp: data.member?.skills?.farming,
		bestiaryKills: (data.member?.unparsed?.bestiary as { kills: Record<string, number> })?.kills ?? {},
		farmingLevel: getLevelProgress(
			'farming',
			data.member?.skills?.farming ?? 0,
			(data.member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		).level,
	} satisfies PlayerOptions;

	$: player = CreatePlayer(options);
	$: cropFortune = player.getCropFortune(CropFromName(selectedCrop) ?? Crop.Wheat);

	$: if (selectedToolIndex || selectedCrop) {
		if (player.tools[selectedToolIndex]?.crop !== CropFromName(selectedCrop)) {
			selectedToolIndex = player.tools.findIndex((t) => t.crop === CropFromName(selectedCrop));
		}

		player.selectTool(player.tools[selectedToolIndex]);
		cropFortune = player.getCropFortune(CropFromName(selectedCrop) ?? Crop.Wheat);
	}

	const cropKey = (crop: string) =>
		(PROPER_CROP_TO_API_CROP[crop as keyof typeof PROPER_CROP_TO_API_CROP] ?? crop) as Crop;
</script>

<Head title="Rate Calculator" description="Calculate your expected farming rates in Hypixel Skyblock!" />

<div class="flex flex-col justify-center items-center w-full pb-16">
	<Cropselector radio={true} />

	<div class="flex flex-col md:flex-row gap-4 max-w-6xl w-full justify-center">
		<section class="flex-1 flex flex-col w-full gap-8 p-4 rounded-md bg-gray-100 dark:bg-zinc-800">
			<Fortunebreakdown
				title="Total Farming Fortune"
				total={player.fortune + cropFortune.fortune}
				breakdown={{ ...player.breakdown, ...cropFortune.breakdown }}
				placement="right"
			/>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				<Label>Farming Pet</Label>
				<Select bind:value={mooshroom} size="sm" placeholder="Select a pet!" class="dark:bg-zinc-800">
					<option value={false}>Elephant</option>
					<option value={true}>Mooshroom</option>
				</Select>
			</div>

			{#if selectedCrop}
				{#key selectedToolIndex + selectedCrop}
					<div class="flex flex-row gap-2">
						<Fortunebreakdown
							title="{selectedCrop} Fortune"
							total={player.getCropFortune(CropFromName(selectedCrop) ?? Crop.Wheat).fortune}
							breakdown={player.getCropFortune(CropFromName(selectedCrop) ?? Crop.Wheat).breakdown}
							placement="right"
						/>
					</div>
				{/key}
				<div class="flex flex-row items-center gap-2 mx-4">
					<img
						src={PROPER_CROP_TO_IMG[selectedCrop ?? '']}
						alt={selectedCrop}
						class="w-12 h-12 pixelated m-1 p-1"
					/>
					<div class="flex flex-1 flex-col gap-2">
						<Label defaultClass="flex-1">
							Garden Milestone
							<div class="flex flex-row gap-1 items-center">
								<Range min={0} max={46} bind:value={$ratesData.milestones[cropKey(selectedCrop)]} step={1} />
								<p class="text-lg p-2">{$ratesData.milestones[cropKey(selectedCrop)]}</p>
							</div>
						</Label>
						<Label defaultClass="flex-1">
							Crop Upgrade 
							<div class="flex flex-row gap-1 items-center">
								<Range min={0} max={10} bind:value={$ratesData.cropUpgrades[cropKey(selectedCrop)]} step={1} />
								<p class="text-lg p-2">{$ratesData.cropUpgrades[cropKey(selectedCrop)]}</p>
							</div>
						</Label>
					</div>
				</div>
			{/if}

			<div class="flex flex-col gap-2 max-w-lg w-full px-4">
				{#each player.tools.filter((t) => $selectedCrops[PROPER_CROP_NAME[t.crop] ?? '']) as tool (tool.item.uuid)}
					<div class="flex flex-row gap-2 justify-between items-center">
						<Radio type="radio" name="tool" on:change={() => {
							selectedToolIndex = player.tools.findIndex((t) => t.item.uuid === tool.item.uuid);
							player.selectTool(tool);
						}} />
						<Toolconfig {options} {tool} />
					</div>
				{/each}

				{#if player.tools.length === 0}
					<p class="text-lg font-semibold text-center my-8">No matching tools found!</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				<Armorselect {options} />
				{#if player.tools.length === 0}
					<p class="text-lg font-semibold text-center my-8">No armor found!</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				{#if player.equipment.length === 0}
					<p class="text-lg font-semibold text-center my-8">No lotus equipment found!</p>
				{:else}
					<div class="flex justify-between items-center w-full px-4 py-2">
						<span class="text-lg font-semibold">Lotus Gear Total</span>
						<Fortunebreakdown total={player.equipment.reduce((acc, l) => acc + l.fortune, 0)} />
					</div>
				{/if}
				<Lotusgear items={player.equipment} />
			</div>
		</section>
		<section class="flex-1 w-full p-4 rounded-md bg-gray-100 dark:bg-zinc-800">
			<div class="flex flex-col gap-2 max-w-lg w-full p-2">
				{#if selected}
					{@const [cropId, info] = selected}
					{@const coinBreakdown = Object.entries(info.coinSources).sort(([, a], [, b]) => b - a)}
					{@const otherBreakdown = Object.entries(info.otherCollection).sort(([, a], [, b]) => b - a)}

					<div class="flex flex-row gap-2 items-center align-middle">
						<h2 class="text-2xl pb-1">{PROPER_CROP_NAME[cropId]} Rates</h2>
						<Select
							bind:value={blocksBroken}
							underline
							size="sm"
							class="text-black dark:text-white dark:bg-zinc-800 max-w-[10rem] text-xl"
						>
							<option value={24_000}>Per Contest</option>
							<option value={72_000}>Per Hour</option>
							<option value={72_000 * 4}>Per 4 Hours</option>
							<option value={72_000 * 8}>Per 8 Hours</option>
							<option value={72_000 * 12}>Per 12 Hours</option>
							<option value={72_000 * 24}>Per 24 Hours</option>
						</Select>
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
