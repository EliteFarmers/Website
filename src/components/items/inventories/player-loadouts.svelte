<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import type { ItemDto, PetDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getInventoryItemDetails, getMemberInventories } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Skeleton } from '$ui/skeleton';
	import ItemDialog from '../item-dialog.svelte';
	import InventorySlot from './inventory-slot.svelte';

	const ctx = getStatsContext();
	const gbl = getGlobalContext();

	const inventories = ['armor', 'equipment', 'equipment_wardrobe', 'wardrobe'];
	const armorSlotOrder = ['HELMET', 'CHESTPLATE', 'LEGGINGS', 'BOOTS'] as const;
	const equipmentSlotOrder = [
		'EQUIPMENT_SLOT_1',
		'EQUIPMENT_SLOT_2',
		'EQUIPMENT_SLOT_3',
		'EQUIPMENT_SLOT_4',
	] as const;
	const armorInventorySlots = {
		HELMET: '3',
		CHESTPLATE: '2',
		LEGGINGS: '1',
		BOOTS: '0',
	} as const;
	const equipmentInventorySlots = {
		EQUIPMENT_SLOT_1: '0',
		EQUIPMENT_SLOT_2: '1',
		EQUIPMENT_SLOT_3: '2',
		EQUIPMENT_SLOT_4: '3',
	} as const;
	const inventorySlotClass = 'size-12 sm:size-14';

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
	const equipmentWardrobe = $derived(data?.current?.['equipment_wardrobe']);
	const wardrobe = $derived(data?.current?.['wardrobe']);
	const equippedArmorSet = $derived(
		Number(wardrobe?.metadata?.['equipped_set'] ?? wardrobe?.metadata?.['equipped_slot'] ?? -1)
	);
	const equippedEquipmentSet = $derived(Number(equipmentWardrobe?.metadata?.['equipped_set'] ?? -1));
	const inventoriesLoaded = $derived(data?.current != null);

	const loadouts = $derived(ctx.member.current?.memberData.loadouts ?? []);
	const petsByLocalId = $derived.by(() => {
		const pets: Record<string, PetDto> = {};
		for (const pet of ctx.member.current?.pets ?? []) {
			if (pet.localId) pets[pet.localId] = pet;
		}
		return pets;
	});
	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
	let itemDetails = $state<ReturnType<typeof getInventoryItemDetails> | null>(null);

	function resolveArmorPiece(setId: number, slot: (typeof armorSlotOrder)[number]) {
		const useEquippedInventory = setId === equippedArmorSet && armor != null;
		return {
			item: useEquippedInventory
				? (armor.items[armorInventorySlots[slot]] ?? null)
				: (wardrobe?.items[`${setId}:${slot}`] ?? null),
			inventoryId: useEquippedInventory ? armor.id : (wardrobe?.id ?? ''),
			highlight: useEquippedInventory,
		};
	}

	function resolveEquipmentPiece(setId: number, slot: (typeof equipmentSlotOrder)[number]) {
		const useEquippedInventory = setId === equippedEquipmentSet && equipment != null;
		return {
			item: useEquippedInventory
				? (equipment.items[equipmentInventorySlots[slot]] ?? null)
				: (equipmentWardrobe?.items[`${setId}:${slot}`] ?? null),
			inventoryId: useEquippedInventory ? equipment.id : (equipmentWardrobe?.id ?? ''),
			highlight: useEquippedInventory,
		};
	}

	function onSelect(item: ItemDto, inventoryId: string) {
		if (!inventoryId) return;

		selectedItem = item;
		open = true;
		itemDetails = getInventoryItemDetails({
			inventoryUuid: inventoryId,
			skyblockId: item.skyblockId ?? '',
			slotId: item.slot ?? '',
			packs: gbl.enabledPackIds.join(',') || undefined,
		});
	}

	function label(value: string) {
		return value
			.split('_')
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
			.join(' ');
	}
</script>

