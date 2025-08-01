<script lang="ts">
	import type { IsHover } from '$lib/hooks/is-hover.svelte';
	import { cn } from '$lib/utils';
	import { Content, Root, Trigger } from '$ui/popover';
	import { getContext } from 'svelte';

	let timeout: ReturnType<typeof setTimeout>;
	const isHover = getContext<IsHover>('isHover');

	function pointerEnter() {
		if (!isHover.current) return;
		open = true;
		mousePresent = true;
		clearTimeout(timeout);
	}

	let mousePresent = false;

	function pointerLeave() {
		if (!isHover.current) return;
		mousePresent = false;
		timeout = setTimeout(() => {
			if (!mousePresent) {
				open = false;
			}
		}, 75);
	}

	interface Props {
		open?: boolean;
		hasContent?: boolean;
		triggerClass?: string;
		class?: string;
		trigger?: import('svelte').Snippet;
		child?: import('svelte').Snippet<[{ props: Record<string, unknown> }]>;
		children?: import('svelte').Snippet;
	}

	let {
		open = $bindable(false),
		triggerClass = '',
		class: className = undefined,
		trigger,
		children,
		child: triggerChild,
		hasContent = true,
	}: Props = $props();
</script>

<Root bind:open>
	<div onpointerenter={pointerEnter} onpointerleave={pointerLeave} role="contentinfo" class="contents">
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
		{#if children?.length && hasContent}
			<Content class={cn('p-2', className)} interactOutsideBehavior={isHover.current ? 'ignore' : 'close'}>
				<div onpointerenter={pointerEnter} onpointerleave={pointerLeave} role="contentinfo" class="contents">
					{@render children?.()}
				</div>
			</Content>
		{/if}
	</div>
</Root>
