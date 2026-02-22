<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import CoinsBreakdown from '$comp/rates/coins-breakdown.svelte';
	import * as Popover from '$comp/ui/popover';
	import { toReadable } from '$lib/format';
	import { getItemValues } from '$lib/remote/items.remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Item from '$ui/item';
	import { ScrollArea } from '$ui/scroll-area';

	const sellMethods = ['npc', 'ah', 'bazaar'] as const;
	type SellMethod = (typeof sellMethods)[number];

	const ctx = getStatsContext();
	const itemValues = $derived(getItemValues(Object.keys(ctx.member.current?.sacks ?? {}).map((itemId) => itemId)));

	function getHighest(itemId: string) {
		const value = itemValues.current?.get(itemId);
		if (!value) return { method: 'unknown', price: 0 };

		let bestMethod: SellMethod = 'npc';
		let bestPrice = value.npc;

		for (const method of sellMethods) {
			const methodPrice = value[method];
			if (methodPrice > bestPrice) {
				bestMethod = method;
				bestPrice = methodPrice;
			}
		}

		return { method: bestMethod, price: bestPrice };
	}

	const sacks = $derived(
		Object.entries(ctx.member.current?.sacks ?? {}).sort(([a, aC], [b, bC]) => {
			const aValue = getHighest(a).price * Number(aC);
			const bValue = getHighest(b).price * Number(bC);
			if (aValue === bValue) {
				if (aC === bC) return a.localeCompare(b);
				return Number(bC) - Number(aC);
			}
			return bValue - aValue;
		})
	);

	const totalValue = $derived.by(() => {
		const breakdown = {} as Record<string, number>;
		let length = 0;
		const valueSum = sacks
			.map(([itemId, amount]) => {
				const value = itemValues.current?.get(itemId);
				if (!value) return 0;
				const bestPrice = getHighest(itemId).price;
				if (isNaN(bestPrice)) return 0;
				const total = bestPrice * Number(amount);
				if (length < 5) {
					breakdown[value.name ?? itemId] = total;
					length++;
				} else {
					breakdown['Other Items'] = (breakdown['Other Items'] ?? 0) + total;
				}
				return total;
			})
			.reduce((acc, val) => acc + val, 0);

		return { total: valueSum, breakdown };
	});
</script>

<section
	id="sacks"
	class="my-16 flex w-full flex-col items-center-safe justify-center-safe align-middle transition-transform duration-400"
>
	<div class="flex w-full max-w-120 flex-col items-center-safe justify-between gap-2">
		<div class="flex w-full flex-row justify-between">
			<h2 class="w-full text-left text-2xl font-semibold">Sack Items</h2>
			<CoinsBreakdown
				breakdown={totalValue.breakdown}
				small
				coins={totalValue.total}
				title="Sack Value Breakdown"
				class="h-6"
			/>
		</div>

		<ScrollArea class="flex max-h-80 min-h-0 w-full flex-col rounded-md border">
			<div class="my-1 flex min-h-0 flex-col">
				{#each sacks as [itemId, amount] (itemId)}
					{@const value = itemValues.current?.get(itemId)}

					{#if !value}
						<div
							class="flex flex-row items-center gap-1 rounded-none px-2 first:border-t-0 last:border-b-0 even:border-y"
						>
							<Item.Media variant="image" class="size-8">
								<ItemRender skyblockId={itemId} class="pixelated" />
							</Item.Media>
							<Item.Content class="min-w-0">
								<Item.Description
									class="flex flex-row flex-nowrap justify-between gap-4 whitespace-nowrap"
								>
									<p class="flex min-w-0 items-center-safe gap-2">
										<span class="text-primary truncate">
											<FormattedText text={itemId} />
										</span>
										<span>x{toReadable(Number(amount))}</span>
									</p>
									<p class="flex items-center-safe gap-1 uppercase">
										<span class="text-muted-foreground text-xs">N/A</span>
									</p>
								</Item.Description>
							</Item.Content>
						</div>
					{:else}
						{@const { method: bestSellMethod, price: bestPrice } = getHighest(itemId)}

						<div
							class="flex flex-row items-center gap-1 rounded-none px-2 first:border-t-0 last:border-b-0 even:border-y"
						>
							<Item.Media variant="image" class="size-8">
								<ItemRender skyblockId={itemId} class="pixelated" />
							</Item.Media>
							<Item.Content class="min-w-0">
								<Item.Description
									class="flex flex-row flex-nowrap justify-between gap-4 whitespace-nowrap"
								>
									<p class="flex min-w-0 items-center-safe gap-2">
										<span class="text-primary truncate">
											<FormattedText text={value.name?.replace('Enchanted ', 'E. ') ?? itemId} />
										</span>
										<span>x{toReadable(Number(amount), navigator.language, 2)}</span>
									</p>
									<Popover.Mobile>
										{#snippet trigger()}
											<p class="flex items-center-safe gap-1 uppercase">
												<span class="text-muted-foreground text-xs">{bestSellMethod}</span>
												<span class="text-completed">
													{toReadable(Number(bestPrice) * Number(amount))}
												</span>
											</p>
										{/snippet}
										<div class="flex max-w-md flex-col gap-2">
											<div class="mb-2 flex flex-col gap-1 border-b pb-2">
												<p class="text-sm font-medium">
													<span class="text-muted-foreground">Item Price: </span>
													<span class="text-completed">{toReadable(Number(bestPrice))}</span>
												</p>
												<p class="text-sm font-medium">
													<span class="text-muted-foreground">Quantity: </span>
													<span>{amount.toLocaleString()}</span>
												</p>
											</div>
											{#each Object.entries(value).filter( ([key]) => sellMethods.includes(key as SellMethod) ) as [key, val] (key)}
												{@const isBest = key === bestSellMethod}
												{#if isBest || Number(val) > 0}
													<div>
														<p
															class="text-muted-foreground flex items-center gap-0.5 text-sm font-medium uppercase"
														>
															<span class="text-muted-foreground">
																{key}:
															</span>
															<span
																class="data-[best=true]:text-completed text-primary"
																data-best={isBest}
															>
																{toReadable(Number(val))}
															</span>
														</p>
														<p class="text-muted-foreground/80 ml-4 text-xs">
															{toReadable(Number(val) * Number(amount))} total
														</p>
													</div>
												{/if}
											{/each}
											<p class="mt-2 border-t pt-2 text-sm font-medium">
												<span class="text-muted-foreground"> Estimated Value: </span>
												<span class="text-completed">
													{toReadable((value.lowest ?? 0) * Number(amount))}
												</span>
											</p>
										</div>
									</Popover.Mobile>
								</Item.Description>
							</Item.Content>
						</div>
					{/if}
				{/each}
				{#if sacks.length === 0}
					<div class="flex flex-col items-center-safe gap-2 p-4">
						<p class="text-muted-foreground">No sack items found.</p>
					</div>
				{/if}
			</div>
		</ScrollArea>
	</div>
</section>
