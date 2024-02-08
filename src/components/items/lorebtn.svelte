<script lang="ts">
	import type { EliteItemDto } from 'farming-weight';
	import { FormatMinecraftText } from '$lib/format';
	import { buttonVariants } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { FileText } from 'lucide-svelte/icons';
	import Lore from './lore.svelte';

	export let item: EliteItemDto;
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'ghost' })}>
		<FileText size={20} />
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[90%] overflow-y-scroll">
		<Dialog.Header>
			<h3 class="font-mono text-xl">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html FormatMinecraftText(item.name ?? '')}
			</h3>
		</Dialog.Header>
		<div>
			<Lore lore={item.lore?.slice() ?? []} />
			<div class="text-gray-400">
				<slot />
				<p>
					<span class="font-semibold select-none">UUID:</span>
					<span class="select-all">{item.uuid ?? 'N/A'}</span>
				</p>
				<p>
					<span class="font-semibold select-none">Skyblock ID:</span>
					<span class="select-all">{item.skyblockId}</span>
				</p>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
