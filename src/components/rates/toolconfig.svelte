<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer';
	import type { FarmingTool } from 'farming-weight';
	import { Button, Label, Select } from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';
	import { slide } from 'svelte/transition';

	export let tool: FarmingTool;
	export let player: RatesPlayerStore;

	const counterOptions = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000, 10_000_000_000];

	let expanded = false;
	let reforge = tool.reforge?.name.toLowerCase() ?? 'bountiful';

	let counter = counterOptions.findLast((c) => c < tool.farmed) ?? 10_000;
</script>

<div class="flex flex-col gap-2 w-full rounded-md">
	<div class="flex justify-between items-center w-full">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span class="text-lg font-semibold">{@html FormatMinecraftText(tool.name ?? '')}</span>

		<div class="flex items-center gap-2">
			<Button color="none" size="sm" class="p-2" on:click={() => (expanded = !expanded)}>
				<EditOutline size="sm" />
			</Button>

			<Lorebtn item={tool.item}>
				{#if tool.cultivating}
					<p>
						<span class="font-semibold select-none">Cultivating:</span>
						<span class="select-all">{tool.cultivating.toLocaleString()}</span>
					</p>
				{/if}
			</Lorebtn>

			<Fortunebreakdown total={tool.fortune} breakdown={tool.fortuneBreakdown}>
				{#if tool.isMissingDedication()}
					<p class="text-xs flex-wrap">
						Dedication is not included in the breakdown because crop milestones are not available in
						Hypixel's API.
					</p>
				{/if}
			</Fortunebreakdown>
		</div>
	</div>
	{#if expanded}
		<div class="flex flex-col gap-2" transition:slide>
			<Label>Reforge</Label>
			<Select
				bind:value={reforge}
				size="sm"
				placeholder="Reforge"
				class="dark:bg-zinc-800"
				on:change={() => {
					tool.changeReforgeTo(reforge);
					player.refresh();
				}}
			>
				<option value="bountiful">Bountiful</option>
				<option value="blessed">Blessed</option>
			</Select>
			<Label>Farmed Crops</Label>
			<Select
				bind:value={counter}
				size="sm"
				placeholder="Farmed Crops"
				class="dark:bg-zinc-800"
				on:change={() => {
					tool.changeFarmedCropsTo(counter);
					player.refresh();
				}}
			>
				{#each counterOptions as c (c)}
					<option value={c}>{c.toLocaleString()}</option>
				{/each}
			</Select>
			<p class="text-gray-500 text-sm">More config options coming soon!</p>
		</div>
	{/if}
</div>
