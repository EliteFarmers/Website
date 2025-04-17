<script lang="ts">
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Check from '@lucide/svelte/icons/check';
	import * as Command from '$ui/command';
	import * as Popover from '$ui/popover';
	import { Button } from '$ui/button';
	import { cn } from '$lib/utils.js';
	import { Separator } from '$ui/separator';
	import { Badge } from '$ui/badge';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	type Props = {
		query: string;
		title: string;
		options: {
			label: string;
			value: string;
			// This should be `Component` after @lucide/svelte updates types
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon?: any;
		}[];
	};

	let { query, title, options }: Props = $props();

	let selectedValue = $derived(page.url.searchParams.get(query) ?? '');
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="h-8 border-dashed">
				<CirclePlus />
				{title}
				{#if selectedValue}
					<Separator orientation="vertical" class="mx-2 h-4" />
					<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
						{selectedValue.length}
					</Badge>
					<div class="hidden space-x-1 lg:flex">
						{#each options.filter((opt) => selectedValue === opt.value) as option (option)}
							<Badge variant="secondary" class="rounded-sm px-1 font-normal">
								{option.label}
							</Badge>
						{/each}
					</div>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0" align="start">
		<Command.Root>
			<!-- <Command.Input placeholder={title} /> -->
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group>
					{#each options as option (option)}
						{@const isSelected = selectedValue.includes(option.value)}
						<Command.Item
							onSelect={() => {
								if (isSelected) {
									selectedValue = '';
									const newQuery = new URLSearchParams(page.url.searchParams);
									newQuery.delete(query);
									goto(`${page.url.pathname}?${newQuery}`);
								} else {
									selectedValue = option.value;
									goto(
										`${page.url.pathname}?${new URLSearchParams({
											...Object.fromEntries(page.url.searchParams),
											[query]: option.value,
										})}`
									);
								}
							}}
						>
							<div
								class={cn(
									'mr-2 flex size-4 items-center justify-center rounded-full border border-primary',
									isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check class="mt-0.5 size-3" />
							</div>
							{#if option.icon}
								{@const Icon = option.icon}
								<Icon class="text-muted-foreground" />
							{/if}

							<span>{option.label}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
