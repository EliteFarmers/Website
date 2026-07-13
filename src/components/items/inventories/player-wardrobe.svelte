<script lang="ts">
	import type { ItemDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { getInventoryItemDetails, getMemberInventories } from '$lib/remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import ItemDialog from '../item-dialog.svelte';
	import InventoryBasic from './inventory-basic.svelte';
	import InventoryPlaceholder from './inventory-placeholder.svelte';
	import InventorySlot from './inventory-slot.svelte';

	const inventories = ['wardrobe', 'armor'];
	const armorSlotOrder = ['HELMET', 'CHESTPLATE', 'LEGGINGS', 'BOOTS'] as const;
	type ArmorSlot = (typeof armorSlotOrder)[number];
	type WardrobeLoadout = {
		id: string;
		inventoryId: string;
		pieces: Partial<Record<ArmorSlot, ItemDto | null>>;
		highlight: boolean;
	};

	const armorInventorySlots = {
		HELMET: '3',
		CHESTPLATE: '2',
		LEGGINGS: '1',
		BOOTS: '0',
	} as const satisfies Record<ArmorSlot, string>;
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

	const armor = $derived(data?.current?.['armor']);
	const wardrobe = $derived(data?.current?.['wardrobe']);
	const wardrobeOverview = $derived(ctx.member.current?.inventories.find((inv) => inv.name === 'wardrobe'));
	const equippedSlot = $derived(wardrobe?.metadata?.['equipped_slot'] ?? '-1');
	let selectedItem = $state<ItemDto | null>(null);
	let open = $state(false);
	let itemDetails = $state<ReturnType<typeof getInventoryItemDetails> | null>(null);

	const loadouts = $derived.by(() => {
		const groups = {} as Record<string, WardrobeLoadout>;
		let isLoadoutWardrobe = wardrobe?.metadata?.source === 'loadout.armor';

		for (const [slot, item] of Object.entries(wardrobe?.items ?? {})) {
			if (!item) continue;

			const [loadoutId, armorSlot] = slot.split(':');
			if (!loadoutId || !armorSlot || !/^\d+$/.test(loadoutId)) {
				continue;
			}

			if (!armorSlotOrder.includes(armorSlot as (typeof armorSlotOrder)[number])) {
				continue;
			}

			isLoadoutWardrobe = true;
			const typedArmorSlot = armorSlot as ArmorSlot;
			const loadout = groups[loadoutId] ?? {
				id: loadoutId,
				inventoryId: wardrobe?.id ?? '',
				pieces: {},
				highlight: false,
			};
			loadout.pieces[typedArmorSlot] = item;
			groups[loadoutId] = loadout;
		}

		if (isLoadoutWardrobe && armor && Number(equippedSlot) > 0) {
			groups[equippedSlot] = {
				id: equippedSlot,
				inventoryId: armor.id,
				pieces: Object.fromEntries(
					armorSlotOrder.map((slot) => [slot, armor.items[armorInventorySlots[slot]] ?? null])
				),
				highlight: true,
			};
		}

		return Object.values(groups).sort((a, b) => Number(a.id) - Number(b.id));
	});
	const loadoutGroups = $derived.by(() => {
		const groups = [] as WardrobeLoadout[][];
		for (let i = 0; i < loadouts.length; i += 9) {
			groups.push(loadouts.slice(i, i + 9));
		}
		return groups;
	});

	function onSelect(item: ItemDto | null, inventoryId = wardrobe?.id) {
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

	function legacyItemModifier(inventory: string, slot: number, item: ItemDto | null) {
		const equipped = Number(equippedSlot);
		if (equipped === -1 || !armor) {
			return { inventory, item };
		}

		const row = Math.floor(slot / 9);
		const col = (slot + 1) % 9;
		const page = Math.floor(slot / 36);
		const equippedPage = Math.floor((equipped - 1) / 9);

		if (slot < 0 || col !== equipped % 9 || page !== equippedPage) {
			return { inventory, item };
		}

		return { inventory: armor.id, item: armor.items[Math.abs((row % 4) - 3)], highlight: true };
	}
</script>

<div class="my-4 w-full px-2">
	{#if wardrobe}
		{#if loadouts.length > 0}
			<div class="flex w-full flex-wrap items-start justify-center gap-4">
				{#each loadoutGroups as group (group[0]?.id)}
					<div class="grid w-fit grid-cols-9 items-start justify-center gap-2">
						{#each group as loadout (loadout.id)}
							<div
								class="flex w-fit flex-col gap-3 rounded-md border border-transparent {loadout.highlight
									? 'border-link/50'
									: ''}"
							>
								{#each armorSlotOrder as armorSlot (armorSlot)}
									<InventorySlot
										item={loadout.pieces[armorSlot] ?? null}
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
		{:else}
			<div class="flex w-full flex-wrap items-start justify-center gap-4">
				<div class="flex w-fit flex-col items-center justify-center gap-3">
					<InventoryBasic
						inventory={wardrobe}
						wrap={true}
						inventorySize={9 * 4}
						itemModifier={legacyItemModifier}
						slotClass={inventorySlotClass}
						gridClass="grid w-fit grid-cols-9 items-center justify-center gap-3"
					/>
				</div>
			</div>
		{/if}
	{:else if wardrobeOverview}
		<div class="flex w-full flex-wrap items-start justify-center gap-4">
			<InventoryPlaceholder
				slotCount={wardrobeOverview.slotCount}
				inventorySize={9 * 4}
				slotsPerColumn={wardrobeOverview.metadata?.source === 'loadout.armor' ? 4 : 1}
				slotClass={inventorySlotClass}
				gridClass="grid w-fit grid-cols-9 items-start justify-center gap-2"
			/>
		</div>
	{/if}
</div>

<ItemDialog bind:open bind:selectedItem {itemDetails} />
