<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import type { components } from '$lib/api/api';
	import { getRatesData } from '$lib/stores/ratesData';
	import type { RatesPlayerStore } from '$lib/stores/ratesPlayer.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Crop, type FortuneUpgrade } from 'farming-weight';

	const ratesData = getRatesData();
	const ctx = getStatsContext();
	const mode = $derived(ctx.selectedProfile?.gameMode);

	interface Props {
		player: RatesPlayerStore;
		crop: Crop;
	}

	let { player, crop }: Props = $props();

	async function getBazaarData(items: string[]) {
		const start = Date.now();
		const response = await fetch('/rates/' + items.join('|'));
		try {
			const jsonData = await response.json();
			if (Date.now() - start < 100) {
				// Delay a bit so it looks like something happened
				await new Promise((r) => setTimeout(r, 200));
			}

			return jsonData as Record<string, components['schemas']['BazaarProductSummaryDto']>;
		} catch {
			return undefined;
		}
	}

	const upgrades = $derived($player.getUpgrades(crop));

	let bzPromise = $derived<ReturnType<typeof getBazaarData> | undefined>(
		getBazaarData([
			...new Set(
				upgrades
					.map((up) => Object.keys(up.cost?.items ?? {}))
					.flat()
					.filter(Boolean)
					.flat()
			),
		])
	);

	async function bzItem(item: string) {
		const bz = await bzPromise;
		if (!bz || !bz[item]) return undefined;
		return bz[item];
	}
</script>

<div class="flex w-full flex-col gap-2">
	<h2 class="text-2xl font-bold">Cheapest Upgrades</h2>
	{#if !mode || mode !== 'classic'}
		<div class="flex flex-row items-center gap-2 text-sm">
			<TriangleAlert size={20} class="-mb-1 text-completed" />
			<p>These upgrades use bazaar prices which aren't available in this game mode.</p>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">These are the cheapest upgrades available for your gear!</p>
	{/if}
	<hr />
	{#each upgrades as up (up)}
		{@render upgrade(up)}
	{/each}
</div>

{#snippet upgrade(upgrade: FortuneUpgrade)}
	<div class="flex flex-col gap-4 rounded-md border bg-card px-4 py-2">
		<div class="flex flex-row items-center justify-between gap-4">
			<div class="flex flex-1 flex-col items-start justify-center">
				<p>{upgrade.title}</p>
				<p class="text-sm">{upgrade.action}</p>
			</div>
			{#each Object.entries(upgrade.cost?.items ?? {}) as [item, amount] (item)}
				<div class="flex flex-row items-center gap-2">
					<span class="text-sm">{amount}x</span>
					{#await bzItem(item) then bzItem}
						{#if bzItem?.name}
							<span class="text-sm">{bzItem?.name}</span>
						{:else}
							<!-- Replace underscores with spaces and capitalize first letter of each word -->
							{@const itemName = item
								.replace(/_/g, ' ')
								.toLowerCase()
								.split(' ')
								.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' ')}

							<span class="text-sm">{itemName}</span>
						{/if}

						<span class="text-sm text-muted-foreground"
							>({(bzItem?.averageBuyOrder ?? 0).toLocaleString()} coins)</span
						>
					{:catch}
						<span class="text-sm text-red-500">Error fetching price</span>
					{/await}
				</div>
			{/each}
			{#if upgrade.increase > 0}
				<FortuneBreakdown total={upgrade.increase} />
			{/if}
		</div>
		<!-- <pre>
{JSON.stringify(upgrade, null, 2)}
    </pre> -->
	</div>
{/snippet}
