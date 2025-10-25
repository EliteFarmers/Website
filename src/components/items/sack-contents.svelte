<script lang="ts">
	import { getItemValue } from '$lib/remote/items.remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import ItemIcon from './item-icon.svelte';

	const ctx = getStatsContext();
	const sacks = $derived(
		Object.entries(ctx.member.current?.sacks ?? {}).sort(([, a], [, b]) => Number(b) - Number(a))
	);
</script>

{#each sacks as [itemId, amount] (itemId)}
	<div class="flex flex-row items-center gap-2">
		<div class="flex flex-row items-center">
			<ItemIcon url="/api/item/{itemId}.webp" class="pixelated" />
		</div>
		{#await getItemValue(itemId)}
			<p>Loading...</p>
		{:then value}
			<p>{itemId}: {amount} - Est Value: {(value.lowest ?? 0) * Number(amount)}</p>
		{:catch error}
			<p>{itemId}: Error loading value: {error}</p>
		{/await}
	</div>
{/each}
