<script lang="ts">
	import { CalculateDetailedAverageDrops, FarmingTool, type PlayerOptions } from 'farming-weight';
	import { Button, Input, Label, Select } from 'flowbite-svelte';
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import { selectedCrops } from '$lib/stores/selectedCrops';
	import { FormatMinecraftText, getLevelProgress } from '$lib/format';
	import { SearchOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import Head from '$comp/head.svelte';
	import Armorselect from './armorselect.svelte';
	import { DEFAULT_SKILL_CAPS } from '$lib/constants/levels';
	import { LotusGear } from 'farming-weight/dist/classes/lotusgear';

	export let data: PageData;
	let enteredIgn = data.account?.name ?? '';
	let bountiful = true;
	let mooshroom = true;
	let blocksBroken = 24_000 * 3;

	$: calculator = CalculateDetailedAverageDrops({
		// farmingFortune: 1700,
		bountiful: bountiful,
		mooshroom: mooshroom,
		blocksBroken: blocksBroken,
	});

	$: selected = Object.entries(calculator).find(([cropId]) => $selectedCrops[PROPER_CROP_NAME[cropId] ?? '']);

	$: options = {
		tools: data.member?.farmingWeight?.inventory?.tools ?? [],
		armor: data.member?.farmingWeight?.inventory?.armor ?? [],
		equipment: data.member?.farmingWeight?.inventory?.equipment ?? [],
		pets: data.member?.pets ?? [],
		farmingXp: data.member?.skills?.farming,
		farmingLevel: getLevelProgress(
			'farming', 
			data.member?.skills?.farming ?? 0,
			(data.member?.jacob?.perks?.levelCap ?? 0) + DEFAULT_SKILL_CAPS.farming
		).level,
	} satisfies PlayerOptions;

	$: tools = (data.member?.farmingWeight?.inventory?.tools ?? [])
		.filter((t) => FarmingTool.isValid(t))
		.map((t) => new FarmingTool(t, options));

	$: lotus = (data.member?.farmingWeight?.inventory?.equipment ?? [])
		.filter((t) => LotusGear.isValid(t))
		.map((t) => new LotusGear(t, options));

	function search() {
		const url = new URL(window.location.href);
		url.searchParams.set('ign', enteredIgn);

		goto(url.toString());
	}
</script>

<Head title="Rate Calculator" description="Calculate your expected farming rates in Hypixel Skyblock!" />

<main class="flex flex-col justify-center items-center w-full pb-16">
	<section class="flex flex-col justify-center items-center mx-4 sm:w-full md:w-[90%] lg:w-[80%]">
		<h1 class="text-4xl font-semibold text-center mt-16 mb-12">Farming Rate Calculator</h1>
	</section>

	<Cropselector radio={true} />

	<div class="flex flex-col md:flex-row gap-4 max-w-6xl w-full justify-center">
		<section class="flex-1 flex flex-col w-full gap-8 p-4 rounded-md bg-gray-200 dark:bg-zinc-800">
			<h2 class="text-2xl text-center">Settings</h2>

			<div class="flex md:flex-row gap-2 align-middle max-h-4 p-2 items-center justify-center">
				{#if data.account}
					<img src="https://mc-heads.net/head/{data.account?.id}" alt="Player head" class="w-16 h-16" />
				{/if}
				<form on:submit|preventDefault={search} class="flex gap-2 items-center justify-center">
					<Input let:props placeholder="Player name" size="md" class="dark:bg-zinc-800">
						<input type="text" {...props} bind:value={enteredIgn} />
					</Input>
					<Button class="!p-2.5 h-full" type="submit" name="Search">
						<SearchOutline />
					</Button>
				</form>
			</div>
			{#if data.error}
				<p class="text-red-500 text-center">{data.error}</p>
			{/if}

			<div class="flex flex-col gap-2 max-w-lg w-full">
				<Label>Reforge</Label>
				<Select bind:value={bountiful} size="sm" placeholder="Select a reforge!" class="dark:bg-zinc-800">
					<option value={false}>Blessed</option>
					<option value={true}>Bountiful</option>
				</Select>
				<Label>Farming Pet</Label>
				<Select bind:value={mooshroom} size="sm" placeholder="Select a pet!" class="dark:bg-zinc-800">
					<option value={false}>Elephant</option>
					<option value={true}>Mooshroom</option>
				</Select>
			</div>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				{#each tools as tool (tool.item.uuid)}
					{#if $selectedCrops[PROPER_CROP_NAME[tool.crop] ?? '']}
						<div class="flex justify-between items-center w-full px-4 py-2">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<span class="text-lg font-semibold">{@html FormatMinecraftText(tool.item.name ?? '')}</span>
							<Fortunebreakdown total={tool.fortune} breakdown={tool.fortuneBreakdown}>
								{#if tool.item?.enchantments?.dedication}
									<p class="text-xs flex-wrap">
										Dedication is not included in the breakdown because crop milestones are not
										available in Hypixel's API.
									</p>
								{/if}
							</Fortunebreakdown>
						</div>
					{/if}
				{/each}
				{#if tools.length === 0 && data.account?.id}
					<p class="text-lg font-semibold text-center my-8">No matching tools found!</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				<Armorselect {options} />
				{#if tools.length === 0 && data.account?.id}
					<p class="text-lg font-semibold text-center my-8">No armor found!</p>
				{/if}
			</div>

			<div class="flex flex-col gap-2 max-w-lg w-full">
				{#if lotus.length === 0 && data.account?.id}
					<p class="text-lg font-semibold text-center my-8">No lotus equipment found!</p>
				{:else}
					<div class="flex justify-between items-center w-full px-4 py-2">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<span class="text-lg font-semibold">Lotus Gear Total</span>
						<Fortunebreakdown total={lotus.reduce((acc, l) => acc + l.fortune, 0)} />
					</div>
				{/if}
				{#each lotus as item (item.item.uuid)}
					<div class="flex justify-between items-center w-full px-4 py-2">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<span class="text-lg font-semibold">{@html FormatMinecraftText(item.item.name ?? '')}</span>
						<Fortunebreakdown total={item.fortune} breakdown={item.fortuneBreakdown} />
					</div>
				{/each}
			</div>
		</section>
		<section class="flex-1 w-full p-4 rounded-md bg-gray-200 dark:bg-zinc-800">
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

					<h3 class="text-xl my-2">Other Collections</h3>
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
</main>
