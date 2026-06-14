<script lang="ts">
	import RenderHtml from '$comp/markdown/render-html.svelte';
	import ModifierWrapper from './modifier-wrapper.svelte';

	const { text, mods, modifiers, index = 0, renderTextAsHtml = false } = $props();

	const currentMod = $derived(mods[index]);
	const Modifier = $derived(currentMod ? modifiers[currentMod] : null);
	const hasMore = $derived(index < mods.length - 1);
</script>

{#if Modifier}
	<Modifier>
		{#if hasMore}
			<ModifierWrapper {text} {mods} {modifiers} index={index + 1} {renderTextAsHtml} />
		{:else if renderTextAsHtml}
			<RenderHtml content={text} wrap={false} />
		{:else}
			{text}
		{/if}
	</Modifier>
{:else if renderTextAsHtml}
	<RenderHtml content={text} wrap={false} />
{:else}
	{text}
{/if}
