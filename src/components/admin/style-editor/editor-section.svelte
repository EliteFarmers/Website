<script lang="ts">
	import * as Collapsible from '$ui/collapsible';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		open?: boolean;
		children: Snippet;
	}

	let { title, open = $bindable(false), children }: Props = $props();
</script>

<Collapsible.Root bind:open class="border-md rounded-md border">
	<Collapsible.Trigger class="hover:bg-muted flex h-7 w-full flex-row items-center gap-1 rounded px-1 py-0.5">
		<ChevronRight
			size={14}
			class="text-muted-foreground shrink-0 transition-transform duration-150 {open ? 'rotate-90' : ''}"
		/>
		<span class="text-sm font-medium first-letter:capitalize">{title}</span>
	</Collapsible.Trigger>
	<Collapsible.Content>
		<div class="border-muted ml-2 flex flex-col gap-2 border-l py-1 pl-3">
			{@render children()}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
