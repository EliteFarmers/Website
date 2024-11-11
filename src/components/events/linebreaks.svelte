<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();

	// Split by \n or \r\n
	let lines = $derived(text.split('\n'));
</script>

{#each lines as line, i (line + i)}
	{line}
	{#if i !== lines.length - 1}
		<br />
	{/if}
{/each}
