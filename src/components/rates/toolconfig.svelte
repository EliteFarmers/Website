<script lang="ts">
	import Fortunebreakdown from '$comp/items/tools/fortunebreakdown.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import type { FarmingTool, PlayerOptions } from 'farming-weight';
	import { Button, Label, Select } from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';
	import { slide } from 'svelte/transition';

	export let tool: FarmingTool;
	export let options: PlayerOptions;

	const counterOptions = [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000];

	let expanded = false;
	let bountiful = tool.reforge?.name === 'Bountiful';
	let counter = counterOptions.findLast((c) => c < tool.farmed) ?? 10_000;

	$: changed = tool;

	$: {
		changed.item.attributes ??= {};

		if (bountiful) {
			changed.item.attributes['modifier'] = 'bountiful';
			changed.item.name = changed.item.name?.replace('Blessed', 'Bountiful');
		} else {
			changed.item.attributes['modifier'] = 'blessed';
			changed.item.name = changed.item.name?.replace('Bountiful', 'Blessed');
		}
		changed.rebuildTool(changed.item, options);

		changed = tool;
	}

	$: {
		changed.item.attributes ??= {};

		if (changed.item.attributes?.['mined_crops']) {
			changed.item.attributes['mined_crops'] = counter.toString();
		}

		if (changed.item.attributes?.['cultivating']) {
			changed.item.attributes['cultivating'] = counter.toString();
		}

		changed.rebuildTool(changed.item, options);
		changed = changed;
	}
</script>

<div class="flex flex-col gap-2 p-4 {expanded ? 'border-zinc-100 border-solid border-2 rounded-md' : ''}">
	<div class="flex justify-between items-center w-full">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span class="text-lg font-semibold">{@html FormatMinecraftText(changed.item.name ?? '')}</span>

		<div class="flex items-center gap-2">
			<Button color="none" size="sm" on:click={() => (expanded = !expanded)}>
				<EditOutline size="sm" />
			</Button>

			<Fortunebreakdown total={changed.fortune} breakdown={changed.fortuneBreakdown}>
				{#if changed.item?.enchantments?.dedication}
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
