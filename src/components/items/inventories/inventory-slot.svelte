<script lang="ts">
	import type { ItemDto } from '$lib/api';
	import ItemIcon from '../item-icon.svelte';
	interface Props {
		item: ItemDto | null;
		inventoryId?: string;
		onSelect?: (item: ItemDto) => void;
		highlight?: boolean;
		subSlot?: string;
	}

	let { item, inventoryId = undefined, onSelect, highlight = false, subSlot = undefined }: Props = $props();

	let texture = $derived.by(() => {
		if (!item) return '';
		if (item.imageUrl) {
			return item.imageUrl;
		}

		if (inventoryId) {
			return `/api/texture/${inventoryId}/${subSlot ?? item?.slot}.webp${subSlot && item?.slot ? `?sub=${item.slot}` : ''}`;
		}

		if (item?.petInfo) {
			return `/api/pet/${item.petInfo.type}.webp`;
		}

		return `/api/item/${item?.skyblockId}.webp`;
	});

	let count = $derived.by(() => {
		let c = item?.count ?? 1;
		if (c != 1) return c;

		if (item?.attributes?.new_years_cake != undefined) {
			return +item.attributes.new_years_cake;
		}

		return c;
	});
</script>

{#if item}
	{#if onSelect}
		<button class="relative" onclick={() => onSelect?.(item)}>
			<ItemIcon url={texture} class={highlight ? 'border-link/50' : ''} />
			{#if count > 1}
				<span
					class="absolute right-0.5 bottom-0.5 rounded-md px-1 text-sm font-bold text-white text-shadow-lg/40"
					>{count}</span
				>
			{/if}
		</button>
	{:else}
		<div class="relative">
			<ItemIcon url={texture} class={highlight ? 'border-link/50' : ''} />
			{#if count > 1}
				<span
					class="absolute right-0.5 bottom-0.5 rounded-md px-1 text-sm font-bold text-white text-shadow-lg/40"
					>{count}</span
				>
			{/if}
		</div>
	{/if}
{:else}
	<div class="{highlight ? 'border-link/50' : ''} bg-card size-9 rounded-md border p-1 shadow-md sm:size-12"></div>
{/if}
