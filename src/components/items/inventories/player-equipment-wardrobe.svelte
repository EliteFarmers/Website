<script lang="ts">
	import type { ItemDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getInventoryItemDetails, getMemberInventories } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import ItemDialog from '../item-dialog.svelte';
	import InventoryPlaceholder from './inventory-placeholder.svelte';
	import InventorySlot from './inventory-slot.svelte';

	const inventories = ['equipment_wardrobe', 'equipment'];
	const equipmentSlotOrder = [
		'EQUIPMENT_SLOT_1',
		'EQUIPMENT_SLOT_2',
		'EQUIPMENT_SLOT_3',
		'EQUIPMENT_SLOT_4',
	] as const;
	type EquipmentSlot = (typeof equipmentSlotOrder)[number];
	type EquipmentLoadout = {
		id: string;
		inventoryId: string;
		pieces: Partial<Record<EquipmentSlot, ItemDto | null>>;
		highlight: boolean;
	};

	const equippedInventorySlots = {
		EQUIPMENT_SLOT_1: '0',
		EQUIPMENT_SLOT_2: '1',
		EQUIPMENT_SLOT_3: '2',
		EQUIPMENT_SLOT_4: '3',
	} as const satisfies Record<EquipmentSlot, string>;
	const inventorySlotClass = 'size-12 sm:size-16';

	const ctx = getStatsContext();
	const gbl = getGlobalContext();

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

	const equipment = $derived(data?.current?.['equipment']);
	const wardrobe = $derived(data?.current?.['equipment_wardrobe']);
	const wardrobeOverview = $derived(ctx.member.current?.inventories.find((inv) => inv.name === 'equipment_wardrobe'));
	const equippedSet = $derived(wardrobe?.metadata?.['equipped_set'] ?? '-1');
	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
	let itemDetails = $state<ReturnType<typeof getInventoryItemDetails> | null>(null);

	const loadouts = $derived.by(() => {
		const groups = {} as Record<string, EquipmentLoadout>;

		for (const [slot, item] of Object.entries(wardrobe?.items ?? {})) {
			if (!item) continue;

			const [loadoutId, equipmentSlot] = slot.split(':');
			if (!loadoutId || !equipmentSlot || !/^\d+$/.test(loadoutId)) continue;
			if (!equipmentSlotOrder.includes(equipmentSlot as EquipmentSlot)) continue;

			const typedEquipmentSlot = equipmentSlot as EquipmentSlot;
			const loadout = groups[loadoutId] ?? {
				id: loadoutId,
				inventoryId: wardrobe?.id ?? '',
				pieces: {},
				highlight: false,
			};
			loadout.pieces[typedEquipmentSlot] = item;
			groups[loadoutId] = loadout;
		}

		if (equipment && Number(equippedSet) > 0) {
			groups[equippedSet] = {
				id: equippedSet,
				inventoryId: equipment.id,
				pieces: Object.fromEntries(
					equipmentSlotOrder.map((slot) => [slot, equipment.items[equippedInventorySlots[slot]] ?? null])
				),
				highlight: true,
			};
		}

		return Object.values(groups).sort((a, b) => Number(a.id) - Number(b.id));
	});
	const loadoutGroups = $derived.by(() => {
		const groups = [] as EquipmentLoadout[][];
		for (let i = 0; i < loadouts.length; i += 9) {
			groups.push(loadouts.slice(i, i + 9));
		}
		return groups;
	});

	function onSelect(item: ItemDto | null, inventoryId: string) {
		if (!item || !inventoryId) return;

		selectedItem = item;
		open = true;
		itemDetails = getInventoryItemDetails({
			inventoryUuid: inventoryId,
			skyblockId: selectedItem.skyblockId ?? '',
			slotId: selectedItem.slot ?? '',
			packs: gbl.enabledPackIds.join(',') || undefined,
		});
	}
</script>

<div class="my-4 w-full px-2">
	{#if wardrobe && loadouts.length > 0}
		<div class="flex w-full flex-wrap items-start justify-center gap-4">
			{#each loadoutGroups as group (group[0]?.id)}
				<div class="grid w-fit grid-cols-9 items-start justify-center gap-2">
					{#each group as loadout (loadout.id)}
						<div
							class="flex w-fit flex-col gap-3 rounded-md border border-transparent {loadout.highlight
								? 'border-link/50'
								: ''}"
						>
							{#each equipmentSlotOrder as equipmentSlot (equipmentSlot)}
								<InventorySlot
									item={loadout.pieces[equipmentSlot] ?? null}
									inventoryId={loadout.inventoryId}
									onSelect={(item) => onSelect(item, loadout.inventoryId)}
									highlight={loadout.highlight}
									class={inventorySlotClass}
								/>
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else if wardrobeOverview}
		<div class="flex w-full flex-wrap items-start justify-center gap-4">
			<InventoryPlaceholder
				slotCount={wardrobeOverview.slotCount}
				inventorySize={9 * 4}
				slotsPerColumn={4}
				slotClass={inventorySlotClass}
				gridClass="grid w-fit grid-cols-9 items-start justify-center gap-2"
			/>
		</div>
	{/if}
</div>

<ItemDialog bind:open bind:selectedItem {itemDetails} />
