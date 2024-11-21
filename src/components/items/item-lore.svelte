<script lang="ts">
	import { FormatMinecraftText } from '$lib/format';
	import type { EliteItemDto } from 'farming-weight';
	import Lore from './lore.svelte';

	interface Props {
		item: EliteItemDto;
		title?: boolean;
		children?: import('svelte').Snippet;
	}

	let { item, title = true, children }: Props = $props();
</script>

<div class="flex flex-col gap-2">
	{#if title}
		<h3 class="font-mono text-lg">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html FormatMinecraftText(item.name ?? '')}
		</h3>
	{/if}
	<Lore lore={item.lore?.slice() ?? []} />
	<div class="text-gray-400">
		{@render children?.()}
		<p>
			<span class="select-none font-semibold">UUID:</span>
			<span class="select-all">{item.uuid ?? 'N/A'}</span>
		</p>
		<p>
			<span class="select-none font-semibold">Skyblock ID:</span>
			<span class="select-all">{item.skyblockId}</span>
		</p>
		{#if item.attributes?.player}
			<p>
				<span class="select-none font-semibold">Player:</span>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<span>{@html FormatMinecraftText(item.attributes?.player ?? '')}</span>
			</p>
		{/if}
		{#if item.attributes?.bid}
			<p>
				<span class="select-none font-semibold">Bid:</span>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<span class="select-all">#{item.attributes.bid}</span>
			</p>
		{/if}
	</div>
</div>
