<script lang="ts">
	import type { components } from '$lib/api/api';
	import { STAT_ICONS, Stat } from 'farming-weight';
	export let weights: components['schemas']['WeightsDto'];

	$: stats = weights.pests ?? {};
	$: pests = stats.values ?? {};
	$: brackets = Object.entries(stats.brackets ?? {});
</script>

<table class="w-full">
	<thead>
		<tr class="bg-gray-200 dark:bg-zinc-700">
			<th class="text-left">Pest</th>
			{#each brackets as [count, fortune], i}
				<th class="text-left">
					{#if i === brackets.length - 1}
						<p>{count}+</p>
					{:else}
						<p>{+count + 1} - {+brackets[i + 1][0]}</p>
					{/if}
					<p class="font-normal">{fortune} <span class="font-mono">{STAT_ICONS[Stat.FarmingFortune]}</span></p>
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Object.entries(pests) as [pest, values]}
			<tr class="bg-gray-100 dark:bg-zinc-800">
				<td class="first-letter:uppercase">{pest}</td>
				{#each Object.values(values) as crops}
					<td>{crops.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	td,
	th {
		@apply p-1 px-2;
	}

	tbody > tr:nth-child(odd) {
		@apply bg-opacity-50;
	}
</style>
