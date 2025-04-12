<script lang="ts">
	import { cn } from '$lib/utils';
	import { Root, Trigger, Content } from '$ui/popover';

	let timeout: ReturnType<typeof setTimeout>;

	function mouseEnter() {
		open = true;
		mousePresent = true;
		clearTimeout(timeout);
	}

	let mousePresent = false;

	function mouseLeave() {
		mousePresent = false;
		timeout = setTimeout(() => {
			if (!mousePresent) {
				open = false;
			}
		}, 200);
	}

	interface Props {
		open?: boolean;
		hasContent?: boolean;
		rootClass?: string;
		triggerClass?: string;
		triggerRootClass?: string;
		class?: string;
		trigger?: import('svelte').Snippet;
		child?: import('svelte').Snippet<[{ props: Record<string, unknown> }]>;
		children?: import('svelte').Snippet;
	}

	let {
		open = $bindable(false),
		rootClass = '',
		triggerClass = '',
		triggerRootClass = '',
		class: className = undefined,
		trigger,
		children,
		child: triggerChild,
		hasContent = true,
	}: Props = $props();
</script>

<Root bind:open>
	<div onmouseenter={mouseEnter} onmouseleave={mouseLeave} role="contentinfo" class={triggerRootClass}>
		<Trigger class={triggerClass}>
			{#snippet child(data)}
				{#if triggerChild}
					{@render triggerChild?.(data)}
				{:else}
					<button {...data.props}>
						{@render trigger?.()}
					</button>
				{/if}
			{/snippet}
		</Trigger>
	</div>
	{#if children?.length && hasContent}
		<Content class={cn('p-2', className)} interactOutsideBehavior="ignore">
			<div onmouseenter={mouseEnter} onmouseleave={mouseLeave} role="contentinfo" class={rootClass}>
				{@render children?.()}
			</div>
		</Content>
	{/if}
</Root>
