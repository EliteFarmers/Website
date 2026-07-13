<script lang="ts">
	import { getMemberInventories } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Skeleton } from '$ui/skeleton';
	import FormattedText from '../formatted-text.svelte';
	import InventoryBasic from './inventory-basic.svelte';
	import InventoryPlaceholder from './inventory-placeholder.svelte';
	import InventorySlot from './inventory-slot.svelte';

	const ctx = getStatsContext();
	const inventorySlotClass = 'size-12 sm:size-16';

	let data = $derived(
		ctx.member.current
			? getMemberInventories({
					playerUuid: ctx.uuid,
					profileUuid: ctx.selectedProfile?.profileId ?? '',
					inventories:
						ctx.member.current?.inventories
							.filter((inv) => inv.name.startsWith('backpack_') || inv.name === 'icons_backpack')
							.map((inv) => inv.id) ?? [],
				})
			: null
	);

	const backpacks = $derived(
		Object.entries(data?.current ?? {})
			.filter(([invName]) => invName.startsWith('backpack_'))
			.sort((a, b) => +a[0].split('_')[1] - +b[0].split('_')[1])
	);

	const icons = $derived(data?.current?.['icons_backpack']);
	const backpackOverviews = $derived(
		(ctx.member.current?.inventories ?? [])
			.filter((inv) => inv.name.startsWith('backpack_'))
			.sort((a, b) => +a.name.split('_')[1] - +b.name.split('_')[1])
	);
</script>

<div class="flex w-full flex-wrap items-start justify-center gap-4 overflow-x-auto">
	{#if data?.current}
		{#each backpacks as [invName, inventoryData] (invName)}
			<div class="flex min-w-max flex-col items-start gap-3">
				<div class="flex flex-row items-center gap-3">
					{#if icons}
						<InventorySlot
							inventoryId={icons?.id}
							item={icons?.items[+invName.split('_')[1]] ?? null}
							class={inventorySlotClass}
						/>
						<p class="text-lg font-semibold">
							<FormattedText text={icons?.items[+invName.split('_')[1]]?.name ?? 'Unknown'} />
						</p>
					{/if}
				</div>
				<InventoryBasic
					inventory={inventoryData}
					wrap={true}
					inventorySize={200}
					slotClass={inventorySlotClass}
				/>
			</div>
		{/each}
	{:else}
		{#each backpackOverviews as inventory (inventory.id)}
			<div class="flex min-w-max flex-col items-start gap-3">
				<div class="flex flex-row items-center gap-3">
					<Skeleton class={inventorySlotClass} />
					<Skeleton class="h-7 w-28" />
				</div>
				<InventoryPlaceholder
					slotCount={inventory.slotCount}
					inventorySize={200}
					slotClass={inventorySlotClass}
				/>
			</div>
		{/each}
	{/if}
</div>
