<script lang="ts">
	import FormattedText from '$comp/items/formatted-text.svelte';
	import ItemLore from '$comp/items/item-lore.svelte';
	import ItemName from '$comp/items/item-name.svelte';
	import ItemRender from '$comp/items/item-render.svelte';
	import type { RatesItemPriceData } from '$lib/api/elite';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import Info from '@lucide/svelte/icons/info';
	import {
		RARITY_COLORS,
		UpgradeReason,
		previousRarity,
		type FortuneSourceProgress,
		type FortuneUpgrade,
		type UpgradeInfo,
		type UpgradeTreeNode,
	} from 'farming-weight';
	import { SvelteSet } from 'svelte/reactivity';
	import FortuneProgress from './fortune-progress.svelte';
	import UpgradeTree from './upgrades/upgrade-tree.svelte';

	interface Props {
		open: boolean;
		progress: FortuneSourceProgress | null;
		items?: RatesItemPriceData;
		costFn?: (upgrade: FortuneUpgrade | UpgradeInfo, items?: RatesItemPriceData) => number;
		applyUpgrade?: (upgrade: FortuneUpgrade) => void;
		expandUpgrade?: (upgrade: FortuneUpgrade) => UpgradeTreeNode;
	}

	let { open = $bindable(false), progress, items, costFn, applyUpgrade, expandUpgrade }: Props = $props();

	const baseUpgrades = $derived(progress?.upgrades ?? []);

	// Generate a unique key for an upgrade to detect duplicates
	function getUpgradeKey(upgrade: FortuneUpgrade): string {
		const metaKey = upgrade.meta?.id ?? upgrade.meta?.key ?? '';
		return `${upgrade.category}|${upgrade.title}|${metaKey}|${upgrade.conflictKey ?? ''}`;
	}

	// Expand all base upgrades and flatten into a single list, deduplicating
	const allUpgrades = $derived.by(() => {
		if (!expandUpgrade) return baseUpgrades;

		const seen = new SvelteSet<string>();
		const result: FortuneUpgrade[] = [];

		const addIfNew = (upgrade: FortuneUpgrade) => {
			const key = getUpgradeKey(upgrade);
			if (!seen.has(key)) {
				seen.add(key);
				result.push(upgrade);
			}
		};

		const traverse = (node: UpgradeTreeNode) => {
			addIfNew(node.upgrade);
			node.children.forEach(traverse);
		};

		for (const upgrade of baseUpgrades) {
			const tree = expandUpgrade(upgrade);
			addIfNew(tree.upgrade);
			tree.children.forEach(traverse);
		}

		return result;
	});

	const hasUpgrades = $derived(allUpgrades.length > 0);

	const sortedUpgrades = $derived.by(() => {
		const upgrades = [...baseUpgrades];
		upgrades.sort((a, b) => {
			if (!costFn) return 0;
			const aCost = a.increase > 0 ? costFn(a, items) / a.increase : Infinity;
			const bCost = b.increase > 0 ? costFn(b, items) / b.increase : Infinity;
			return aCost - bCost;
		});
		return upgrades;
	});

	const totalCost = $derived.by(() => {
		if (!costFn) return 0;
		return allUpgrades.reduce((sum, u) => sum + costFn(u, items), 0);
	});

	const totalFortune = $derived(
		allUpgrades.reduce((sum, u) => sum + (u.increase > 0 ? u.increase : (u.max ?? 0)), 0)
	);
</script>

