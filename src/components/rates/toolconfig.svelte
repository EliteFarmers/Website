<script lang="ts">
	import Lorebtn from '$comp/items/lorebtn.svelte';
	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import type { FarmingTool, PlayerOptions } from 'farming-weight';
	import { Button, Label, Select } from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';
	import { slide } from 'svelte/transition';

	export let tool: FarmingTool;
	export let options: PlayerOptions;
	export let fortune = 0;

	const counterOptions = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000];

	let expanded = false;
	let bountiful = tool.reforge?.name === 'Bountiful';
	let counter = counterOptions.findLast((c) => c < tool.farmed) ?? 10_000;

	$: if (bountiful) {
		tool.changeReforgeTo('bountiful');
		console.log('bountiful');
	} else {
		tool.changeReforgeTo('blessed');
		console.log('blessed');
	}

	$: {
		tool.item.attributes ??= {};

		if (tool.item.attributes?.['mined_crops']) {
			tool.item.attributes['mined_crops'] = counter.toString();
		}

		if (tool.item.attributes?.['cultivating']) {
			tool.item.attributes['cultivating'] = counter.toString();
		}

		tool.rebuildTool(tool.item, options);
		tool = tool;
	}

	$: fortune = tool.fortune;
</script>

<div class="flex flex-col gap-2 w-full {expanded ? 'border-zinc-100 border-solid border-2 rounded-md' : ''}">
	<div class="flex justify-between items-center w-full">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span class="text-lg font-semibold">{@html FormatMinecraftText(tool.item.name ?? '')}</span>

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
			<Select bind:value={bountiful} size="sm" placeholder="Reforge" class="dark:bg-zinc-800">
				<option value={true}>Bountiful</option>
				<option value={false}>Blessed</option>
			</Select>
			<p class="text-gray-500 text-sm">More config options coming soon!</p>
		</div>
	{/if}
</div>
