<script lang="ts">
	let { videoId }: { videoId: string } = $props();

	let iframe: HTMLIFrameElement | null = $state(null);
</script>

<iframe
	src="https://www.youtube-nocookie.com/embed/{videoId}"
	title="YouTube video player"
	class="h-full w-full"
	frameborder="0"
	referrerpolicy="strict-origin-when-cross-origin"
	allowfullscreen
	bind:this={iframe}
></iframe>
