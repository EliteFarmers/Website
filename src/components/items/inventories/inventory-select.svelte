<script lang="ts" module>
	const inventoryNames: Partial<Record<string, string>> = {
		inventory: 'Inventory',
		wardrobe: 'Wardrobe',
		armor: 'Armor',
		ender_chest: 'Ender Chest',
		talisman_bag: 'Accessories Bag',
		personal_vault: 'Personal Vault',
	};

	const order = [
		'inventory',
		'armor',
		'ender_chest',
		'wardrobe',
		'talisman_bag',
		'personal_vault',
		'backpack_0',
		'backpack_1',
		'backpack_2',
		'backpack_3',
		'backpack_4',
		'backpack_5',
		'backpack_6',
		'backpack_7',
		'backpack_8',
		'backpack_9',
	];

	function getInventoryName(id: string): string | null {
		if (id.startsWith('backpack_')) {
			return `Backpack ${+id.split('_')[1] + 1}`;
		}
		return inventoryNames[id] ?? null;
	}
</script>

<script lang="ts">
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Select from '$ui/select';
	import Inventory from './inventory.svelte';

	const ctx = getStatsContext();

	const selectOptions = $derived(
		(
			(ctx.member.current?.inventories
				.map((inv) => ({
					value: inv.name,
					label: getInventoryName(inv.name),
				}))
				.filter((option) => option.label !== null) ?? []) as { value: string; label: string }[]
		).sort((a, b) => {
			const indexA = order.indexOf(a.value);
			const indexB = order.indexOf(b.value);
			if (indexA === -1 && indexB === -1) {
				return a.label.localeCompare(b.label);
			}
			if (indexA === -1) return 1;
			if (indexB === -1) return -1;
			return indexA - indexB;
		})
	);

	let selectedInventoryId = $derived<string | null>(selectOptions.length > 0 ? selectOptions[0].value : null);
	let selectedInventory = $derived.by(() => {
		return ctx.member.current?.inventories.find((inv) => inv.name === selectedInventoryId) ?? null;
	});
</script>

{#if selectOptions.length > 0}
	<section id="inventories" class="my-16 flex flex-col items-center gap-2 transition-transform duration-400">
		<div class="flex w-full max-w-lg flex-row items-center justify-between px-2">
			<h2 class="flex flex-row items-center gap-2 text-2xl font-semibold">
				Inventories
				<span class="bg-completed text-primary-foreground rounded-md p-0.5 text-sm">BETA</span>
			</h2>
			<div class="flex flex-row items-center justify-between">
				<Select.Simple options={selectOptions} bind:value={selectedInventoryId} />
			</div>
		</div>

		{#if selectedInventory}
			<Inventory inventory={selectedInventory} />
		{/if}
	</section>
{/if}
