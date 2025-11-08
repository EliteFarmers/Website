<script lang="ts">
	import { page } from '$app/state';
	import AuctionItemGraph from '$comp/resources/auctions/auction-item-graph.svelte';
	import { getAuctionItem } from '$lib/remote';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const item = $derived(data.item.item);
	const itemData = getAuctionItem(page.params.itemId ?? '');
</script>

<main class="flex flex-col items-start gap-4">
	<h1 class="mt-16 text-2xl">{item?.name}</h1>
</main>

<pre>{JSON.stringify(item, null, 2)}</pre>

{#await itemData}
	<div>Loading item...</div>
{:then item}
	<AuctionItemGraph histories={item.history} />
	<pre>{JSON.stringify(item, null, 2)}</pre>
{:catch error}
	<div>Error loading item: {error.message}</div>
{/await}
