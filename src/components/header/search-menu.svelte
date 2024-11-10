<script lang="ts">
	import Laptop from 'lucide-svelte/icons/laptop';
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import * as Command from '$ui/command';
	import { Button } from '$ui/button';
	import cn from 'classnames';
	import { goto } from '$app/navigation';
	import { resetMode, setMode } from 'mode-watcher';
	import { browser } from '$app/environment';

	let open = false;

	$: searchStr = '';
	$: players = [] as string[];
	$: search(searchStr);

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
		open = false;
		cmd();
	}
</script>

<Button
	variant="outline"
	class={cn('relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64')}
	onclick={() => (open = true)}
	{...$$restProps}
>
	<span class="hidden lg:inline-flex"> Search For Player... </span>
	<span class="inline-flex lg:hidden">Search...</span>
</Button>
<Command.Dialog bind:open>
	<Command.Root shouldFilter={false}>
		<Command.Input placeholder="Search for a player" bind:value={searchStr} />
		<Command.List>
			<Command.Empty>No results found.</Command.Empty>
			<Command.Group heading="Players">
				{#if searchStr !== ''}
					<Command.Item value={searchStr ?? ''} onSelect={() => runCommand(() => goto(`/@${searchStr}`))}>
						{searchStr}
					</Command.Item>
				{/if}
				{#each players as player, i (i)}
					<Command.Item value={player ?? ''} onSelect={() => runCommand(() => goto(`/@${player}`))}>
						{player}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.List>
	</Command.Root>
</Command.Dialog>
