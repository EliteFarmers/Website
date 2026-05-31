<script lang="ts">
	import type { CreditsEntry } from '$comp/blocks/blocks';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { dispatchEditCredits } from '$lib/editor/editor-events';
	import type { SvelteNodeViewComponentProps } from '$lib/editor/svelte-node-view-renderer';
	import Users from '@lucide/svelte/icons/users';

	let { node, selected, getPos }: SvelteNodeViewComponentProps = $props();

	let entries = $derived(
		((node.attrs.entries as CreditsEntry[]) || []).filter((entry) => entry.username || entry.reason)
	);

	function handleClick() {
		const pos = getPos();
		if (pos !== undefined) {
			dispatchEditCredits({ entries, pos });
		}
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class={`bg-card my-2 flex w-full cursor-pointer flex-col gap-3 rounded-lg border p-4 text-left shadow-sm ${selected ? 'ring-primary ring-2' : ''}`}
>
	<div class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
		<Users class="size-4" />
		Credits ({entries.length})
	</div>
	{#if entries.length > 0}
		<div class="grid gap-2">
			{#each entries.slice(0, 4) as entry, index (`${entry.username}-${index}`)}
				<div class="grid grid-cols-[minmax(9rem,14rem)_1fr] items-center gap-3 text-sm">
					<div class="flex items-center gap-2 font-medium">
						<PlayerHead uuid={entry.username} class="size-6 rounded-sm" />
						<span>{entry.username || 'Unnamed'}</span>
					</div>
					<span class="text-muted-foreground line-clamp-1">{entry.reason || 'No reason set'}</span>
				</div>
			{/each}
		</div>
	{:else}
		<span class="text-muted-foreground text-sm">Click to add credits</span>
	{/if}
</button>
