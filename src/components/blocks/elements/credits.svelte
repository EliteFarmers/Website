<script lang="ts">
	import type { CreditsBlockNode } from '$comp/blocks/blocks';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import Users from '@lucide/svelte/icons/users';

	interface Props {
		node: CreditsBlockNode;
	}

	let { node }: Props = $props();
	let entries = $derived(node.entries.filter((entry) => entry.username || entry.reason));
</script>

<section class="not-prose my-5 rounded-lg border bg-card shadow-sm">
	<div class="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold">
		<Users class="size-4" />
		Credits
	</div>
	{#if entries.length > 0}
		<table class="w-full text-sm">
			<thead class="border-b text-left text-xs text-muted-foreground">
				<tr>
					<th class="w-48 px-4 py-2 font-medium">Player</th>
					<th class="px-4 py-2 font-medium">Credit</th>
				</tr>
			</thead>
			<tbody class="divide-y">
				{#each entries as entry, index (`${entry.username}-${index}`)}
					<tr>
						<td class="px-4 py-3 align-top">
							<div class="flex items-center gap-2 font-medium">
								<PlayerHead uuid={entry.username} class="size-7 rounded-sm" />
								<span>{entry.username || 'Unnamed'}</span>
							</div>
						</td>
						<td class="px-4 py-3 align-top text-muted-foreground">{entry.reason}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="px-4 py-3 text-sm text-muted-foreground">No credits listed.</p>
	{/if}
</section>
