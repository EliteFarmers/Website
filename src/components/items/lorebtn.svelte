<script lang="ts">
	import type { EliteItemDto } from 'farming-weight';
	import { FormatMinecraftText } from '$lib/format';
	import { buttonVariants } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import FileText from 'lucide-svelte/icons/file-text';
	import ItemLore from './item-lore.svelte';

	export let item: EliteItemDto;
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost', class: 'px-2', size: 'sm' })}>
		<FileText size={20} />
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[90%] overflow-y-scroll">
		<Dialog.Header>
			<h3 class="font-mono text-xl">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html FormatMinecraftText(item.name ?? '')}
			</h3>
		</Dialog.Header>
		<ItemLore {item} title={false}>
			<slot />
		</ItemLore>
	</Dialog.Content>
</Dialog.Root>
