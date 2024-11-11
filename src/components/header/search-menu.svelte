<script lang="ts">
	import * as Command from '$ui/command';
	import { Button } from '$ui/button';
	import cn from 'classnames';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	interface Props {
		[key: string]: any
	}

	let { ...rest }: Props = $props();

	let open = $state(false);

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

	let searchStr = $state('');
	let players = $state([] as string[]);
	
	$effect(() => {
		search(searchStr);
	});
</script>

<Button
	variant="outline"
	class={cn('relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64')}
	onclick={() => (open = true)}
	{...rest}
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
