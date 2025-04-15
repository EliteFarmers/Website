<script lang="ts" module>
	import Search from '@lucide/svelte/icons/search';
</script>

<script lang="ts">
	import * as Command from '$ui/command';
	import * as Tabs from '$ui/tabs';
	import { Button, type ButtonProps } from '$ui/button';
	import cn from 'classnames';
	import { browser } from '$app/environment';
	import { Debounced, watch } from 'runed';
	import { beforeNavigate, goto } from '$app/navigation';
	import { ScrollArea } from '$ui/scroll-area';

	let {
		open = $bindable(false),
		useButton = true,
		class: className,
		...rest
	}: ButtonProps & {
		open?: boolean;
		useButton?: boolean;
	} = $props();

	async function search(query: string) {
		if (!browser) return [];
		try {
			const results = await fetch(`/api/search?q=${query}`);
			const json = await results.json();

			players = (json ?? []) as string[];
		} catch (e) {
			console.error(e);
		}
	}

	function runCommand(cmd: () => void) {
		debounced.cancel();
		open = false;
		cmd();
	}

	let destination = $state('');
	let searchStr = $state('');
	const debounced = new Debounced(() => searchStr, 100);
	let players = $state([] as string[]);

	$effect(() => {
		search(debounced.current);
	});

	watch(
		() => open,
		() => {
			if (open) {
				searchStr = '';
				destination = '';
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
		<span class="hidden text-muted-foreground lg:inline-flex">Search For Player...</span>
		<span class="inline-flex text-muted-foreground lg:hidden">Search...</span>
	</Button>
{/if}
{#key open}
	<Command.Dialog bind:open>
		<Command.Root shouldFilter={false}>
			<Command.Input placeholder="Search for a player" bind:value={searchStr} />
			<Tabs.Root class="w-full" bind:value={destination}>
				<Tabs.List class="flex gap-2 rounded-none bg-inherit">
					<Tabs.Trigger value="" class="data-[state=active]:border-2">Stats</Tabs.Trigger>
					<Tabs.Trigger value="/garden" class="data-[state=active]:border-2">Garden</Tabs.Trigger>
					<Tabs.Trigger value="/rates" class="data-[state=active]:border-2">Rates</Tabs.Trigger>
					<Tabs.Trigger value="/contests" class="data-[state=active]:border-2">Contests</Tabs.Trigger>
					<Tabs.Trigger value="/charts" class="data-[state=active]:border-2">Charts</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
			<ScrollArea class="flex h-full max-h-[300px] flex-row">
				<Command.List class="max-h-none">
					<Command.Group heading="Players">
						{#if searchStr !== ''}
							<Command.Item
								value={searchStr ?? ''}
								onSelect={() => runCommand(() => goto(`/@${searchStr}${destination}`))}
							>
								{searchStr}
							</Command.Item>
						{/if}
						{#each players as player, i (i)}
							<Command.Item
								value={player ?? ''}
								onSelect={() => runCommand(() => goto(`/@${player}${destination}`))}
							>
								{player}
							</Command.Item>
						{:else}
							<Command.Empty>No players found.</Command.Empty>
						{/each}
					</Command.Group>
				</Command.List>
			</ScrollArea>
		</Command.Root>
	</Command.Dialog>
{/key}
