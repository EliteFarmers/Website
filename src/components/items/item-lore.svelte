<script lang="ts">
	import type { ItemDto } from '$lib/api';
	import type { EliteItemDto } from 'farming-weight';
	import FormattedText from './formatted-text.svelte';
	import Lore from './lore.svelte';

	interface Props {
		item: ItemDto | EliteItemDto;
		title?: boolean;
		children?: import('svelte').Snippet;
	}

	let { item, title = true, children }: Props = $props();
</script>

<div class="dark bg-background flex flex-col gap-2">
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
</div>
