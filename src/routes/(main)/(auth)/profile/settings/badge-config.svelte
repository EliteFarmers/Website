<script lang="ts">
	import type { UserBadgeDto } from '$lib/api';
	import { dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import BadgeItem from './badge-item.svelte';

	interface Props {
		badges: UserBadgeDto[];
	}

	let { badges }: Props = $props();

	let items = $derived(badges.filter((badge) => badge.visible));
	let hidden = $derived(badges.filter((badge) => !badge.visible));
	let choices = $derived<Record<number, boolean>>(
		Object.fromEntries(badges.map((badge) => [badge.id, !!badge.altImage && badge.useAltImage]))
	);

	function selectImage(id: number, useAltImage: boolean) {
		choices = { ...choices, [id]: useAltImage };
	}

	function handle(e: CustomEvent<DndEvent<UserBadgeDto>>) {
		items = e.detail.items;
	}

	function handleHidden(e: CustomEvent<DndEvent<UserBadgeDto>>) {
		hidden = e.detail.items;
	}
</script>

<div class="flex flex-col gap-2 rounded-lg border-2 p-4">
	<span class="text-lg">Visible Badges</span>
	<span class="text-sm leading-tight">The first badge in this list is what shows up in bot commands!</span>
	<div
		use:dragHandleZone={{ items }}
		onconsider={handle}
		onfinalize={handle}
		class="flex min-h-16 flex-col rounded-md border-2 border-dashed p-2"
	>
		{#each items as badge, i (badge.id ?? i)}
			<BadgeItem
				{badge}
				visible={true}
				order={i}
				useAltImage={choices[badge.id] ?? false}
				onselect={selectImage}
			/>
		{/each}
		{#if items.length === 0}
			<div class="flex flex-1 flex-col items-center justify-center">
				<span class="text-muted-foreground">No visible badges!</span>
				<span class="text-xs text-muted-foreground">Drag badges here to display them on your profile!</span>
			</div>
		{/if}
	</div>

	<span class="mt-2 block text-lg">Hidden Badges</span>
	<div
		use:dragHandleZone={{ items: hidden }}
		onconsider={handleHidden}
		onfinalize={handleHidden}
		class="flex min-h-16 flex-col rounded-md border-2 border-dashed p-2"
	>
		{#each hidden as badge, i (badge.id ?? i)}
			<BadgeItem
				{badge}
				visible={false}
				order={i + items.length}
				useAltImage={choices[badge.id] ?? false}
				onselect={selectImage}
			/>
		{/each}
		{#if hidden.length === 0}
			<div class="flex flex-1 flex-col items-center justify-center">
				<span class="text-muted-foreground">No hidden badges!</span>
				<span class="text-xs text-muted-foreground">Drag badges here to hide them from your profile!</span>
			</div>
		{/if}
	</div>
</div>
