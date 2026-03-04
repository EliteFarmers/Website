<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { getAccountOptions } from '$lib/remote';
	import { Button } from '$ui/button';
	import { ScrollArea } from '$ui/scroll-area';
	import type { Snippet } from 'svelte';

	interface Props {
		username: string;
		children?: Snippet;
		button?: Snippet<[{ uuid: string; ign: string }]>;
		filter?: (option: { uuid: string; ign: string }) => boolean;
		onSelect?: (option: { uuid: string; ign: string }) => void;
	}

	let { username, children, onSelect, button, filter }: Props = $props();

	const options = getAccountOptions();

	const filteredOptions = $derived.by(() => {
		if (!filter || !options.current) return options.current ?? [];
		return options.current.filter(filter);
	});
</script>

{#if filteredOptions.length !== 0}
	<div class="flex flex-col items-start gap-2 rounded-md">
		<p class="text-muted-foreground mb-2 text-sm">
			These accounts already have <span class="text-foreground font-mono select-all">{username}</span> linked in Hypixel!
		</p>
		<ScrollArea class="flex max-h-48 w-full flex-col rounded-md border p-2 px-3">
			<div class="flex flex-col gap-2">
				{#each filteredOptions as option (option.uuid)}
					<div class="flex flex-row items-center justify-between gap-2">
						<div class="flex flex-row items-center gap-2">
							<PlayerHead uuid={option.uuid} class="size-8" />
							<span>{option.ign}</span>
						</div>
						{#if button}
							{@render button?.(option)}
						{:else}
							<Button onclick={() => onSelect?.(option)}>Confirm</Button>
						{/if}
					</div>
				{/each}
			</div>
		</ScrollArea>
		{@render children?.()}
	</div>
{/if}
