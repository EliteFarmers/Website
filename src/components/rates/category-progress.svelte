<script lang="ts">
	import {
		previousRarity,
		RARITY_COLORS,
		UpgradeReason,
		type FortuneSourceProgress,
		type Upgrade,
	} from 'farming-weight';
	import FortuneProgress from './fortune-progress.svelte';
	import * as Dialog from '$ui/dialog';
	import Info from 'lucide-svelte/icons/info';
	import { FormatMinecraftText } from '$lib/format';

	export let name: string;
	export let progress: FortuneSourceProgress[];

	let progressModal = false;
	$: shownProgress = undefined as FortuneSourceProgress | undefined;
</script>

<div class="flex flex-col gap-2 flex-1">
	<div class="flex flex-col max-w-lg w-full gap-1 flex-1">
		<h2 class="text-xl">{name}</h2>
		{#each progress as p (p.name)}
			{#if p.nextInfo || p.maxInfo || p.progress?.length}
				<button
					class="hover:bg-card/50 p-1 rounded-lg cursor-pointer"
					on:click={() => {
						shownProgress = p;
						progressModal = true;
					}}
				>
					<FortuneProgress progress={p} />
				</button>
			{:else}
				<div class="p-1">
					<FortuneProgress progress={p} />
				</div>
			{/if}
		{/each}
	</div>
</div>

<Dialog.Root bind:open={progressModal}>
	<Dialog.Content class="overflow-hidden">
		<Dialog.Title>{shownProgress?.name}</Dialog.Title>
		{#if shownProgress}
			<FortuneProgress progress={shownProgress} barBg="bg-primary-foreground" />
		{/if}

		<!-- {#if shownProgress?.wiki}
			<ExternalLinkButton href={shownProgress.wiki}>
				Hypixel Wiki
			</ExternalLinkButton>
		{/if} -->

		{#if shownProgress?.progress?.length}
			<div class="grid md:grid-cols-2 gap-2">
				{#each shownProgress.progress as p (p.name)}
					<FortuneProgress progress={p} barBg="bg-primary-foreground" />
				{/each}
			</div>
		{/if}

		<div class="flex flex-col sm:flex-row gap-2">
			{#if shownProgress?.nextInfo?.skyblockId !== undefined}
				<div class="flex flex-col gap-1 flex-1">
					{#if shownProgress.info?.upgrade?.reason === UpgradeReason.Situational}
						<h3 class="text-lg mb-1">Alternate Item</h3>
					{:else if shownProgress.info?.upgrade?.reason === UpgradeReason.DeadEnd}
						<h3 class="text-lg mb-1">Switch To</h3>
					{:else}
						<h3 class="text-lg mb-1">Upgrade To</h3>
					{/if}
					<div class="flex flex-row items-center gap-1">
						{#if shownProgress.info?.upgrade?.reason === UpgradeReason.Situational}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<p>
								{@html FormatMinecraftText(
									RARITY_COLORS[shownProgress.nextInfo.maxRarity] + shownProgress.nextInfo.name
								)}
							</p>
						{:else}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<p>
								{@html FormatMinecraftText(
									RARITY_COLORS[previousRarity(shownProgress.nextInfo.maxRarity)] +
										shownProgress.nextInfo.name
								)}
							</p>
						{/if}
						{#if shownProgress.nextInfo.wiki}
							<a
								href={shownProgress.nextInfo.wiki}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-500 mt-0.5"
							>
								<Info size={16} />
							</a>
						{/if}
					</div>
					{#if shownProgress.info?.upgrade?.why}
						<p class="text-sm text-gray-500">{shownProgress.info.upgrade.why}</p>
					{/if}
				</div>
			{/if}

			{#if shownProgress?.maxInfo?.skyblockId !== undefined}
				<div class="flex flex-col gap-2 flex-1">
					<h3 class="text-lg">Max Item</h3>
					<div class="flex flex-row items-center gap-1">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<p>
							{@html FormatMinecraftText(
								RARITY_COLORS[shownProgress.maxInfo.maxRarity] + shownProgress.maxInfo.name
							)}
						</p>
						{#if shownProgress.maxInfo.wiki}
							<a
								href={shownProgress.maxInfo.wiki}
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
	</Dialog.Content>
</Dialog.Root>
