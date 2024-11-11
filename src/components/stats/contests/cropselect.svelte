<script lang="ts">
	interface Props {
		src: string | undefined;
		alt: string;
		clicked?: boolean;
	}

	let { src, alt, clicked = $bindable(false) }: Props = $props();
</script>

<button onclick={() => (clicked = !clicked)} class="rounded-md p-2 hover:bg-muted {clicked ? 'bg-primary/15' : ''}">
	<img class="w-12 h-12 pixelated" {src} {alt} title={'Filter this crop'} />
</button>
