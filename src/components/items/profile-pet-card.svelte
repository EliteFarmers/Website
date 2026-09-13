<script lang="ts">
	import ItemRender from '$comp/items/item-render.svelte';
	import * as Item from '$ui/item';
	import * as Popover from '$ui/popover';
	import type { PetDto } from '$lib/api/schemas/PetDto';
	import type { FarmingPetType } from 'farming-weight';

	let {
		pet,
		petName,
		tier,
		heldItemName,
	}: {
		pet: PetDto & FarmingPetType;
		petName: string;
		tier: string;
		heldItemName: string;
	} = $props();
</script>

<Popover.Mobile class="max-w-sm p-3">
	{#snippet child({ props })}
		<Item.Root
			{...props}
			variant="outline"
			role="button"
			tabindex={0}
			class={`relative flex cursor-pointer flex-row items-center transition-colors hover:bg-zinc-500/5 ${pet.active ? 'border-completed' : ''}`}
		>
			<ItemRender skyblockId={pet.type} pet class="pixelated size-12" />
			<Item.Content>
				<Item.Title class="flex items-center gap-2 font-semibold">
					<span>{petName}</span>
					{#if pet.active}
						<span class="text-completed text-xs font-semibold uppercase">Active</span>
					{/if}
				</Item.Title>
				<Item.Description>
					Level {pet.level}
					{#if pet.heldItem}
						• {heldItemName}
					{/if}
				</Item.Description>
			</Item.Content>
		</Item.Root>
	{/snippet}

	<div class="flex flex-col gap-3">
		<div class="flex items-center gap-3">
			<ItemRender skyblockId={pet.type} pet class="pixelated size-14" />
			<div class="min-w-0">
				<div class="flex flex-wrap items-center gap-2">
					<p class="font-semibold">{petName}</p>
					{#if pet.active}
						<span class="text-completed text-xs font-semibold uppercase">Active Pet</span>
					{/if}
				</div>
				<p class="text-muted-foreground text-sm">{tier} • Level {pet.level}</p>
			</div>
		</div>
		<div class="text-muted-foreground flex flex-col gap-1 text-sm">
			<p>Held Item: <span class="text-foreground font-medium">{heldItemName}</span></p>
			{#if (pet.candyUsed ?? 0) > 0}
				<p>Candy Used: <span class="text-foreground font-medium">{pet.candyUsed}</span></p>
			{/if}
			<p>
				Experience:
				<span class="text-foreground font-medium">
					{(pet.exp ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
				</span>
			</p>
			{#if pet.skin}
				<p>Skin: <span class="text-foreground font-medium">{pet.skin}</span></p>
			{/if}
		</div>
	</div>
</Popover.Mobile>
