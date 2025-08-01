<script lang="ts">
	import type { components } from '$lib/api/api';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import { IsInViewport } from 'runed';
	import { onMount, tick } from 'svelte';
	import AnnouncementIcon from './announcement-icon.svelte';

	let targetNode = $state<HTMLElement>();
	const inViewport = new IsInViewport(() => targetNode);

	type Props = {
		announcement: components['schemas']['AnnouncementDto'];
	};

	let { announcement }: Props = $props();

	onMount(() => {
		tick().then(() => {
			targetNode = document.getElementById(`announcement-${announcement.id}`) ?? undefined;
		});
	});
</script>

{#if !inViewport.current && targetNode}
	<a
		class="bg-sidebar text-secondary-foreground group flex flex-row items-center justify-between border-b py-0.5"
		href="#announcement-{announcement.id}"
	>
		<span class="mx-2 truncate">
			<AnnouncementIcon {announcement} class="inline size-6 pb-1" />
			<span class="font-semibold md:text-lg">{announcement.title}</span>
		</span>
		<div class="mx-2 flex items-center">
			<ArrowUp class="size-5" />
		</div>
	</a>
{/if}
