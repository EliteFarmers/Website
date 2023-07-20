<script lang="ts">
	export let src: string | undefined;
	export let alt: string;
	export let clicked = false;
</script>

<button
	on:click={() => (clicked = !clicked)}
	class="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 {clicked ? 'bg-zinc-800' : ''}"
>
	<img class="w-12 h-12" {src} {alt} title={'Filter this crop'} />
</button>

<style lang="postcss">
	img {
		image-rendering: pixelated;
	}
</style>
