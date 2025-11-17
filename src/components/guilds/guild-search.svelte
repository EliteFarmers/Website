<script lang="ts">
	import { goto } from '$app/navigation';
	import GuildTag from '$comp/guilds/guild-tag.svelte';
	import type { HypixelGuildSearchResultDto } from '$lib/api';
	import { searchGuilds } from '$lib/remote/guilds.remote';
	import { Button } from '$ui/button';
	import * as Command from '$ui/command';
	import * as Popover from '$ui/popover';
	import { ScrollArea } from '$ui/scroll-area';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Search from '@lucide/svelte/icons/search';
	import { onDestroy, tick } from 'svelte';

	const SEARCH_LIMIT = 8;

	let open = $state(false);
	let query = $state('');
	let results = $state<HypixelGuildSearchResultDto[]>([]);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let activeRequest = 0;
	let debounceRef: ReturnType<typeof setTimeout> | undefined;
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);

	const trimmedQuery = $derived.by(() => query.trim());

	function cancelDebounce() {
		if (debounceRef) {
			clearTimeout(debounceRef);
			debounceRef = undefined;
		}
	}

	function resetState() {
		cancelDebounce();
		activeRequest++;
		results = [];
		errorMessage = null;
		isLoading = false;
		query = '';
	}

	function handleInput(value: string) {
		cancelDebounce();

		if (!value.trim()) {
			resetState();
			return;
		}

		debounceRef = setTimeout(() => {
			fetchResults(value);
		}, 200);
	}

	async function fetchResults(value: string) {
		const trimmed = value.trim();
		if (!trimmed) {
			return;
		}

		const requestId = ++activeRequest;
		isLoading = true;
		errorMessage = null;

		try {
			const next = await searchGuilds({ query: trimmed, limit: SEARCH_LIMIT });

			if (requestId === activeRequest) {
				results = next;
			}
		} catch (error) {
			console.error('Failed to search guilds', error);
			if (requestId === activeRequest) {
				errorMessage = 'Unable to search guilds right now.';
				results = [];
			}
		} finally {
			if (requestId === activeRequest) {
				isLoading = false;
			}
		}
	}

	async function handleSelect(guild: HypixelGuildSearchResultDto) {
		open = false;
		await goto(`/guilds/${guild.id}`);
	}

	async function handleOpenChange(next: boolean) {
		if (next) {
			await tick();
			inputRef?.focus();
			return;
		}

		resetState();
		await tick();
		triggerRef?.focus();
	}

	onDestroy(() => {
		cancelDebounce();
	});
</script>

<Popover.Root bind:open onOpenChange={handleOpenChange}>
	<Popover.Trigger bind:ref={triggerRef} class="w-full max-w-lg">
		{#snippet child({ props })}
			<Button variant="outline" class="w-full justify-between gap-2" {...props}>
				<span class="flex items-center gap-2 text-left">
					<Search class="text-muted-foreground h-4 w-4" />
					<span class="font-medium">Search Guilds</span>
				</span>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-lg p-0" align="start">
		<Command.Root shouldFilter={false} class="w-full max-w-lg">
			<Command.Input
				placeholder="Search for a guild..."
				bind:value={query}
				bind:ref={inputRef}
				oninput={(event) => handleInput((event.currentTarget as HTMLInputElement).value)}
			/>
			<Command.List>
				<Command.Empty>
					{#if errorMessage}
						<span class="text-destructive">{errorMessage}</span>
					{:else if trimmedQuery.length === 0}
						<span class="text-muted-foreground">Start typing to search guilds.</span>
					{:else if isLoading}
						<span class="text-muted-foreground flex items-center gap-2 px-4">
							<Loader2 class="h-4 w-4 animate-spin" />
							<span>Loading...</span>
						</span>
					{:else}
						<span class="text-muted-foreground">No guilds found.</span>
					{/if}
				</Command.Empty>
				{#if results.length}
					<ScrollArea class="max-h-72">
						<Command.Group heading="Results">
							{#each results as guild (guild.id)}
								<Command.Item value={guild.name} onSelect={() => handleSelect(guild)}>
									<div class="flex flex-1 flex-col text-left">
										<span class="text-foreground font-medium">{guild.name}</span>
										<span class="text-muted-foreground text-xs">
											{guild.memberCount.toLocaleString()} members
										</span>
									</div>
									{#if guild.tag}
										<GuildTag tag={guild.tag} tagColor={guild.tagColor} />
									{/if}
								</Command.Item>
							{/each}
						</Command.Group>
					</ScrollArea>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
