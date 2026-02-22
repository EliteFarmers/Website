<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { SliderSimple } from '$ui/slider';
	import * as Select from '$ui/select';
	import {
		FARMING_ARMOR_INFO,
		FARMING_ENCHANTS,
		FARMING_EQUIPMENT_INFO,
		FarmingArmor,
		GearSlot,
		LotusGear,
		Rarity,
		REFORGES,
		type EliteItemDto,
		type PlayerOptions,
	} from 'farming-weight';
	import { onMount } from 'svelte';

	interface Props {
		armor: FarmingArmor[];
		equipment: InstanceType<typeof LotusGear>[];
		options?: PlayerOptions;
	}

	let { armor = $bindable(), equipment = $bindable(), options }: Props = $props();

	const armorSlots = [GearSlot.Helmet, GearSlot.Chestplate, GearSlot.Leggings, GearSlot.Boots];
	const equipmentSlots = [GearSlot.Necklace, GearSlot.Cloak, GearSlot.Belt, GearSlot.Gloves];
	const rarityOrder = [
		Rarity.Common,
		Rarity.Uncommon,
		Rarity.Rare,
		Rarity.Epic,
		Rarity.Legendary,
		Rarity.Mythic,
		Rarity.Divine,
	];
	const commonArmorEnchants = ['pesterminator'];
	const commonEquipmentEnchants = ['green_thumb'];

	const armorReforgeOptions = Object.keys(REFORGES)
		.filter((id) => REFORGES[id]?.appliesTo.includes('Armor' as any))
		.map((id) => ({ value: id, label: REFORGES[id]?.name ?? id }));
	const equipmentReforgeOptions = Object.keys(REFORGES)
		.filter((id) => REFORGES[id]?.appliesTo.includes('Equipment' as any))
		.map((id) => ({ value: id, label: REFORGES[id]?.name ?? id }));
	const armorReforgeStones = armorReforgeOptions
		.map((option) => ({
			...option,
			stoneId: REFORGES[option.value]?.stone?.id ?? '',
			stoneName: REFORGES[option.value]?.stone?.name ?? option.label,
		}))
		.filter((option) => !!option.stoneId);
	const equipmentReforgeStones = equipmentReforgeOptions
		.map((option) => ({
			...option,
			stoneId: REFORGES[option.value]?.stone?.id ?? '',
			stoneName: REFORGES[option.value]?.stone?.name ?? option.label,
		}))
		.filter((option) => !!option.stoneId);

	function getRarityOptionsFor(maxRarity: Rarity) {
		const maxIndex = Math.max(0, rarityOrder.indexOf(maxRarity));
		const minIndex = Math.max(0, maxIndex - 1);
		return rarityOrder.slice(minIndex, maxIndex + 1).map((rarity) => ({
			value: rarity,
			label: rarity,
		}));
	}

	function armorOptionsFor(slot: GearSlot) {
		return Object.entries(FARMING_ARMOR_INFO)
			.filter(([, info]) => info?.slot === slot)
			.map(([id, info]) => ({ value: id, label: info?.name ?? id }));
	}

	function equipmentOptionsFor(slot: GearSlot) {
		return Object.entries(FARMING_EQUIPMENT_INFO)
			.filter(([, info]) => info?.slot === slot)
			.map(([id, info]) => ({ value: id, label: info?.name ?? id }));
	}

	function createArmorItem(skyblockId: string): EliteItemDto {
		const info = FARMING_ARMOR_INFO[skyblockId];
		return {
			name: info?.name ?? skyblockId,
			skyblockId,
			uuid: crypto.randomUUID(),
			lore: [info?.maxRarity?.toUpperCase() ?? Rarity.Legendary.toUpperCase()],
			attributes: {},
			enchantments: {},
		};
	}

	function createEquipmentItem(skyblockId: string): EliteItemDto {
		const info = FARMING_EQUIPMENT_INFO[skyblockId];
		return {
			name: info?.name ?? skyblockId,
			skyblockId,
			uuid: crypto.randomUUID(),
			lore: [info?.maxRarity?.toUpperCase() ?? Rarity.Legendary.toUpperCase()],
			attributes: {},
			enchantments: {},
		};
	}

	function ensureRequiredPieces() {
		let nextArmor = [...armor];
		let nextEquipment = [...equipment];

		for (const slot of armorSlots) {
			if (nextArmor.some((a) => a.slot === slot)) continue;
			const firstId = armorOptionsFor(slot)[0]?.value;
			if (!firstId) continue;
			nextArmor = [...nextArmor, new FarmingArmor(createArmorItem(firstId), options)];
		}

		for (const slot of equipmentSlots) {
			if (nextEquipment.some((e) => e.slot === slot)) continue;
			const firstId = equipmentOptionsFor(slot)[0]?.value;
			if (!firstId) continue;
			nextEquipment = [...nextEquipment, new LotusGear(createEquipmentItem(firstId), options)];
		}

		armor = nextArmor;
		equipment = nextEquipment;
	}

	function patchArmor(slot: GearSlot, mutator: (item: EliteItemDto) => void) {
		const target = armor.find((piece) => piece.slot === slot);
		if (!target) return;
		const item: EliteItemDto = {
			...target.item,
			skyblockId: target.item.skyblockId ?? target.info.skyblockId,
			name: target.item.name ?? target.info.name,
			uuid: target.item.uuid ?? crypto.randomUUID(),
			attributes: { ...(target.item.attributes ?? {}) },
			enchantments: { ...(target.item.enchantments ?? {}) },
			lore: [...(target.item.lore ?? [])],
		};
		mutator(item);
		const updated = new FarmingArmor(item, options);
		armor = armor.map((piece) => (piece.slot === slot ? updated : piece));
	}

	function patchEquipment(slot: GearSlot, mutator: (item: EliteItemDto) => void) {
		const target = equipment.find((piece) => piece.slot === slot);
		if (!target) return;
		const item: EliteItemDto = {
			...target.item,
			skyblockId: target.item.skyblockId ?? target.info.skyblockId,
			name: target.item.name ?? target.info.name,
			uuid: target.item.uuid ?? crypto.randomUUID(),
			attributes: { ...(target.item.attributes ?? {}) },
			enchantments: { ...(target.item.enchantments ?? {}) },
			lore: [...(target.item.lore ?? [])],
		};
		mutator(item);
		const updated = new LotusGear(item, options);
		equipment = equipment.map((piece) => (piece.slot === slot ? updated : piece));
	}

	function applyArmorPreset(setName: 'HELIANTHUS') {
		const ids = [
			`${setName}_HELMET`,
			`${setName}_CHESTPLATE`,
			`${setName}_LEGGINGS`,
			`${setName}_BOOTS`,
		];

		armor = FarmingArmor.fromArray(
			ids.filter((id) => !!FARMING_ARMOR_INFO[id]).map((id) => createArmorItem(id)),
			options
		);
	}

	function applyEquipmentPreset(setName: 'BLOSSOM' | 'LOTUS') {
		const ids = [
			`${setName}_NECKLACE`,
			`${setName}_CLOAK`,
			`${setName}_BELT`,
			`${setName}_BRACELET`,
		];

		equipment = LotusGear.fromArray(
			ids.filter((id) => !!FARMING_EQUIPMENT_INFO[id]).map((id) => createEquipmentItem(id)),
			options
		);
	}

	onMount(() => {
		ensureRequiredPieces();
	});
