<script lang="ts">
	import type { LbList, LbRanking } from './columns';

	interface Props {
		rank: LbRanking;
		leaderboards?: LbList;
	}

	let { rank, leaderboards }: Props = $props();

	const lb = $derived.by(() => {
		if (!leaderboards) return null;
		return leaderboards.leaderboards[rank.id];
	});
</script>

<div class="flex min-w-80 flex-1 flex-col items-start justify-center gap-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<span>{rank.title}{lb?.suffix ? ` ${lb.suffix}` : ''}</span>
		<!-- {#if rank.wiki}
			<a href={rank.wiki} target="_blank" rel="noopener noreferrer" class="text-link">
				<Info size={16} />
			</a>
		{/if}
		{#if rank.api === false}
			<Popover.Mobile>
				{#snippet trigger()}
					<TriangleAlert size={16} class="text-completed mt-1.5" />
				{/snippet}
				<p class="max-w-sm text-sm">
					This fortune source is not available in the Hypixel API. Configure settings on this page to mark it
					as complete.
				</p>
			</Popover.Mobile>
		{/if} -->
	</p>
	<!-- <p class="text-sm">
		{#if rank.action === UpgradeAction.Apply && rank.onto?.name}
			<span>Apply {rank.category} on</span> <ItemName name={rank.onto.name} />
		{:else if rank.action === UpgradeAction.LevelUp && rank.onto?.name}
			<span>Level up {rank.category} on</span>
			<ItemName name={rank.onto.name} />
		{:else if upgrade.action === UpgradeAction.Recombobulate && upgrade.onto?.name}
      <span>Recombobulate</span> <ItemName name={upgrade.onto.name} />
		{:else if rank.action === UpgradeAction.Purchase}
			<span>Purchase {rank.title}</span>
		{:else if rank.action === UpgradeAction.Consume}
			<span>Consume {rank.title}</span>
		{:else if rank.action === UpgradeAction.Upgrade && rank.onto?.name}
			<span>Upgrade</span> <ItemName name={rank.onto.name} />
		{/if}
	</p> -->
	<!-- {#if itemData}
		<ItemRequirements {itemData} />
	{/if}
	{#if rank.repeatable && rank.repeatable > 1}
		<p class="text-muted-foreground text-xs">
			This upgrade can be done <span class="font-bold">{rank.repeatable.toLocaleString()}</span> times!
		</p>
	{/if}
	{#if rank.optional}
		<p class="text-muted-foreground text-xs">Recommended for more profit despite lower fortune.</p>
	{/if}
	{#if rank.increase === 0 && rank.max && rank.max > 0}
		<p class="text-muted-foreground text-xs">Gives no fortune right away, but has later upgrades.</p>
	{/if} -->
</div>
