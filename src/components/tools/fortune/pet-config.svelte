<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import { Button } from '$ui/button';
	import { Label } from '$ui/label';
	import { SliderSimple } from '$ui/slider';
	import * as Select from '$ui/select';
	import {
		FARMING_PETS,
		FARMING_PET_ITEMS,
		FarmingPet,
		FarmingPets,
		PET_LEVELS,
		PET_RARITY_OFFSETS,
		Rarity,
	} from 'farming-weight';

	interface Props {
		pet: FarmingPet;
	}

	let { pet = $bindable() }: Props = $props();
	const rarityOrder = [
		Rarity.Common,
		Rarity.Uncommon,
		Rarity.Rare,
		Rarity.Epic,
		Rarity.Legendary,
		Rarity.Mythic,
	];

	const petOptions = Object.keys(FARMING_PETS).map((type) => ({
		value: type,
		label: FARMING_PETS[type as FarmingPets].name,
	}));

	function getRarityOptionsFor(maxRarity: Rarity) {
		const maxIndex = Math.max(0, rarityOrder.indexOf(maxRarity));
		const minIndex = Math.max(0, maxIndex - 1);
		return rarityOrder.slice(minIndex, maxIndex + 1).map((rarity) => ({
			value: rarity,
			label: rarity,
		}));
	}

	const rarityOptions = $derived.by(() => {
		const maxRarity = FARMING_PETS[pet.type]?.maxRarity ?? Rarity.Legendary;
		return getRarityOptionsFor(maxRarity);
	});

	const heldItemVisualOptions = [
		{ value: '', label: 'None' },
		{ value: 'YELLOW_BANDANA', label: FARMING_PET_ITEMS['YELLOW_BANDANA']?.name ?? 'Yellow Bandana' },
		{ value: 'GREEN_BANDANA', label: FARMING_PET_ITEMS['GREEN_BANDANA']?.name ?? 'Green Bandana' },
		{ value: 'BROWN_BANDANA', label: FARMING_PET_ITEMS['BROWN_BANDANA']?.name ?? 'Brown Bandana' },
	] as const;

	const maxLevel = $derived(FARMING_PETS[pet.type]?.maxLevel ?? 100);

	function getXpFromLevel(level: number, rarity: Rarity, limit: number) {
		const clampedLevel = Math.min(Math.max(1, Math.floor(level)), limit);
		const offset = PET_RARITY_OFFSETS[rarity] ?? 0;
		let xp = 0;
		for (let i = offset; i < offset + clampedLevel - 1; i++) {
			xp += PET_LEVELS[i] ?? 0;
		}
		return xp;
	}

	function updatePet() {
		// FarmingPet constructor handles the internal logic
		pet = new FarmingPet(pet.pet, pet.options);
	}

	function setHeldItem(itemId: string) {
		pet.pet.heldItem = itemId || undefined;
		updatePet();
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex items-center gap-4">
		<ItemRender skyblockId={pet.type} pet={true} class="size-14 shrink-0 rounded-md border bg-black/20 p-1" />
		<div>
			<h3 class="text-lg font-semibold">{pet.info.name}</h3>
			<p class="text-muted-foreground text-sm">Level {pet.level}</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
	<div class="flex flex-col gap-2">
		<Label>Pet Type</Label>
		<Select.Simple
			options={petOptions}
			value={pet.type}
			change={(v) => {
				if (v) {
					pet.pet.type = v as FarmingPets;
					const rarity = pet.rarity;
					const level = Math.min(pet.level, FARMING_PETS[v as FarmingPets]?.maxLevel ?? 100);
					pet.pet.exp = getXpFromLevel(level, rarity, FARMING_PETS[v as FarmingPets]?.maxLevel ?? 100);
					updatePet();
				}
			}}
		/>
	</div>

	<div class="flex flex-col gap-2">
		<Label>Rarity</Label>
		<Select.Simple
			options={rarityOptions}
			value={pet.rarity}
			change={(v) => {
				if (v) {
					pet.pet.tier = v.toUpperCase();
					pet.pet.exp = getXpFromLevel(pet.level, v as Rarity, maxLevel);
					updatePet();
				}
			}}
		/>
	</div>

	<div class="flex flex-col gap-2">
		<Label>Level (1-{maxLevel})</Label>
		<div class="flex items-center gap-3">
			<SliderSimple
				class="h-8 grow"
				min={1}
				max={maxLevel}
				step={1}
				value={pet.level}
				onValueChange={(v) => {
					const value = Array.isArray(v) ? v[0] : v;
					if (value) {
						pet.pet.exp = getXpFromLevel(value, pet.rarity, maxLevel);
						updatePet();
					}
				}}
			/>
			<span class="w-10 text-right text-sm font-semibold">{pet.level}</span>
		</div>
	</div>
</div>

	<div class="flex flex-col gap-3">
		<Label>Held Item</Label>
		<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
			{#each heldItemVisualOptions as itemOption (itemOption.value)}
				<Button
					type="button"
					variant={itemOption.value === (pet.pet.heldItem ?? '') ? 'default' : 'outline'}
					class="h-auto flex-col gap-2 py-3"
					onclick={() => setHeldItem(itemOption.value)}
				>
					{#if itemOption.value}
						<ItemRender skyblockId={itemOption.value} class="size-9 rounded-sm p-0" />
					{:else}
						<div class="bg-muted text-muted-foreground grid size-9 place-items-center rounded-sm text-xs font-semibold">
							None
						</div>
					{/if}
					<span class="text-center text-xs">{itemOption.label}</span>
				</Button>
			{/each}
		</div>
	</div>
</div>
