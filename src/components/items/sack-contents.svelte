<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import * as Popover from '$comp/ui/popover';
	import { toReadable } from '$lib/format';
	import { getItemValue } from '$lib/remote/items.remote';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Item from '$ui/item';
	import { ScrollArea } from '$ui/scroll-area';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	const sellMethods = ['npc', 'ah', 'bazaar'] as const;
	type SellMethod = (typeof sellMethods)[number];

	const ctx = getStatsContext();
	const sacks = $derived(
		Object.entries(ctx.member.current?.sacks ?? {}).sort(([, a], [, b]) => Number(b) - Number(a))
	);
</script>

<section
	id="sacks"
	class="my-16 flex w-full flex-col items-center-safe justify-center-safe align-middle transition-transform duration-400"
>
	<div class="flex w-120 flex-col items-center-safe justify-between gap-2">
		<h2 class="w-full text-left text-2xl font-semibold">Sack Items</h2>
		<ScrollArea class="h-80 w-full rounded-md border">
			<div class="my-1 flex flex-col">
				{#each sacks as [itemId, amount] (itemId)}
					{#await getItemValue(itemId)}
						<LoaderCircleIcon class="size-4 animate-spin" />
					{:then value}
						{@const bestSellMethod = sellMethods.reduce(
							(prev, curr) =>
								(value[curr as keyof typeof value] ?? 0) > (value[prev as keyof typeof value] ?? 0)
									? curr
									: prev,
							'npc'
						)}

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
										<span>x{toReadable(Number(amount))}</span>
									</p>
									<Popover.Mobile>
										{#snippet trigger()}
											<p class="flex items-center-safe gap-1 uppercase">
												<span class="text-muted-foreground text-xs">{bestSellMethod}</span>
												<span class="text-completed">
													{toReadable(
														Number(value[bestSellMethod as keyof typeof value] ?? 0) *
															Number(amount)
													)}
												</span>
											</p>
										{/snippet}
										<div class="flex max-w-md flex-col gap-2">
											{#each Object.entries(value).filter( ([key]) => sellMethods.includes(key as SellMethod) ) as [key, val] (key)}
												{@const isBest = key === bestSellMethod}
												<p
													class="text-muted-foreground flex items-center gap-0.5 text-sm font-medium uppercase"
												>
													<span class="text-muted-foreground">
														{key}:
													</span>
													<span class="data-[best=true]:text-completed" data-best={isBest}>
														{toReadable(Number(val) * Number(amount))}
													</span>
												</p>
											{/each}
											<p class="mt-2 text-sm font-medium">
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
					{:catch error}
						<p>{itemId}: Error loading value: {error}</p>
					{/await}
				{/each}
			</div>
		</ScrollArea>
	</div>
</section>
