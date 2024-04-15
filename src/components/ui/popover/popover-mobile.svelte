<script lang="ts">
	import { cn } from '$lib/utils';
	import { Root, Trigger, Content } from '$ui/popover';
	import type { Popover as PopoverPrimitive } from 'bits-ui';

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

	export let open = false;
	export let hasContent = true;
	export let rootClass = '';
	export let triggerClass = '';
	export let triggerRootClass = '';

	type $$Props = PopoverPrimitive.ContentProps & {
		hasContent?: boolean;
		open?: boolean;
		rootClass?: string;
		triggerClass?: string;
		triggerRootClass?: string;
	};
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Root bind:open closeOnOutsideClick={false}>
	<div on:mouseenter={mouseEnter} on:mouseleave={mouseLeave} role="contentinfo" class={triggerRootClass}>
		<Trigger class={triggerClass}>
			<slot name="trigger" />
		</Trigger>
	</div>
	{#if hasContent}
		<Content class={cn('p-2 min-w-fit', className)}>
			<div on:mouseenter={mouseEnter} on:mouseleave={mouseLeave} role="contentinfo" class={rootClass}>
				<slot />
			</div>
		</Content>
	{/if}
</Root>
