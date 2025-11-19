<script lang="ts">
	import { getActiveModifiers, type TextRendererProps } from './blocks';
	import ModifierWrapper from './modifier-wrapper.svelte';

	const { node, modifiers }: TextRendererProps = $props();

	const parts = $derived(node.text.split('\n'));
	const activeMods = $derived(getActiveModifiers(node));
</script>

{#each parts as part, i (`${part}-${i}`)}
	<ModifierWrapper text={part} mods={activeMods} {modifiers} />{#if i < parts.length - 1}<br />{/if}
{/each}
