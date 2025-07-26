<script lang="ts">
	import type { components } from '$lib/api/api';
	import type { Snippet } from 'svelte';

	interface Props {
		element: components['schemas']['WeightStyleElementDto'] | null | undefined;
		children?: Snippet;
		class?: string;
	}

	let { element, children, class: className }: Props = $props();
</script>

<div
	class={className}
	style="color: {element?.fill ?? 'inherit'}; -webkit-text-stroke: 0.1rem {element?.outline?.fill ?? 'transparent'};"
>
	{@render children?.()}
</div>
