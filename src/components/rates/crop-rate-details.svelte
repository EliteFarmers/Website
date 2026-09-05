<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import ToolStat from '$comp/tools/tool-stat.svelte';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import * as Table from '$ui/table';
	import * as Tabs from '$ui/tabs';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CoinsBreakdown from './coins-breakdown.svelte';

	interface CropDetail {
		displayName: string;
		img?: string;
		fortune: number;
		collection: number;
		npcProfit: number;
		bazaarProfit: number | null;
		coinSources: [string, number][];
		otherCollection: [string, number][];
		bzOptions: { name: string; items: number; per: number; cost: number; profit: number; total: number }[];
		sellToBazaar: { itemId: string; name: string; items: number; npc: number; per: number; gain: number }[];
		otherCoinsTotal: number;
		otherCoinsNpcRemaining: number;
		sellToBazaarCoins: number;
		threeFourths: { total: number; specialDifference: number; amount: number; type: string };
	}

	let {
		detail,
		timeName,
		bzMode,
		bazaarStatus,
		onBack,
	}: {
		detail: CropDetail;
		timeName: string;
		bzMode: 'insta' | 'order';
		bazaarStatus: 'idle' | 'loading' | 'ready' | 'error';
		onBack: () => void;
	} = $props();
	const loadingPrices = $derived(bazaarStatus === 'idle' || bazaarStatus === 'loading');

	function number(value: number, digits = 0) {
		return value.toLocaleString('en-US', { maximumFractionDigits: digits });
	}
</script>