</script>

<div class="flex flex-col gap-8">
	<div class="flex flex-wrap gap-3">
		<Button
			type="button"
			variant="default"
			class="bg-primary/90 text-primary-foreground px-5 py-5 text-sm font-bold tracking-wide uppercase"
			onclick={() => applyArmorPreset('HELIANTHUS')}
		>
			Full Helianthus Armor
		</Button>
		<Button
			type="button"
			variant="default"
			class="bg-primary/80 text-primary-foreground px-5 py-5 text-sm font-bold tracking-wide uppercase"
			onclick={() => applyEquipmentPreset('BLOSSOM')}
		>
			Full Blossom Equipment
		</Button>
		<Button
			type="button"
			variant="default"
			class="bg-primary/70 text-primary-foreground px-5 py-5 text-sm font-bold tracking-wide uppercase"
			onclick={() => applyEquipmentPreset('LOTUS')}
		>
			Full Lotus Equipment
		</Button>
	</div>

	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">Armor Pieces</h3>
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
			{#each armorSlots as slot (slot)}
				{@const piece = armor.find((a) => a.slot === slot)}
				{#if piece}
					{@const armorId = piece.item.skyblockId ?? ''}
					<div class="bg-muted/20 flex flex-col gap-3 rounded-lg border p-4">
						<div class="flex items-center gap-3">
							<ItemRender
								skyblockId={armorId}
								class="size-12 shrink-0 rounded-md border bg-black/20 p-1"
							/>
							<Label class="font-semibold">{slot.toUpperCase()}</Label>
						</div>

						<Select.Simple
							options={armorOptionsFor(slot)}
							value={piece.item.skyblockId ?? null}
							change={(v) => {
								if (!v) return;
								patchArmor(slot, (item) => {
									item.skyblockId = v;
									item.name = FARMING_ARMOR_INFO[v]?.name ?? v;
								});
							}}
						/>

						<Select.Simple
							options={getRarityOptionsFor(FARMING_ARMOR_INFO[armorId]?.maxRarity ?? Rarity.Legendary)}
							value={piece.rarity}
							change={(v) => {
								if (!v) return;
								patchArmor(slot, (item) => {
									item.lore = [v.toUpperCase()];
								});
							}}
						/>

						<Select.Simple
							options={armorReforgeOptions}
							value={piece.item.attributes?.modifier ?? null}
							change={(v) =>
								patchArmor(slot, (item) => {
									item.attributes ??= {};
									item.attributes.modifier = v ?? null;
								})}
						/>
						<div class="grid grid-cols-2 gap-2">
							{#each armorReforgeStones as reforge (reforge.value)}
								<Button
									type="button"
									variant={piece.item.attributes?.modifier === reforge.value ? 'default' : 'outline'}
									class="h-auto flex-col gap-1 py-2"
									onclick={() =>
										patchArmor(slot, (item) => {
											item.attributes ??= {};
											item.attributes.modifier = reforge.value;
										})}
								>
									<ItemRender skyblockId={reforge.stoneId} class="size-8 rounded-sm p-0" />
									<span class="text-[10px]">{reforge.stoneName}</span>
								</Button>
							{/each}
						</div>

						{#each commonArmorEnchants as enchantId (enchantId)}
							{@const enchant = FARMING_ENCHANTS[enchantId]}
							<div class="flex flex-col gap-1">
								<Label class="text-xs">{enchant.name} ({piece.item.enchantments?.[enchantId] ?? 0})</Label>
								<SliderSimple
									class="h-8"
									min={0}
									max={enchant.maxLevel}
									step={1}
									value={piece.item.enchantments?.[enchantId] ?? 0}
									onValueChange={(v) => {
										const value = Array.isArray(v) ? v[0] : v;
										if (value === undefined) return;
										patchArmor(slot, (item) => {
											item.enchantments ??= {};
											if (value > 0) item.enchantments[enchantId] = value;
											else delete item.enchantments[enchantId];
										});
									}}
								/>
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<h3 class="text-lg font-semibold">Equipment Pieces</h3>
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
			{#each equipmentSlots as slot (slot)}
				{@const piece = equipment.find((e) => e.slot === slot)}
				{#if piece}
					{@const equipmentId = piece.item.skyblockId ?? ''}
					<div class="bg-muted/20 flex flex-col gap-3 rounded-lg border p-4">
						<div class="flex items-center gap-3">
							<ItemRender
								skyblockId={equipmentId}
								class="size-12 shrink-0 rounded-md border bg-black/20 p-1"
							/>
							<Label class="font-semibold">{slot === GearSlot.Gloves ? 'BRACELET' : slot.toUpperCase()}</Label>
						</div>

						<Select.Simple
							options={equipmentOptionsFor(slot)}
							value={piece.item.skyblockId ?? null}
							change={(v) => {
								if (!v) return;
								patchEquipment(slot, (item) => {
									item.skyblockId = v;
									item.name = FARMING_EQUIPMENT_INFO[v]?.name ?? v;
								});
							}}
						/>

						<Select.Simple
							options={getRarityOptionsFor(FARMING_EQUIPMENT_INFO[equipmentId]?.maxRarity ?? Rarity.Legendary)}
							value={piece.rarity}
							change={(v) => {
								if (!v) return;
								patchEquipment(slot, (item) => {
									item.lore = [v.toUpperCase()];
								});
							}}
						/>

						<Select.Simple
							options={equipmentReforgeOptions}
							value={piece.item.attributes?.modifier ?? null}
							change={(v) =>
								patchEquipment(slot, (item) => {
									item.attributes ??= {};
									item.attributes.modifier = v ?? null;
								})}
						/>
						<div class="grid grid-cols-2 gap-2">
							{#each equipmentReforgeStones as reforge (reforge.value)}
								<Button
									type="button"
									variant={piece.item.attributes?.modifier === reforge.value ? 'default' : 'outline'}
									class="h-auto flex-col gap-1 py-2"
									onclick={() =>
										patchEquipment(slot, (item) => {
											item.attributes ??= {};
											item.attributes.modifier = reforge.value;
										})}
								>
									<ItemRender skyblockId={reforge.stoneId} class="size-8 rounded-sm p-0" />
									<span class="text-[10px]">{reforge.stoneName}</span>
								</Button>
							{/each}
						</div>

						{#each commonEquipmentEnchants as enchantId (enchantId)}
							{@const enchant = FARMING_ENCHANTS[enchantId]}
							<div class="flex flex-col gap-1">
								<Label class="text-xs">{enchant.name} ({piece.item.enchantments?.[enchantId] ?? 0})</Label>
								<SliderSimple
									class="h-8"
									min={0}
									max={enchant.maxLevel}
									step={1}
									value={(piece.item.enchantments?.[enchantId] as number) ?? 0}
									onValueChange={(v) => {
										const value = Array.isArray(v) ? v[0] : v;
										if (value === undefined) return;
										patchEquipment(slot, (item) => {
											item.enchantments ??= {};
											if (value > 0) item.enchantments[enchantId] = value;
											else delete item.enchantments[enchantId];
										});
									}}
								/>
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>
