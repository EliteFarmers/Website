<script lang="ts">
	import EntryPreview from '$comp/leaderboards/entry-preview.svelte';
	import WeightStyle from '$comp/monetization/weight-style.svelte';
	import type { FarmingWeightDto, WeightStyleWithDataDto } from '$lib/api';
	import { isValidLeaderboardStyle, isValidWeightStyle } from '$lib/styles/style';
	import NameCardStylePreview from './name-card-style-preview.svelte';
	import PageStylePreview from './page-style-preview.svelte';

	interface Props {
		style: WeightStyleWithDataDto;
		ign: string;
		uuid: string;
		weight?: FarmingWeightDto;
		compact?: boolean;
	}

	let { style, ign, uuid, weight = { totalWeight: 10000 } as FarmingWeightDto, compact = false }: Props = $props();

	const hasWeight = $derived(isValidWeightStyle(style.data));
	const hasLeaderboard = $derived(isValidLeaderboardStyle(style.leaderboard));
	const hasLeaderboardFrame = $derived(Boolean(style.frame?.leaderboard?.imageUrl));
	const hasNameCard = $derived(Boolean(style.nameCard));
	const hasNameCardFrame = $derived(Boolean(style.frame?.nameCard?.imageUrl));
	const hasPage = $derived(Boolean(style.page));
	const hasPreview = $derived(
		hasWeight || hasLeaderboard || hasLeaderboardFrame || hasNameCard || hasNameCardFrame || hasPage
	);
</script>

{#if compact && hasPreview}
	{#if hasLeaderboard || hasLeaderboardFrame}
		<div class="w-full py-2">
			<EntryPreview
				style={hasLeaderboard ? style.leaderboard : undefined}
				frame={style.frame?.leaderboard}
				{ign}
				{uuid}
				styleId={hasLeaderboard ? style.id : undefined}
				imageRefs={style.imageRefs}
				frameImageRefs={style.imageRefs}
			/>
		</div>
	{:else if hasNameCard || hasNameCardFrame}
		<NameCardStylePreview {style} {ign} {uuid} weight={weight.totalWeight ?? 10000} />
	{:else if hasPage}
		<PageStylePreview {style} {ign} />
	{:else if hasWeight}
		<div class="w-full overflow-hidden rounded-lg border p-2">
			<WeightStyle {style} {ign} {uuid} {weight} />
		</div>
	{/if}
{:else if hasPreview}
	<div class="grid gap-6 lg:grid-cols-2">
		{#if hasWeight}
			<div class="min-w-0">
				<p class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">Weight command</p>
				<div class="overflow-hidden rounded-lg border p-2">
					<WeightStyle {style} {ign} {uuid} {weight} />
				</div>
			</div>
		{/if}

		{#if hasLeaderboard || hasLeaderboardFrame}
			<div class="min-w-0">
				<p class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
					Leaderboard{hasLeaderboardFrame && !hasLeaderboard ? ' frame' : ''}
				</p>
				<div class="py-2">
					<EntryPreview
						style={hasLeaderboard ? style.leaderboard : undefined}
						frame={style.frame?.leaderboard}
						{ign}
						{uuid}
						styleId={hasLeaderboard ? style.id : undefined}
						imageRefs={style.imageRefs}
						frameImageRefs={style.imageRefs}
					/>
				</div>
			</div>
		{/if}

		{#if hasNameCard || hasNameCardFrame}
			<div class="min-w-0 lg:col-span-2">
				<p class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
					Name card{hasNameCardFrame && !hasNameCard ? ' frame' : ''}
				</p>
				<NameCardStylePreview {style} {ign} {uuid} weight={weight.totalWeight ?? 10000} />
			</div>
		{/if}

		{#if hasPage}
			<div class="min-w-0 lg:col-span-2">
				<p class="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
					Profile page theme
				</p>
				<PageStylePreview {style} {ign} />
			</div>
		{/if}
	</div>
{:else}
	<p class="text-muted-foreground">{style.description ?? 'A preview is not available for this cosmetic.'}</p>
{/if}
