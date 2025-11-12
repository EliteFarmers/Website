<script lang="ts">
	interface Props {
		content: unknown;
	}

	let { content }: Props = $props();
</script>

<svelte:head>
	<svelte:element this={'script'} type="application/ld+json">
		{JSON.stringify(content)}
	</svelte:element>
</svelte:head>
