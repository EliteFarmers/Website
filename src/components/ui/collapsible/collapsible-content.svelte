<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from 'bits-ui';
	import { slide, type TransitionConfig } from 'svelte/transition';

	interface Props extends CollapsiblePrimitive.ContentProps {
		transition: typeof slide;
		transitionConfig: TransitionConfig;
	}

	let { transition: transit, transitionConfig, children, ...rest }: Props = $props();
</script>

<CollapsiblePrimitive.Content {...rest}>
	{#snippet child({ props })}
		<div {...props} transition:transit={transitionConfig}>
			{@render children?.()}
		</div>
	{/snippet}
</CollapsiblePrimitive.Content>