<Dialog.Root bind:open>
	<Dialog.ScrollContent parentClass="max-w-4xl" class="p-0">
		<div class="bg-card/80 flex items-start justify-between gap-4 border-b p-6">
			<div class="flex items-center gap-4">
				{#if progress?.item?.skyblockId}
					<div class="bg-background rounded-lg border p-2">
						<ItemRender skyblockId={progress.item.skyblockId} class="size-12" />
					</div>
				{/if}
				<div class="flex flex-col gap-1">
					<h2 class="text-xl font-bold">
						{#if progress?.item?.name}
							<ItemName name={progress.item.name} />
						{:else}
							{progress?.name ?? 'Details'}
						{/if}
					</h2>
					{#if progress?.item?.attributes?.rarity}
						<Badge variant="outline" class="w-fit capitalize">
							{progress.item.attributes.rarity}
						</Badge>
					{/if}
				</div>
			</div>

			{#if hasUpgrades && totalCost > 0}
				<div class="text-right">
					<p class="text-muted-foreground text-sm tracking-wider uppercase">Completion Cost</p>
					<p class="text-completed text-2xl font-bold">
						{Math.round(totalCost).toLocaleString()}
					</p>
					<p class="text-muted-foreground text-sm">
						+{totalFortune.toLocaleString()} Fortune
					</p>
				</div>
			{/if}
		</div>
		<div class="space-y-6 p-6">
			<!-- Details Section (Primary) -->
			{#if progress}
				<!-- Main progress bar -->
				<!-- {#if progress.maxFortune > 0} -->
				<FortuneProgress {progress} barBg="bg-card" />
				<!-- {/if} -->

				<!-- Sub-progress bars -->
				{#if progress.progress?.length}
					<div class="grid gap-2 md:grid-cols-2">
						{#each progress.progress as p, i (i)}
							<FortuneProgress progress={p} barBg="bg-card" />
						{/each}
					</div>
				{/if}

				<pre>{JSON.stringify(progress, null, 2)}</pre>

				<!-- Next/Max item info -->
				{#if progress.nextInfo?.skyblockId !== undefined || progress.maxInfo?.skyblockId !== undefined}
					<div class="dark flex flex-col gap-4 sm:flex-row">
						{#if progress.nextInfo?.skyblockId !== undefined}
							<div class="flex flex-1 flex-col gap-1">
								{#if progress.info?.upgrade?.reason === UpgradeReason.Situational}
									<h3 class="text-muted-foreground text-sm font-medium tracking-wide uppercase">
										Alternate Item
									</h3>
								{:else if progress.info?.upgrade?.reason === UpgradeReason.DeadEnd}
									<h3 class="text-muted-foreground text-sm font-medium tracking-wide uppercase">
										Switch To
									</h3>
								{:else}
									<h3 class="text-muted-foreground text-sm font-medium tracking-wide uppercase">
										Upgrade To
									</h3>
								{/if}
								<div class="flex flex-row items-center gap-1">
									{#if progress.info?.upgrade?.reason === UpgradeReason.Situational || (progress.info?.upgrade?.reason === UpgradeReason.NextTier && progress.item?.attributes?.rarity_upgrades)}
										<p class="text-lg font-semibold">
											<FormattedText
												text={RARITY_COLORS[progress.nextInfo.maxRarity] +
													progress.nextInfo.name}
											/>
										</p>
									{:else}
										<p class="text-lg font-semibold">
											<FormattedText
												text={RARITY_COLORS[previousRarity(progress.nextInfo.maxRarity)] +
													progress.nextInfo.name}
											/>
										</p>
									{/if}
									{#if progress.nextInfo.wiki}
										<a
											href={progress.nextInfo.wiki}
											target="_blank"
											rel="noopener noreferrer"
											class="text-link mt-0.5"
										>
											<Info size={16} />
										</a>
									{/if}
								</div>
								{#if progress.info?.upgrade?.why}
									<p class="text-muted-foreground text-sm">{progress.info.upgrade.why}</p>
								{/if}
							</div>
						{/if}

						{#if progress.maxInfo?.skyblockId !== undefined}
							<div class="flex flex-1 flex-col gap-1">
								<h3 class="text-muted-foreground text-sm font-medium tracking-wide uppercase">
									Max Item
								</h3>
								<div class="flex flex-row items-center gap-1">
									<p class="text-lg font-semibold">
										<FormattedText
											text={RARITY_COLORS[progress.maxInfo.maxRarity] + progress.maxInfo.name}
										/>
									</p>
									{#if progress.maxInfo.wiki}
										<a
											href={progress.maxInfo.wiki}
											target="_blank"
											rel="noopener noreferrer"
											class="text-link mt-0.5"
										>
											<Info size={16} />
										</a>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/if}

			<!-- Upgrades Section (Below Details) -->
			{#if hasUpgrades}
				<hr class="border-muted" />
				<div>
					<h3 class="text-muted-foreground mb-4 text-sm font-bold tracking-wider uppercase">
						Available Upgrades
					</h3>
					<div class="flex flex-col gap-2">
						{#each sortedUpgrades as upgrade, i (i)}
							{#if expandUpgrade}
								<UpgradeTree node={expandUpgrade(upgrade)} {items} {costFn} {applyUpgrade} />
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			{#if !progress}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-muted-foreground text-lg">No information available</p>
				</div>
			{:else if progress.item}
				<ItemLore item={progress.item} otherDebugData={sortedUpgrades} />
			{/if}
		</div>
		<div class="bg-card/80 flex items-center justify-end gap-2 border-t p-4">
			<Button variant="outline" onclick={() => (open = false)}>Close</Button>
		</div>
	</Dialog.ScrollContent>
</Dialog.Root>
