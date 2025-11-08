<script lang="ts" module>
	import Search from '@lucide/svelte/icons/search';
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate, goto } from '$app/navigation';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { AuctionItemSearchResult } from '$lib/api';
	import { searchItems } from '$lib/remote/items.remote';
	import { Button, type ButtonProps } from '$ui/button';
	import * as Command from '$ui/command';
	import { ScrollArea } from '$ui/scroll-area';
	import cn from 'classnames';
	import { Debounced, watch } from 'runed';

	let {
		open = $bindable(false),
		useButton = true,
		class: className,
		search: searchStr = $bindable(''),
		cmd: command = (skyblockId: string) => goto(`/auctions/${skyblockId}`),
		...rest
	}: ButtonProps & {
		open?: boolean;
		useButton?: boolean;
		search?: string;
		cmd?: (player: string) => Promise<void> | void;
	} = $props();

	async function search(query: string) {
		if (!browser) return [];
		try {
			const itemsResponse = await searchItems(query);
			items = itemsResponse;
			return itemsResponse;
		} catch (e) {
			console.error(e);
		}
	}

	function runCommand(cmd: () => void) {
		debounced.cancel();
		open = false;
		cmd();
	}

	const debounced = new Debounced(() => search(searchStr), 100);
	let items = $state([] as AuctionItemSearchResult[]);

	watch(
		() => open,
		() => {
			if (open) {
				searchStr = '';
				search('');
			}
		}
	);

	beforeNavigate(() => {
		debounced.cancel();
	});
</script>

{#if useButton}
	<Button
		variant="outline"
		class={cn('relative flex w-full justify-start px-3 text-sm sm:pr-12 md:w-40 lg:w-64', className)}
		onclick={() => (open = true)}
		{...rest}
	>
		<Search />
		<span class="text-muted-foreground hidden lg:inline-flex">Search For Item...</span>
		<span class="text-muted-foreground inline-flex lg:hidden">Search...</span>
	</Button>
{/if}

<Command.Dialog bind:open>
	<Command.Root shouldFilter={false}>
		<Command.Input placeholder="Search for an item" bind:value={searchStr} />
		<ScrollArea class="flex h-full max-h-[300px] flex-row">
			<Command.List class="max-h-none">
				<Command.Group heading="Items">
					{#each items as item, i (i)}
						{@const id =
							item.skyblockId === 'PET'
								? (item.variantKey?.replace('bundle:pet:', '') ?? item.skyblockId)
								: item.skyblockId}
						<Command.Item
							value={item.variantKey ?? item.skyblockId}
							onSelect={() =>
								runCommand(() => {
									searchStr = item.variantKey ?? item.skyblockId;
									command(item.variantKey ?? item.skyblockId);
								})}
						>
							<div class="flex flex-row items-center justify-between gap-1">
								<div class="flex flex-row items-center gap-1">
									<ItemRender
										skyblockId={id}
										class="bg-card size-8 rounded-sm border"
										pet={item.skyblockId === 'PET'}
									/>
									{#if item.name}
										{item.name}
									{:else}
										{item.skyblockId.replaceAll('_', ' ')}
									{/if}
								</div>
							</div>
						</Command.Item>
					{:else}
						{#if searchStr == ''}
							<p class="text-sm text-muted-foreground text-center mb-4">No items found.</p>
						{/if}
					{/each}
				</Command.Group>
			</Command.List>
		</ScrollArea>
	</Command.Root>
</Command.Dialog>
