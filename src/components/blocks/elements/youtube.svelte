<script lang="ts">
	import type { YouTubeBlockNode } from '$comp/blocks/blocks';

	interface Props {
		node: YouTubeBlockNode;
	}

	let { node }: Props = $props();
</script>

<div class="my-4 aspect-video w-full overflow-hidden rounded-lg">
	<iframe
		src="https://www.youtube-nocookie.com/embed/{node.videoId}"
		title="YouTube video player"
		class="h-full w-full"
		frameborder="0"
		referrerpolicy="strict-origin-when-cross-origin"
		allowfullscreen
	></iframe>
</div>
