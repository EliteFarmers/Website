<script lang="ts">
	import type { components } from '$lib/api/api';
	import { Button } from 'flowbite-svelte';
	import Farmingtool from './farmingtool.svelte';
	import { FarmingTool as FT } from 'farming-weight';

	export let tools: components['schemas']['ItemDto'][];

	$: actualTools = tools
		.filter((i) => FT.isValid(i))
		.map((t) => new FT(t))
		.sort((a, b) => b.farmed - a.farmed);

	let count = 10;
</script>

{#if actualTools.length !== 0}
	<div class="flex flex-1 flex-col gap-2 items-center">
		{#each actualTools.slice(0, count) as tool, i (tool.item.uuid ?? i)}
			<Farmingtool {tool} />
		{/each}
		{#if count < tools.length}
			<Button color="alternative" size="sm" on:click={() => (count = tools.length)}>Show All</Button>
		{:else if tools.length > 10}
			<Button color="alternative" size="sm" on:click={() => (count = 10)}>Show Less</Button>
		{/if}
	</div>
{/if}
