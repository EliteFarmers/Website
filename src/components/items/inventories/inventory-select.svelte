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
	import { ScrollArea } from '$ui/scroll-area';
	import * as Tabs from '$ui/tabs';
	import Inventory from './inventory.svelte';
	import PlayerBackpacks from './player-backpacks.svelte';
	import PlayerInventory from './player-inventory.svelte';
	import PlayerWardrobe from './player-wardrobe.svelte';

	const ctx = getStatsContext();
	const inventorySlotClass = 'size-12 sm:size-16';

	let selectedInventoryId = $state(inventoryOptions[0].value);
	let availableInventoryOptions = $derived.by(() => {
		const memberInventories = ctx.member.current?.inventories ?? [];

		return inventoryOptions.filter((option) => {
			if (option.value === 'inventory') {
				return memberInventories.some((inv) => ['inventory', 'armor', 'equipment'].includes(inv.name));
			}

			if (option.value === 'backpacks') {
				return memberInventories.some((inv) => inv.name.startsWith('backpack_'));
			}

			return memberInventories.some((inv) => inv.name === option.value);
		});
	});
	let selectedInventory = $derived.by(() => {
		return ctx.member.current?.inventories.find((inv) => inv.name === selectedInventoryId) ?? null;
	});

	$effect(() => {
		if (availableInventoryOptions.length === 0) return;
		if (availableInventoryOptions.some((option) => option.value === selectedInventoryId)) return;

		selectedInventoryId = availableInventoryOptions[0].value;
	});
</script>

{#if availableInventoryOptions.length > 0}
	<section
		id="inventories"
		class="my-16 flex w-full flex-col items-center gap-5 px-2 transition-transform duration-400"
	>
		<div class="flex w-full max-w-5xl flex-col items-center justify-center gap-4">
			<h2 class="flex flex-row items-center gap-2 text-3xl font-semibold">Inventories</h2>

			<Tabs.Root bind:value={selectedInventoryId} class="w-full min-w-0 items-center gap-0">
				<ScrollArea class="w-full min-w-0 px-1 pb-3" orientation="horizontal" type="always">
					<Tabs.List class="h-auto w-max min-w-full justify-center gap-2 rounded-md p-1">
						{#each availableInventoryOptions as option (option.value)}
							<Tabs.Trigger value={option.value} class="h-11 flex-none px-4 text-base">
								{option.label}
							</Tabs.Trigger>
						{/each}
					</Tabs.List>
				</ScrollArea>
			</Tabs.Root>
		</div>

		{#if selectedInventoryId === 'inventory'}
			<PlayerInventory />
		{:else if selectedInventoryId === 'backpacks'}
			<PlayerBackpacks />
		{:else if selectedInventoryId === 'wardrobe'}
			<PlayerWardrobe />
		{:else if selectedInventory?.name === 'talisman_bag'}
			<div class="flex w-full flex-wrap items-start justify-center gap-4 overflow-x-auto px-2">
				<Inventory inventory={selectedInventory} inventorySize={45} slotClass={inventorySlotClass} />
			</div>
		{:else if selectedInventory?.name === 'ender_chest'}
			<div class="flex w-full flex-wrap items-start justify-center gap-4 overflow-x-auto px-2">
				<Inventory inventory={selectedInventory} inventorySize={9 * 5} slotClass={inventorySlotClass} />
			</div>
		{:else if selectedInventory}
			<div class="flex w-full flex-wrap items-start justify-center gap-4 overflow-x-auto px-2">
				<Inventory inventory={selectedInventory} inventorySize={1000} slotClass={inventorySlotClass} />
			</div>
		{/if}
	</section>
{/if}
