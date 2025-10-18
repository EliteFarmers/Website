<script lang="ts">
	import FormattedText from './formatted-text.svelte';

	interface Props {
		name?: string | null | undefined;
	}

	let { name = undefined }: Props = $props();
</script>

{#if name}
	<FormattedText text={name} />
{/if}
