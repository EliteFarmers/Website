<script lang="ts" module>
	const inventoryOptions = [
		{ value: 'inventory', label: 'Inventory' },
		{ value: 'wardrobe', label: 'Wardrobe' },
		{ value: 'talisman_bag', label: 'Accessories Bag' },
		{ value: 'ender_chest', label: 'Ender Chest' },
		{ value: 'backpacks', label: 'Backpacks' },
		{ value: 'personal_vault', label: 'Personal Vault' },
		{ value: 'potion_bag', label: 'Potion Bag' },
		{ value: 'fishing_bag', label: 'Fishing Bag' },
		{ value: 'quiver', label: 'Quiver' },
	];
</script>

<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Select from '$ui/select';
	import Inventory from './inventory.svelte';
	import PlayerBackpacks from './player-backpacks.svelte';
	import PlayerInventory from './player-inventory.svelte';
	import PlayerWardrobe from './player-wardrobe.svelte';

	const ctx = getStatsContext();

	let selectedInventoryId = $derived<string | null>(inventoryOptions.length > 0 ? inventoryOptions[0].value : null);
	let selectedInventory = $derived.by(() => {
		return ctx.member.current?.inventories.find((inv) => inv.name === selectedInventoryId) ?? null;
	});
</script>

{#if inventoryOptions.length > 0}
	<section id="inventories" class="my-16 flex flex-col items-center gap-2 transition-transform duration-400">
		<div class="flex w-full max-w-lg flex-row items-center justify-between px-2">
			<h2 class="flex flex-row items-center gap-2 text-2xl font-semibold">Inventories</h2>
			<div class="flex flex-row items-center justify-between">
				<Select.Simple options={inventoryOptions} bind:value={selectedInventoryId} />
			</div>
		</div>

		{#if selectedInventoryId === 'inventory'}
			<PlayerInventory />
		{:else if selectedInventoryId === 'backpacks'}
			<PlayerBackpacks />
		{:else if selectedInventoryId === 'wardrobe'}
			<PlayerWardrobe />
		{:else if selectedInventory?.name === 'talisman_bag'}
			<div class="flex flex-wrap items-start justify-center gap-4">
				<Inventory inventory={selectedInventory} inventorySize={45} />
			</div>
		{:else if selectedInventory?.name === 'ender_chest'}
			<div class="flex flex-wrap items-start justify-center gap-4">
				<Inventory inventory={selectedInventory} inventorySize={9 * 5} />
			</div>
		{:else if selectedInventory}
			<div class="flex flex-wrap items-start justify-center gap-4">
				<Inventory inventory={selectedInventory} inventorySize={1000} />
			</div>
		{/if}
	</section>
{/if}
