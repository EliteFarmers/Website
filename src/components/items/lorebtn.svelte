<script lang="ts">
	import { buttonVariants } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import FileText from '@lucide/svelte/icons/file-text';
	import type { EliteItemDto } from 'farming-weight';
	import ItemLore from './item-lore.svelte';

	interface Props {
		item: EliteItemDto;
		children?: import('svelte').Snippet;
	}

	let { item, children }: Props = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost', class: 'px-2', size: 'sm' })}>
		<FileText size={20} />
	</Dialog.Trigger>
	<Dialog.ScrollContent class="dark bg-background border-border text-primary">
		<ItemLore {item}>
			{@render children?.()}
		</ItemLore>
	</Dialog.ScrollContent>
</Dialog.Root>
