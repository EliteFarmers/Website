<script lang="ts">
	import ItemLore from '$comp/items/item-lore.svelte';
	import { FormatMinecraftText } from '$lib/format';
	import Info from '@lucide/svelte/icons/info';
	import { RARITY_COLORS, UpgradeReason, previousRarity, type FortuneSourceProgress } from 'farming-weight';
	import FortuneProgress from './fortune-progress.svelte';

	interface Props {
		progress: FortuneSourceProgress;
	}

	let { progress }: Props = $props();
</script>

<div class="flex flex-col gap-4 pt-6">
	<FortuneProgress {progress} barBg="bg-card" />

	{#if progress?.progress?.length}
		<div class="grid gap-2 md:grid-cols-2">
			{#each progress.progress as p (p.name + p.fortune + (progress?.item?.uuid ?? ''))}
				<FortuneProgress progress={p} barBg="bg-card" />
			{/each}
		</div>
	{/if}

	{#if progress?.nextInfo?.skyblockId !== undefined || progress?.maxInfo?.skyblockId !== undefined}
		<hr />
	{/if}

	<div class="dark flex flex-col gap-2 sm:flex-row">
		{#if progress?.nextInfo?.skyblockId !== undefined}
			<div class="flex flex-1 flex-col gap-1">
				{#if progress.info?.upgrade?.reason === UpgradeReason.Situational}
					<h3 class="mb-1 text-lg">Alternate Item</h3>
				{:else if progress.info?.upgrade?.reason === UpgradeReason.DeadEnd}
					<h3 class="mb-1 text-lg">Switch To</h3>
				{:else}
					<h3 class="mb-1 text-lg">Upgrade To</h3>
				{/if}
				<div class="flex flex-row items-center gap-1">
					{#if progress.info?.upgrade?.reason === UpgradeReason.Situational || (progress?.info?.upgrade?.reason === UpgradeReason.NextTier && progress.item?.attributes?.rarity_upgrades)}
						<p>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html FormatMinecraftText(
								RARITY_COLORS[progress.nextInfo.maxRarity] + progress.nextInfo.name
							)}
						</p>
					{:else}
						<p>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html FormatMinecraftText(
								RARITY_COLORS[previousRarity(progress.nextInfo.maxRarity)] + progress.nextInfo.name
							)}
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

		{#if progress?.maxInfo?.skyblockId !== undefined}
			<div class="flex flex-1 flex-col gap-2">
				<h3 class="text-lg">Max Item</h3>
				<div class="flex flex-row items-center gap-1">
					<p>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html FormatMinecraftText(RARITY_COLORS[progress.maxInfo.maxRarity] + progress.maxInfo.name)}
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

	{#if progress?.item}
		<hr class="mb-2" />
		<ItemLore item={progress.item} />
	{/if}
</div>