<div class="flex w-full items-center justify-center">
	<div class="my-4 flex max-w-7xl flex-wrap gap-4 px-2">
		{#each loadouts as loadout (loadout.id)}
			{@const pet = loadout.petLocalId ? petsByLocalId[loadout.petLocalId] : undefined}
			<article class="bg-card flex min-w-0 flex-col gap-4 rounded-lg border p-4 shadow-sm">
				<div class="flex items-center gap-3">
					<h3 class="text-lg font-semibold">Loadout {loadout.id}</h3>
				</div>

				<div class="flex flex-col gap-3">
					{#if loadout.armorSetId != null}
						<div class="flex items-center justify-between gap-3">
							<p class="text-muted-foreground text-sm font-medium">Armor</p>
						</div>
						<div class="grid grid-cols-4 gap-2">
							{#if inventoriesLoaded}
								{#each armorSlotOrder as armorSlot (armorSlot)}
									{@const piece = resolveArmorPiece(loadout.armorSetId, armorSlot)}
									<InventorySlot
										item={piece.item}
										inventoryId={piece.inventoryId}
										onSelect={(item) => onSelect(item, piece.inventoryId)}
										highlight={piece.highlight}
										class={inventorySlotClass}
									/>
								{/each}
							{:else}
								{#each { length: 4 }, slot (slot)}
									<Skeleton class={inventorySlotClass} />
								{/each}
							{/if}
						</div>
					{/if}

					{#if loadout.equipmentSetId != null}
						<div class="flex items-center justify-between gap-3">
							<p class="text-muted-foreground text-sm font-medium">Equipment</p>
						</div>
						<div class="grid grid-cols-4 gap-2">
							{#if inventoriesLoaded}
								{#each equipmentSlotOrder as equipmentSlot (equipmentSlot)}
									{@const piece = resolveEquipmentPiece(loadout.equipmentSetId, equipmentSlot)}
									<InventorySlot
										item={piece.item}
										inventoryId={piece.inventoryId}
										onSelect={(item) => onSelect(item, piece.inventoryId)}
										highlight={piece.highlight}
										class={inventorySlotClass}
									/>
								{/each}
							{:else}
								{#each { length: 4 }, slot (slot)}
									<Skeleton class={inventorySlotClass} />
								{/each}
							{/if}
						</div>
					{/if}
				</div>

				{#if pet}
					<div class="bg-muted/30 flex items-center gap-3 rounded-md p-3">
						<ItemRender skyblockId={pet.type} pet class="size-11 shrink-0" />
						<div class="min-w-0">
							<p class="truncate font-medium">{label(pet.type)}</p>
							<p class="text-muted-foreground text-sm">
								Level {pet.level}{pet.tier ? ` · ${label(pet.tier)}` : ''}
							</p>
						</div>
					</div>
				{:else if loadout.petLocalId}
					<p class="text-muted-foreground text-sm">Linked pet data is unavailable.</p>
				{/if}

				<dl class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-sm">
					{#if loadout.powerStone}
						<dt class="text-muted-foreground">Power stone</dt>
						<dd class="text-right font-medium">{label(loadout.powerStone)}</dd>
					{/if}
					{#if loadout.tuningPointsSlot != null}
						<dt class="text-muted-foreground">Tuning slot</dt>
						<dd class="text-right font-medium">{loadout.tuningPointsSlot}</dd>
					{/if}
					{#if loadout.miningCoreSelectedSlot != null}
						<dt class="text-muted-foreground">Mining core slot</dt>
						<dd class="text-right font-medium">{loadout.miningCoreSelectedSlot}</dd>
					{/if}
					{#if loadout.foragingCoreSelectedSlot != null}
						<dt class="text-muted-foreground">Foraging core slot</dt>
						<dd class="text-right font-medium">{loadout.foragingCoreSelectedSlot}</dd>
					{/if}
				</dl>
			</article>
		{/each}
	</div>
</div>
<ItemDialog bind:open bind:selectedItem {itemDetails} />
