<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { ScrollArea } from '$ui/scroll-area';
	import X from '@lucide/svelte/icons/x';
	import { Dialog as DialogPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';

	let {
		ref = $bindable(null),
		class: className,
		parentClass: parentClass,
		children,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		children: Snippet;
		parentClass?: string;
	} = $props();
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		class={cn(
			'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-hidden border shadow-lg duration-200 sm:rounded-lg',
			parentClass
		)}
		{...restProps}
	>
		<ScrollArea class={cn('flex h-full max-h-[90vh] flex-col p-6', className)}>
			{@render children?.()}
			<DialogPrimitive.Close
				class="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
			>
				<X class="size-4" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		</ScrollArea>
	</DialogPrimitive.Content>
</Dialog.Portal>
