<script lang="ts">
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import Youtube from '@lucide/svelte/icons/youtube';
	import YoutubeIframe from '../youtube-iframe.svelte';

	let { node, selected }: SvelteNodeViewComponentProps = $props();

	let videoId = $derived(node.attrs.videoId as string);
</script>

<div
	class={`my-4 aspect-video w-full overflow-hidden rounded-lg border bg-black ${selected ? 'ring-primary ring-2' : ''}`}
>
	{#if videoId}
		<YoutubeIframe {videoId} />
	{:else}
		<div class="flex h-full items-center justify-center text-white">
			<Youtube class="mr-2 size-8" />
			<span>No video ID</span>
		</div>
	{/if}
</div>