<Card.Root class="min-w-0 gap-5 rounded-md border-2 p-4 shadow-none sm:p-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			{#if detail.img}<img src={detail.img} alt="" class="pixelated size-8 shrink-0" />{/if}
			<div>
				<h2 class="text-xl">{detail.displayName} rates</h2>
				<p class="text-xs text-muted-foreground">{timeName} · 4/4 Helianthus Armor</p>
			</div>
		</div>
		<Button variant="ghost" size="sm" onclick={onBack}>
			<ArrowLeft class="size-4" aria-hidden="true" /> All crops
		</Button>
	</div>

	<dl class="grid grid-cols-2 gap-x-4 gap-y-5 border-y py-4 lg:grid-cols-4">
		<ToolStat label="NPC profit"><CoinsBreakdown coins={detail.npcProfit} /></ToolStat>
		<ToolStat label="Best Bazaar profit">
			{#if detail.bazaarProfit !== null}
				<CoinsBreakdown coins={detail.bazaarProfit} />
			{:else}<span class="text-sm text-muted-foreground">{loadingPrices ? 'Loading…' : 'Unavailable'}</span>{/if}
		</ToolStat>
		<ToolStat label="Farming fortune"><FortuneBreakdown total={detail.fortune} /></ToolStat>
		<ToolStat label="Collection" value={number(detail.collection)} />
	</dl>

	<Tabs.Root value="npc" class="min-w-0">
		<Tabs.List class="grid h-auto w-full grid-cols-3 sm:w-fit sm:min-w-80" aria-label="Crop breakdown">
			<Tabs.Trigger value="npc" class="min-h-9">NPC</Tabs.Trigger>
			<Tabs.Trigger value="bazaar" class="min-h-9">Bazaar</Tabs.Trigger>
			<Tabs.Trigger value="collection" class="min-h-9">Collection</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="npc" class="mt-4 space-y-4">
			<Table.Root>
				<Table.Header
					><Table.Row>
						<Table.Head>Income source</Table.Head><Table.Head class="text-right">Coins</Table.Head>
					</Table.Row></Table.Header
				>
				<Table.Body>
					{#each detail.coinSources as [source, amount] (source)}
						<Table.Row>
							<Table.Cell class="whitespace-normal">{source}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{number(amount)}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
			{#if detail.threeFourths.specialDifference !== 0}
				<div class="flex flex-wrap items-baseline justify-between gap-2 border-t pt-3 text-sm">
					<div class="space-y-1">
						<p>With 3/4 Helianthus Armor</p>
						<p class="text-xs text-muted-foreground">
							{number(Math.abs(detail.threeFourths.specialDifference))} fewer coins · about {number(
								detail.threeFourths.amount
							)}
							{detail.threeFourths.type}
						</p>
					</div>
					<p class="tabular-nums">{number(detail.threeFourths.total)} coins</p>
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="bazaar" class="mt-4 space-y-5">
			{#if loadingPrices}
				<p class="py-4 text-sm text-muted-foreground" role="status">Loading Bazaar prices…</p>
			{:else if bazaarStatus === 'error'}
				<p class="py-4 text-sm text-muted-foreground">
					Bazaar prices are unavailable. NPC estimates are still shown above.
				</p>
			{:else}
				<div class="space-y-3">
					<p class="text-sm text-muted-foreground">
						{bzMode === 'insta' ? 'Instant-sell' : 'Sell-order'} prices. Total profit includes {number(
							detail.otherCoinsTotal
						)} coins from other drops.
					</p>
					{#if detail.bzOptions.length > 0}
						<Table.Root>
							<Table.Header
								><Table.Row>
									<Table.Head>Sell as</Table.Head>
									<Table.Head class="hidden text-right sm:table-cell">Crop profit</Table.Head>
									<Table.Head class="text-right whitespace-normal">Total profit</Table.Head>
								</Table.Row></Table.Header
							>
							<Table.Body>
								{#each detail.bzOptions as option, i (option.name)}
									<Table.Row>
										<Table.Cell class="whitespace-normal">
											<p class="font-medium">
												{option.name}{#if i === 0}<span class="ml-2 text-xs text-progress"
														>Best</span
													>{/if}
											</p>
											<p class="text-xs text-muted-foreground">
												{number(option.items, 2)} × {number(option.per, 2)} coins
											</p>
											{#if option.cost > 0}<p class="text-xs text-muted-foreground">
													{number(option.cost)} coins in crafting costs
												</p>{/if}
										</Table.Cell>
										<Table.Cell class="hidden text-right tabular-nums sm:table-cell"
											>{number(option.profit)}</Table.Cell
										>
										<Table.Cell class="text-right tabular-nums">
											<p class="font-medium">{number(option.total)}</p>
											<p class="text-xs text-muted-foreground sm:hidden">
												{number(option.profit)} from crop
											</p>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}<p class="text-sm text-muted-foreground">
							No priced Bazaar crafts are available for this crop.
						</p>{/if}
				</div>

				{#if detail.sellToBazaar.length > 0}
					<div class="space-y-2">
						<h3 class="text-sm font-medium">Other drops worth selling to Bazaar</h3>
						<Table.Root>
							<Table.Header
								><Table.Row>
									<Table.Head>Item</Table.Head>
									<Table.Head class="text-right whitespace-normal">Bazaar coins</Table.Head>
									<Table.Head class="hidden text-right sm:table-cell">Extra vs NPC</Table.Head>
								</Table.Row></Table.Header
							>
							<Table.Body>
								{#each detail.sellToBazaar as item (item.itemId)}
									<Table.Row>
										<Table.Cell class="whitespace-normal">
											<p>{item.name}</p>
											<p class="text-xs text-muted-foreground">
												{number(item.items, 2)} × {number(item.per, 2)} coins · NPC {number(
													item.npc,
													2
												)} each
											</p>
										</Table.Cell>
										<Table.Cell class="text-right tabular-nums">
											{number(Math.floor(item.items * item.per))}
											<p class="text-xs text-progress sm:hidden">
												+{number(Math.floor(item.gain))} vs NPC
											</p>
										</Table.Cell>
										<Table.Cell class="hidden text-right text-progress tabular-nums sm:table-cell"
											>+{number(Math.floor(item.gain))}</Table.Cell
										>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}
				<p class="border-t pt-3 text-xs text-muted-foreground">
					Other drops: {number(detail.otherCoinsNpcRemaining)} coins to NPC · {number(
						detail.sellToBazaarCoins
					)} coins to Bazaar.
				</p>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="collection" class="mt-4">
			<Table.Root>
				<Table.Header
					><Table.Row
						><Table.Head>Collection source</Table.Head><Table.Head class="text-right">Amount</Table.Head
						></Table.Row
					></Table.Header
				>
				<Table.Body>
					{#each detail.otherCollection as [source, amount] (source)}
						<Table.Row
							><Table.Cell class="whitespace-normal">{source}</Table.Cell><Table.Cell
								class="text-right tabular-nums">{number(amount)}</Table.Cell
							></Table.Row
						>
					{/each}
				</Table.Body>
			</Table.Root>
		</Tabs.Content>
	</Tabs.Root>
</Card.Root>
