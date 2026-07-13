<script lang="ts">
	import type { ItemDto } from '$lib/api';
	import { cn } from '$lib/utils';
	import ItemIcon from '../item-icon.svelte';

	interface Props {
		item: ItemDto | null;
		inventoryId?: string;
		onSelect?: (item: ItemDto) => void;
		highlight?: boolean;
		subSlot?: string;
		class?: string;
	}

	let {
		item,
		inventoryId = undefined,
		onSelect,
		highlight = false,
		subSlot = undefined,
		class: customClass = undefined,
	}: Props = $props();

	let texture = $derived.by(() => {
		if (!item) return '';
		if (item.imageUrl) {
			if (item.imageUrl.startsWith('/textures')) {
				return '/api' + item.imageUrl;
			}
			return item.imageUrl;
		}

		if (inventoryId) {
			return `/api/textures/${inventoryId}/${subSlot ?? item?.slot}.webp${subSlot && item?.slot ? `?sub=${item.slot}` : ''}`;
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
			<ItemIcon url={texture} class={cn(highlight ? 'border-link/50' : '', customClass)} />
			{#if count > 1}
				<span
					class="absolute right-0.5 bottom-0.5 rounded-md px-1 text-sm font-bold text-white text-shadow-lg/40"
					>{count}</span
				>
			{/if}
		</button>
	{:else}
		<div class="relative">
			<ItemIcon url={texture} class={cn(highlight ? 'border-link/50' : '', customClass)} />
			{#if count > 1}
				<span
					class="absolute right-0.5 bottom-0.5 rounded-md px-1 text-sm font-bold text-white text-shadow-lg/40"
					>{count}</span
				>
			{/if}
		</div>
	{/if}
{:else}
	<div
		class={cn(
			'bg-card size-9 rounded-md border p-1 shadow-md sm:size-12',
			highlight ? 'border-link/50' : '',
			customClass
		)}
	></div>
{/if}
