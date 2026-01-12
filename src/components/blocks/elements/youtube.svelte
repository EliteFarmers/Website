<script lang="ts">
	import type { YouTubeBlockNode } from '$comp/blocks/blocks';
	import YoutubeIframe from '$comp/editor/youtube-iframe.svelte';

	interface Props {
		node: YouTubeBlockNode;
	}

	let { node }: Props = $props();
</script>

<div class="my-4 aspect-video w-full overflow-hidden rounded-lg">
	<YoutubeIframe videoId={node.videoId} />
</div>
