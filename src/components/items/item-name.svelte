<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';

	interface Props {
		name?: string | null | undefined;
	}

	let { name = undefined }: Props = $props();

	let formatted = $derived(name ? FormatMinecraftText(name) : undefined);
</script>

{#if formatted}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<span>' + formatted + '</span>'}
{/if}
