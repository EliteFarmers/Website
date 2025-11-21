<script lang="ts">
	import { getMemberInventories } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import InventoryBasic from './inventory-basic.svelte';

	const inventories = ['wardrobe', 'armor'];

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
	const wardrobe = $derived(data?.current?.['wardrobe']);
	const equippedSlot = $derived(+(wardrobe?.metadata?.['equipped_slot'] ?? -1));
</script>

<div class="my-1 flex w-fit flex-wrap items-center justify-center gap-4 gap-y-2">
	{#if wardrobe}
		<InventoryBasic
			inventory={wardrobe}
			wrap={true}
			inventorySize={9 * 4}
			itemModifier={(inventory, slot, item) => {
				if (equippedSlot === -1 || !armor) {
					return { inventory, item };
				}

				const row = Math.floor(slot / 9);
				const col = (slot + 1) % 9;
				const page = Math.floor(slot / 36);
				const equippedPage = Math.floor((equippedSlot - 1) / 9);

				if (slot < 0 || col !== equippedSlot % 9 || page !== equippedPage) {
					return { inventory, item };
				}
				return { inventory: armor.id, item: armor.items[Math.abs((row % 4) - 3)], highlight: true };
			}}
		/>
	{/if}
</div>
