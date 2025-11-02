<script lang="ts">
	import { getWeights } from '$lib/remote';
	import { Crop, getCropFromName, getCropInfo } from 'farming-weight';

	const weights = getWeights();
	let crops = $derived(weights?.current?.crops ?? {});
</script>

<div class="scrollbar-none flex w-full overflow-x-auto">
	<table class="w-full max-w-4xl min-w-48 flex-grow-1">
		<thead>
			<tr class="bg-muted-variant">
				<th class="text-left">Crop</th>
				<th class="text-left">Collection Required Per 1 Weight</th>
				<th class="text-left">Base Drops Per Break</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(crops) as [crop, value] (crop)}
				{@const cropEnum = getCropFromName(crop) ?? Crop.Wheat}
				<tr class="bg-muted">
					<td>{crop}</td>
					{#if cropEnum === Crop.Mushroom}
						<td
							>{value.toLocaleString(undefined, { maximumFractionDigits: 0 })} - {(
								value * 2
							).toLocaleString(undefined, { maximumFractionDigits: 0 })}*</td
						>
					{:else}
						<td>{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
					{/if}
					<td>{getCropInfo(cropEnum).drops}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	@reference '$css';

	td,
	th {
		@apply p-1 px-2;
	}

	tbody > tr:nth-child(odd) {
		@apply bg-muted/50;
	}
</style>
