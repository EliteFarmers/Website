<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Item from '$ui/item';
	import { GARDEN_CHIPS, normalizeChipId } from 'farming-weight';
	import ProgressBar from '../progress-bar.svelte';

	const ctx = getStatsContext();
	const garden = $derived(ctx.member.current?.memberData?.garden);

	const mapping = $derived(
		Object.fromEntries(
			Object.keys(garden?.chips ?? {}).map(
				(id) => [normalizeChipId(id), garden?.chips?.[id as keyof typeof garden.chips]] as const
			)
		)
	) as Record<keyof typeof GARDEN_CHIPS, number>;
</script>

<div class="flex w-full max-w-7xl flex-row justify-center">
	<div class="flex w-full max-w-4xl flex-1 flex-col gap-1">
		<h3 class="mt-2 mb-4 text-xl leading-none font-semibold">Garden Chips</h3>
		<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
			{#each Object.entries(GARDEN_CHIPS) as [id, chip] (id)}
				{@const count = mapping[id as keyof typeof mapping] ?? 0}
				<Item.Root variant="outline" class="flex flex-row items-center">
					<ItemRender skyblockId={chip.skyblockId} class="pixelated size-12" />
					<Item.Content>
						<Item.Title class="font-semibold">{chip.name}</Item.Title>
						<Item.Description
							><ProgressBar
								class="text-primary"
								percent={(count / 20) * 100}
								readable="{count} / 20"
								barBg="bg-card"
							/></Item.Description
						>
					</Item.Content>
				</Item.Root>
			{/each}
		</div>
	</div>
</div>
