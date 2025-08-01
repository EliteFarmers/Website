<script lang="ts">
	import type { components } from '$lib/api/api';
	import type { Snippet } from 'svelte';

	interface Props {
		element: components['schemas']['WeightStyleElementDto'] | null | undefined;
		color?: string;
		children?: Snippet;
		class?: string;
	}

	let { element, children, class: className, color }: Props = $props();

	let outlineColor = $derived(element?.outline ? (element.outline.fill ?? '#000000') : 'transparent');
</script>

{#if color}
	<span class={className} style="color: {color ?? 'inherit'};">
		{@render children?.()}
	</span>
{:else}
	<span class={className} style="color: {element?.fill ?? 'inherit'}; -webkit-text-stroke: 0.1rem {outlineColor};">
		{@render children?.()}
	</span>
{/if}
