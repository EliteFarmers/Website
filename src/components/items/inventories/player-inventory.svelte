<script lang="ts">
	import { getMemberInventories } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import InventoryBasic from './inventory-basic.svelte';

	const inventories = ['inventory', 'armor', 'equipment'];
	const inventorySlotClass = 'size-12 sm:size-16';

	const ctx = getStatsContext();

	let data = $derived(
		ctx.member.current
			? getMemberInventories({
					playerUuid: ctx.uuid,
					profileUuid: ctx.selectedProfile?.profileId ?? '',
					inventories:
						ctx.member.current?.inventories
							.filter((inv) => inventories.includes(inv.name))
							.map((inv) => inv.id) ?? [],
				})
			: null
	);

	const armor = $derived(data?.current?.['armor']);
	const equipment = $derived(data?.current?.['equipment']);
	const inventory = $derived(data?.current?.['inventory']);
</script>

<div class="my-4 w-full overflow-x-auto px-2">
	{#if data?.current}
		<div class="flex min-w-max flex-col items-center gap-4 md:flex-row md:items-start md:justify-center md:gap-6">
			<div
				class="flex w-full flex-row items-center justify-between gap-3 md:w-fit md:items-start md:justify-center"
			>
				{#if armor}
					<div class="flex flex-row-reverse gap-2 md:flex-col-reverse">
						<InventoryBasic inventory={armor} slotClass={inventorySlotClass} />
					</div>
				{/if}
				{#if equipment}
					<div class="flex flex-row gap-2 md:flex-col">
						<InventoryBasic inventory={equipment} slotClass={inventorySlotClass} />
					</div>
				{/if}
			</div>
			{#if inventory}
				<div class="grid w-fit grid-cols-9 items-center justify-center gap-2">
					<InventoryBasic
						{inventory}
						slotClass={inventorySlotClass}
						sorter={(a, b) => {
							// Move hotbar slots to the end
							const aSlot = +a[0] < 9 ? +a[0] + 50 : +a[0];
							const bSlot = +b[0] < 9 ? +b[0] + 50 : +b[0];
							return aSlot - bSlot;
						}}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
