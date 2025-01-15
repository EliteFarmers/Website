<script lang="ts">
	import type { components } from '$lib/api/api';
	import { dragHandle } from 'svelte-dnd-action';
	import GripHorizontal from 'lucide-svelte/icons/grip-horizontal';

	interface Props {
		badge: components['schemas']['UserBadgeDto'];
		visible: boolean;
		order: number;
	}

	let { badge, visible, order }: Props = $props();

	const id = $derived(badge.id);
</script>

<div class="flex flex-row items-center gap-4 p-2">
	<input type="hidden" name="badge.{id}" value={id} />
	<input type="hidden" name="badge.{id}.visible" value={visible ? 'true' : 'false'} />
	<input type="hidden" name="badge.{id}.order" value={order} />
	<div use:dragHandle class="cursor-move rounded-md p-2 pl-2">
		<GripHorizontal size={16} />
	</div>
	{#if badge.image?.url}
		<img src={badge.image.url} alt={badge.name} class="w-18 h-6 rounded-sm object-cover md:h-8 md:w-24" />
	{/if}
	<div class="flex max-w-md flex-1 flex-col gap-1">
		<p class="text-lg">{badge.name}</p>
	</div>
</div>
