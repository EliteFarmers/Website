<script lang="ts">
	import type { InventoryItemMetaResponseNetworth, ItemDto } from '$lib/api';
	import Bug from '@lucide/svelte/icons/bug';
	import type { EliteItemDto } from 'farming-weight';
	import FormattedText from './formatted-text.svelte';
	import Lore from './lore.svelte';

	interface Props {
		item: ItemDto | EliteItemDto;
		title?: boolean;
		networth?: InventoryItemMetaResponseNetworth | null;
		children?: import('svelte').Snippet;
	}

	let { item, title = true, networth = null, children }: Props = $props();

	let showDebugInfo = $state(false);
</script>

<div class="dark bg-background relative flex flex-col gap-2 rounded-md p-2">
	{#if title}
		<span class="font-mono text-lg">
			<FormattedText text={item.name ?? 'Unknown Item'} />
		</span>
	{/if}
	<Lore lore={item.lore?.slice() ?? []} />
	<div class="text-muted-foreground">
		{@render children?.()}
		<p>
			<span class="font-semibold select-none">UUID:</span>
			<span class="select-all">{item.uuid ?? 'N/A'}</span>
		</p>
		<p>
			<span class="font-semibold select-none">Skyblock ID:</span>
			<span class="select-all">{item.skyblockId}</span>
		</p>
		{#if item.attributes?.player}
			<p>
				<span class="font-semibold select-none">Player:</span>
				<FormattedText text={item.attributes?.player.toString() ?? ''} />
			</p>
		{/if}
		{#if item.attributes?.bid}
			<p>
				<span class="font-semibold select-none">Bid:</span>
				<span class="select-all">#{item.attributes.bid}</span>
			</p>
		{/if}
	</div>
	<button
		class="text-muted-foreground hover:text-destructive absolute right-2 bottom-2 flex items-center gap-1 text-sm"
		onclick={() => (showDebugInfo = !showDebugInfo)}
	>
		<Bug class="size-4" />
	</button>
	{#if showDebugInfo}
		<div class="bg-card text-primary mt-2 rounded-md p-2 text-sm">
			<pre class="break-all whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
		</div>
		{#if networth}
			<div class="bg-card text-primary mt-2 rounded-md p-2 text-sm">
				<pre class="break-all whitespace-pre-wrap">{JSON.stringify(networth, null, 2)}</pre>
			</div>
		{/if}
	{/if}
</div>
