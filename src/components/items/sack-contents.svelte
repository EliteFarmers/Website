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
		<h2 class="flex w-full flex-row items-center-safe gap-2 text-left text-2xl font-semibold">Sack Items</h2>
		<ScrollArea class="h-80 rounded-md border">
			<div class="my-1 flex flex-col gap-1">
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
						<Popover.Mobile>
							{#snippet trigger()}
								<Item.Root variant="outline" class="rounded-none border-x-0 py-1">
									<Item.Media variant="image">
										<ItemRender skyblockId={itemId} class="pixelated size-8" />
									</Item.Media>
									<Item.Content class="min-w-0">
										<Item.Description
											class="flex flex-row flex-nowrap justify-between gap-4 whitespace-nowrap"
										>
											<p class="flex min-w-0 items-center-safe gap-2">
												<span class="truncate">
													<FormattedText
														text={value.name?.replace('Enchanted ', 'E. ') ?? itemId}
													/>
												</span>
												<span>x{toReadable(Number(amount))}</span>
											</p>
											<p class="flex items-center-safe gap-1 uppercase">
												{bestSellMethod}: {toReadable(
													Number(value[bestSellMethod as keyof typeof value] ?? 0) *
														Number(amount)
												)}
											</p>
										</Item.Description>
									</Item.Content>
								</Item.Root>
							{/snippet}
							<div class="flex max-w-md flex-col gap-2">
								{#each Object.entries(value).filter( ([key]) => sellMethods.includes(key as SellMethod) ) as [key, val] (key)}
									<p class="text-sm font-medium capitalize">
										{key}: {toReadable(Number(val) * Number(amount))}
									</p>
								{/each}
								<p class="mt-2 text-sm font-medium capitalize">
									Estimated Value: {toReadable((value.lowest ?? 0) * Number(amount))}
								</p>
							</div>
						</Popover.Mobile>
					{:catch error}
						<p>{itemId}: Error loading value: {error}</p>
					{/await}
				{/each}
			</div>
		</ScrollArea>
	</div>
</section>
