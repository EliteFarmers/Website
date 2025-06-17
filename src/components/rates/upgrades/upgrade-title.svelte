<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import * as Popover from '$ui/popover';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { UpgradeAction, type FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
	}

	let { upgrade }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-start justify-center gap-1">
	<p class="flex flex-row items-center gap-1 text-base">
		<ItemName name={upgrade.title} />
		{#if upgrade.wiki}
			<a href={upgrade.wiki} target="_blank" rel="noopener noreferrer" class="text-link">
				<Info size={16} />
			</a>
		{/if}
		{#if upgrade.api === false}
			<Popover.Mobile>
				{#snippet trigger()}
					<TriangleAlert size={16} class="mt-1.5 text-completed" />
				{/snippet}
				<p class="max-w-sm text-sm">
					This fortune source is not available in the Hypixel API. For it to show up you need to configure
					settings on this page.
				</p>
			</Popover.Mobile>
		{/if}
	</p>
	<p class="text-sm">
		{#if upgrade.action === UpgradeAction.Apply && upgrade.onto?.name}
			<span>Apply {upgrade.category} on</span> <ItemName name={upgrade.onto.name} />
		{:else if upgrade.action === UpgradeAction.LevelUp && upgrade.onto?.name}
			<span>Level up {upgrade.category} on</span>
			<ItemName name={upgrade.onto.name} />
			<!-- {:else if upgrade.action === UpgradeAction.Recombobulate && upgrade.onto?.name}
      <span>Recombobulate</span> <ItemName name={upgrade.onto.name} /> -->
		{:else if upgrade.action === UpgradeAction.Purchase}
			<span>Purchase {upgrade.title}</span>
		{:else if upgrade.action === UpgradeAction.Consume}
			<span>Consume {upgrade.title}</span>
		{:else if upgrade.action === UpgradeAction.Upgrade && upgrade.onto?.name}
			<span>Upgrade</span> <ItemName name={upgrade.onto.name} />
		{/if}
	</p>
	{#if upgrade.optional}
		<p class="text-xs text-muted-foreground">Recommended for more coins per hour despite lower fortune.</p>
	{/if}
	{#if upgrade.increase === 0 && upgrade.max && upgrade.max > 0}
		<p class="text-xs text-muted-foreground">Gives no fortune right away, but is needed for later upgrades.</p>
	{/if}
</div>
