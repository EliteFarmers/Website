<script lang="ts">
	import Head from '$comp/head.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { CalculateDetailedAverageDrops } from 'farming-weight';
	import { PROPER_CROP_NAME } from '$lib/constants/crops';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import { anyCropSelected, selectedCrops } from '$lib/stores/selectedCrops';
	import { Button, Input, Label, Select } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	export let data: PageData;
	let enteredIgn = data.account?.name?.slice() ?? '';

	$: calculator = CalculateDetailedAverageDrops({
		// farmingFortune: 1700,
		bountiful: bountiful,
		mooshroom: true,
		blocksBroken: 24_000 * 3,
	});

	$: sorted = Object.entries(calculator).sort((a, b) => b[1].npcCoins - a[1].npcCoins);

	onMount(async () => {
		enteredIgn = data.account?.name ?? '';
	});

	$: bountiful = false;

	function search() {
		const url = new URL(window.location.href);
		url.searchParams.set('ign', enteredIgn);

		goto(url.toString());
	}
</script>

<Head title="Rate Calculator" description="Calculate your expected farming rates in Hypixel Skyblock!" />

<main class="flex flex-col justify-center items-center w-full pb-16">
	<section class="flex flex-col justify-center items-center mx-4 sm:w-full md:w-[90%] lg:w-[80%]">
		<h1 class="text-4xl font-semibold text-center my-16">Farming Rate Calculator</h1>
	</section>

	<div class="flex flex-col md:flex-row gap-4 max-w-6xl w-full justify-center">
		<section class="flex-1 flex flex-col w-full gap-4 p-4 rounded-md bg-gray-200 dark:bg-zinc-800">
			<h2 class="text-2xl text-center">Settings</h2>

			<div class="flex md:flex-row gap-2 align-middle max-h-4 p-2 items-center">
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

			<Label>Reforge</Label>
			<Select bind:value={bountiful} size="sm" placeholder="Select a reforge!" class="dark:bg-zinc-800">
				<option value={false}>Blessed</option>
				<option value={true}>Bountiful</option>
			</Select>
			<Label>Farming Pet</Label>
			<Select bind:value={bountiful} size="sm" placeholder="Select a pet!" class="dark:bg-zinc-800">
				<option value={false}>None</option>
				<option value={true}>Mooshroom</option>
			</Select>
			<div class="flex flex-col gap-2 max-w-lg w-full" />
		</section>
		<section class="flex-1 w-full p-4 rounded-md bg-gray-200 dark:bg-zinc-800">
			<Cropselector />
			<div class="flex flex-col gap-2 max-w-lg w-full">
				{#each sorted as [cropId, info] (cropId)}
					{@const name = PROPER_CROP_NAME[cropId]}
					{#if name && ($selectedCrops[name] || !$anyCropSelected)}
						<div class="flex justify-between items-center w-full px-4 py-2">
							<span class="text-lg font-semibold">{PROPER_CROP_NAME[cropId]}</span>
							<span class="text-lg font-semibold">{info.npcCoins.toLocaleString()}</span>
						</div>
					{/if}
				{/each}
			</div>
		</section>
	</div>
</main>
