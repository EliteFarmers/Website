<script lang="ts">
	import type { components } from '$lib/api/api';
	import { STAT_ICONS, Stat } from 'farming-weight';
	interface Props {
		weights: components['schemas']['WeightsDto'];
	}

	let { weights }: Props = $props();

	let stats = $derived(weights.pests ?? {});
	let pests = $derived(stats.values ?? {});
	let brackets = $derived(Object.entries(stats.brackets ?? {}));
</script>

<div class="scrollbar-none flex w-full overflow-x-scroll">
	<table class="flex-grow-1 w-full min-w-[48rem] max-w-4xl">
		<thead>
			<tr class="bg-muted-variant">
				<th class="text-left">Pest Brackets</th>
				{#each brackets as [count, fortune], i}
					<th class="text-left">
						<div class="flex flex-col gap-1">
							{#if i === brackets.length - 1}
								<p>{count}+</p>
							{:else}
								<p>{+count + 1} - {+brackets[i + 1][0]}</p>
							{/if}
							<p class="font-normal">
								{fortune} <span class="font-mono">{STAT_ICONS[Stat.FarmingFortune]}</span>
							</p>
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(pests) as [pest, values]}
				<tr class="bg-muted">
					<td class="first-letter:uppercase">{pest}</td>
					{#each Object.values(values) as crops}
						<td>{crops.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	td,
	th {
		@apply p-1 px-2;
	}

	tbody > tr:nth-child(odd) {
		@apply bg-opacity-50;
	}
</style>
