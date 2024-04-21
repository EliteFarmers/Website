<script lang="ts">
	export let src: string | undefined;
	export let alt: string;
	export let clicked = false;
</script>

<button on:click={() => (clicked = !clicked)} class="rounded-md p-2 hover:bg-muted {clicked ? 'bg-primary/15' : ''}">
	<img class="w-12 h-12 pixelated" {src} {alt} title={'Filter this crop'} />
</button>
