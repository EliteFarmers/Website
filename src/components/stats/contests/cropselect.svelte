<script lang="ts">
	interface Props {
		src: string | undefined;
		alt: string;
		clicked?: boolean;
	}

	let { src, alt, clicked = $bindable(false) }: Props = $props();
</script>

<button onclick={() => (clicked = !clicked)} class="hover:bg-muted rounded-md p-2 {clicked ? 'bg-primary/15' : ''}">
	<img class="pixelated h-12 w-12" {src} {alt} title="Filter this crop" />
</button>
