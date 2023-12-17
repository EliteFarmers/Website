<script lang="ts">
	export let text: string;

	// Split by \n or \r\n
	$: lines = text.split('\n');
</script>

{#each lines as line, i (line)}
	{line}
	{#if i !== lines.length - 1}
		<br />
	{/if}
{/each}
