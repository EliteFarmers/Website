<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<main class="flex w-full flex-col items-center justify-center">
	{@render children?.()}
</main>
