<script lang="ts">
	import FormattedText from './formatted-text.svelte';

	interface Props {
		name?: string | undefined;
		lore: string[];
	}

	let { name = undefined, lore }: Props = $props();

	let loreLines = $derived(name && lore.length > 1 ? [name, '', ...lore] : lore);
</script>

<div class="rounded-sm font-mono font-bold">
	<p>
		{#each loreLines as line, i (i)}
			<FormattedText text={line} />
			{#if i < loreLines.length - 1}
				<br />
			{/if}
		{/each}
	</p>
</div>
