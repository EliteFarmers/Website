<script lang="ts">
	import { Laptop, Loader, Moon, Sun } from 'lucide-svelte';
	import * as Command from '$ui/command';
	import { Button } from '$ui/button';
	import cn from 'classnames';
	import { goto } from '$app/navigation';
	import { resetMode, setMode } from 'mode-watcher';
	import { browser } from '$app/environment';

	let open = false;
	$: searchStr = '';
	$: result = search(searchStr);

	function runCommand(cmd: () => void) {
		open = false;
		cmd();
	}

	async function search(query: string) {
		if (!browser) {
			return [];
		}

		const players = await fetch('https://api.elitebot.dev/account/search?q=' + query).then((res) => res.json());

		if (!Array.isArray(players)) {
			return [];
		}

		return [query, ...players.slice(0, 10)];
	}
</script>

<Button
	variant="outline"
	class={cn('relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64')}
	on:click={() => (open = true)}
	{...$$restProps}
>
	<span class="hidden lg:inline-flex"> Search For Player... </span>
	<span class="inline-flex lg:hidden">Search...</span>
</Button>
<Command.Dialog bind:open>
	<Command.Input placeholder="Type a command or search" bind:value={searchStr} />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Players">
			{#await result}
				<Loader class="w-6 h-6" />
			{:then players}
				{#each players as player, i (i)}
					<Command.Item value={player ?? ''} onSelect={() => runCommand(() => goto(`/@${player}`))}>
						{player}
					</Command.Item>
				{/each}
			{:catch error}
				<Command.Item value="error">
					{error}
				</Command.Item>
			{/await}
		</Command.Group>
		<Command.Group heading="Theme">
			<Command.Item value="light" onSelect={() => runCommand(() => setMode('light'))}>
				<Sun class="mr-2 h-4 w-4" />
				Light
			</Command.Item>
			<Command.Item value="dark" onSelect={() => runCommand(() => setMode('dark'))}>
				<Moon class="mr-2 h-4 w-4" />
				Dark
			</Command.Item>
			<Command.Item value="system" onSelect={() => runCommand(() => resetMode())}>
				<Laptop class="mr-2 h-4 w-4" />
				System
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
