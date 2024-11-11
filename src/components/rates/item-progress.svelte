<script lang="ts">
	import { UpgradeReason, RARITY_COLORS, previousRarity, type FortuneSourceProgress } from 'farming-weight';
	import { FormatMinecraftText } from '$lib/format';
	import Info from 'lucide-svelte/icons/info';
	import ItemLore from '$comp/items/item-lore.svelte';
	import FortuneProgress from './fortune-progress.svelte';

	interface Props {
		progress: FortuneSourceProgress;
	}

	let { progress }: Props = $props();
</script>

<FortuneProgress {progress} barBg="bg-primary-foreground" />

{#if progress?.progress?.length}
	<div class="grid md:grid-cols-2 gap-2">
		{#each progress.progress as p (p.name + p.fortune + (progress?.item?.uuid ?? ''))}
			<FortuneProgress progress={p} barBg="bg-primary-foreground" />
		{/each}
	</div>
{/if}

{#if progress?.nextInfo?.skyblockId !== undefined || progress?.maxInfo?.skyblockId !== undefined}
	<hr />
{/if}

<div class="flex flex-col sm:flex-row gap-2">
	{#if progress?.nextInfo?.skyblockId !== undefined}
		<div class="flex flex-col gap-1 flex-1">
			{#if progress.info?.upgrade?.reason === UpgradeReason.Situational}
				<h3 class="text-lg mb-1">Alternate Item</h3>
			{:else if progress.info?.upgrade?.reason === UpgradeReason.DeadEnd}
				<h3 class="text-lg mb-1">Switch To</h3>
			{:else}
				<h3 class="text-lg mb-1">Upgrade To</h3>
			{/if}
			<div class="flex flex-row items-center gap-1">
				{#if progress.info?.upgrade?.reason === UpgradeReason.Situational || (progress?.info?.upgrade?.reason === UpgradeReason.NextTier && progress.item?.attributes?.rarity_upgrades)}
					<p>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html FormatMinecraftText(RARITY_COLORS[progress.nextInfo.maxRarity] + progress.nextInfo.name)}
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
						class="text-blue-500 mt-0.5"
					>
						<Info size={16} />
					</a>
				{/if}
			</div>
			{#if progress.info?.upgrade?.why}
				<p class="text-sm text-gray-500">{progress.info.upgrade.why}</p>
			{/if}
		</div>
	{/if}

	{#if progress?.maxInfo?.skyblockId !== undefined}
		<div class="flex flex-col gap-2 flex-1">
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
						class="text-blue-500 mt-0.5"
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
