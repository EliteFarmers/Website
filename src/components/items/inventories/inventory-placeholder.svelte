<script lang="ts">
	import { Skeleton } from '$ui/skeleton';

	interface Props {
		slotCount: number;
		inventorySize?: number;
		slotsPerColumn?: number;
		slotClass?: string;
		gridClass?: string;
		columnClass?: string;
	}

	let {
		slotCount,
		inventorySize = 27,
		slotsPerColumn = 1,
		slotClass = 'size-12 sm:size-16',
		gridClass = 'my-1 grid w-fit grid-cols-9 items-center justify-center gap-2',
		columnClass = 'flex w-fit flex-col gap-3',
	}: Props = $props();

	const groupSizes = $derived.by(() => {
		const groups: number[] = [];
		for (let offset = 0; offset < slotCount; offset += inventorySize) {
			groups.push(Math.min(inventorySize, slotCount - offset));
		}
		return groups;
	});
</script>

{#each groupSizes as groupSize, groupIndex (groupIndex)}
	<div class={gridClass}>
		{#if slotsPerColumn > 1}
			{#each { length: Math.ceil(groupSize / slotsPerColumn) }, columnIndex (columnIndex)}
				<div class={columnClass}>
					{#each { length: Math.min(slotsPerColumn, groupSize - columnIndex * slotsPerColumn) }, slotIndex (slotIndex)}
						<Skeleton class={slotClass} />
					{/each}
				</div>
			{/each}
		{:else}
			{#each { length: groupSize }, slotIndex (slotIndex)}
				<Skeleton class={slotClass} />
			{/each}
		{/if}
	</div>
{/each}
