<script lang="ts" module>
	import Search from '@lucide/svelte/icons/search';
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate, goto } from '$app/navigation';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { getLeaderboardList } from '$lib/remote';
	import { Button, type ButtonProps } from '$ui/button';
	import * as Command from '$ui/command';
	import { ScrollArea } from '$ui/scroll-area';
	import * as Tabs from '$ui/tabs';
	import cn from 'classnames';
	import { Debounced, watch } from 'runed';
	import { onMount } from 'svelte';

	let {
		open = $bindable(false),
		useButton = true,
		class: className,
		...rest
	}: ButtonProps & {
		open?: boolean;
		useButton?: boolean;
	} = $props();

	let leaderboards = $state<ReturnType<typeof getLeaderboardList> | null>(null);

	let lbEntries = $derived(
		Object.entries(leaderboards?.current?.leaderboards ?? {}).map(([id, { title, short, suffix }]) => ({
			id,
			name: (short ?? title) + suffix,
		}))
	);

	async function search(query: string) {
		if (!browser) return [];
		query = query.trim();

		try {
			const results = await fetch(`/api/search?q=${query}`);
			const json = await results.json();

			players = (json ?? []) as string[];
		} catch (e) {
			console.error(e);
		}

		if (query === '') {
			leaderboardList = lbEntries;
		} else {
			leaderboardList = lbEntries.filter((lb) => lb.name.toLowerCase().includes(query.toLowerCase()));
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
	let leaderboardList = $state([] as { name: string; id: string }[]);

	onMount(() => {
		leaderboards = getLeaderboardList();
	});

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
		<span class="text-muted-foreground hidden lg:inline-flex">Search For Player...</span>
		<span class="text-muted-foreground inline-flex lg:hidden">Search...</span>
	</Button>
{/if}

<Command.Dialog bind:open shouldFilter={false}>
	<Command.Input placeholder="Search for a player" bind:value={searchStr} />
	<Tabs.Root class="w-full" bind:value={destination}>
		<ScrollArea class="w-full py-1" orientation="horizontal">
			<Tabs.List class="flex w-full gap-2 rounded-none bg-inherit">
				<Tabs.Trigger value="" class="data-[state=active]:border-border border-2 border-transparent"
					>Stats</Tabs.Trigger
				>
				<Tabs.Trigger value="/garden" class="data-[state=active]:border-border border-2 border-transparent"
					>Garden</Tabs.Trigger
				>
				<Tabs.Trigger value="/fortune" class="data-[state=active]:border-border border-2 border-transparent"
					>Fortune</Tabs.Trigger
				>
				<Tabs.Trigger value="/contests" class="data-[state=active]:border-border border-2 border-transparent"
					>Contests</Tabs.Trigger
				>
				<Tabs.Trigger value="/charts" class="data-[state=active]:border-border border-2 border-transparent"
					>Charts</Tabs.Trigger
				>
			</Tabs.List>
		</ScrollArea>
	</Tabs.Root>
	<hr />
	<ScrollArea class="flex h-full max-h-[300px] flex-row">
		<Command.List class="max-h-none">
			<Command.Group heading="Players">
				{#if searchStr !== ''}
					<Command.Item
						value={searchStr ?? ''}
						onSelect={() => runCommand(() => goto(`/@${searchStr.trim()}${destination}`))}
					>
						{searchStr}
					</Command.Item>
				{/if}
				{#each players as player, i (i)}
					<Command.Item
						value={player ?? ''}
						onSelect={() => runCommand(() => goto(`/@${player}${destination}`))}
					>
						{@render listItem(player)}
					</Command.Item>
				{:else}
					{#if searchStr == ''}
						<p class="text-sm text-muted-foreground text-center">No players found.</p>
					{/if}
				{/each}
			</Command.Group>
			<Command.Group heading="Leaderboards">
				{#each leaderboardList as { name, id } (id)}
					<Command.Item value={name} onSelect={() => runCommand(() => goto(`/leaderboard/${id}`))}>
						{name}
					</Command.Item>
				{:else}
					<p class="text-sm text-muted-foreground text-center">No leaderboards found.</p>
				{/each}
			</Command.Group>
		</Command.List>
	</ScrollArea>
</Command.Dialog>

{#snippet listItem(ign: string)}
	<div class="flex flex-row items-center gap-2">
		<PlayerHead class="size-6 rounded-sm" uuid={ign} />
		{ign}
	</div>
{/snippet}
