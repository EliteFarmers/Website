<script lang="ts">
	import LeaderboardRankLink from '$comp/leaderboards/leaderboard-rank-link.svelte';
	import * as Popover from '$comp/ui/popover';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import * as Sidebar from '$ui/sidebar';
	import { getCropFromName } from 'farming-weight';
	import Minion from './minion.svelte';

	let { key }: { key: string } = $props();

	const ctx = getStatsContext();

	const collection = $derived(ctx.collections.find((collection) => collection.key === key));
	const name = $derived(collection?.name);
	const value = $derived(collection?.value ?? 0);
	const weight = $derived(collection?.weight ?? 0);
	const pest = $derived(collection?.pest ?? '');
	const pestKills = $derived(collection?.pestKills ?? 0);
	const uncounted = $derived(collection?.uncounted ?? 0);
	const rank = $derived(ctx.ranks?.[key]?.rank ?? -1);
	const pestRank = $derived(ctx.ranks?.[pest]?.rank ?? -1);

	let crop = $derived(name ? name : undefined);
	let cropEnum = $derived(crop ? getCropFromName(crop) : undefined);

	function getFrameStyle(rank: number) {
		if (rank <= 0) return '';

		if (rank <= 5) {
			return 'background-image: url(/images/frames/rainbow.png);';
		} else if (rank <= 10) {
			return 'background-image: url(/images/frames/mithril.png);';
		} else if (rank <= 50) {
			return 'background-image: url(/images/frames/gold.png);';
		} else if (rank <= 100) {
			return 'background-image: url(/images/frames/silver.png);';
		} else if (rank <= 500) {
			return 'background-image: url(/images/frames/bronze.png);';
		}
	}

	let style = $derived(getFrameStyle(rank));
	const sidebar = Sidebar.useSidebar();
</script>

{#if sidebar.size.tiny}
	<div
		class="flex max-h-30 w-full flex-row items-center gap-2 rounded-lg bg-card p-1 align-middle text-card-foreground"
	>
		<div class="flex flex-col items-center justify-evenly gap-1">
			{@render cropIcon()}
			<img
				src="/images/pests/{pest}.png"
				class="pixelated aspect-square size-8 h-full object-contain p-1"
				alt={pest}
			/>
		</div>
		<div class="flex flex-1 flex-col items-start justify-center gap-1">
			<div class="flex flex-col items-start">
				<div class="flex flex-row items-center gap-1">
					{#if rank > 0}
						<LeaderboardRankLink
							category={key}
							player={ctx.ign}
							profile={ctx.selectedProfile?.profileName}
							{rank}
							class="rounded-md bg-card px-1.5 text-card-foreground hover:bg-muted"
						>
							<span class="xs:text-md text-sm sm:text-lg">#</span><span
								class="text-md xs:text-lg sm:text-xl">{rank}</span
							>
						</LeaderboardRankLink>
					{/if}
					<p class="text-md font-semibold whitespace-nowrap sm:text-lg">{name}</p>
				</div>
				<p class="text-normal whitespace-nowrap sm:text-lg md:text-xl lg:text-2xl">
					{value.toLocaleString()}
				</p>
			</div>
			<div class="flex flex-row items-center gap-2">
				{#if pestRank > 0}
					<LeaderboardRankLink
						category={pest}
						player={ctx.ign}
						profile={ctx.selectedProfile?.profileName}
						rank={pestRank}
						class="rounded-md bg-card px-1 text-card-foreground hover:bg-muted"
					>
						<span class="xs:text-md text-sm sm:text-lg">#</span><span class="text-md xs:text-lg sm:text-xl"
							>{pestRank}</span
						>
					</LeaderboardRankLink>
				{/if}
				<Popover.Mobile>
					{#snippet trigger()}
						<div class="flex h-6 flex-row items-center justify-center gap-2 align-middle">
							<p class="text-md font-semibold whitespace-nowrap sm:text-lg">
								{pestKills.toLocaleString()}
							</p>
						</div>
					{/snippet}
					<div class="flex max-w-md flex-col items-center gap-2">
						<p class="text-lg font-semibold first-letter:capitalize">{pest} Kills</p>
						<p>{pestKills.toLocaleString()}</p>
						<a
							class="text-lg font-semibold text-link hover:underline"
							href="/info/weight#pest-weight-adjustment">Weight Adjustment</a
						>
						{#if uncounted === 0}
							<p>None!</p>
						{:else}
							<p>-{uncounted.toLocaleString()} {name}</p>
						{/if}
					</div>
				</Popover.Mobile>
			</div>
		</div>
		<div class="flex flex-col items-end justify-between gap-1">
			<p class="pr-1 text-right font-semibold sm:text-lg md:ml-2 md:text-xl lg:text-2xl">
				{Math.floor(weight).toLocaleString()}
			</p>
			{#if cropEnum}
				<Minion crop={cropEnum} size="sm" />
			{/if}
		</div>
	</div>
{:else}
	<div class="flex w-full flex-row items-center gap-2 align-middle">
		<div
			class="flex max-h-30 w-full flex-1 items-center justify-start gap-1 rounded-lg bg-card p-1 align-middle text-card-foreground"
		>
			{@render cropIcon('hidden sm:flex')}
			<div class="flex grow flex-col justify-center gap-1 pr-2">
				<div class="flex flex-row items-center justify-between gap-2">
					<div class="flex flex-row items-center gap-1">
						{@render cropIcon('flex sm:hidden')}
						{#if rank > 0}
							<LeaderboardRankLink
								category={key}
								player={ctx.ign}
								profile={ctx.selectedProfile?.profileName}
								{rank}
								class="rounded-md bg-card px-1.5 text-card-foreground hover:bg-muted"
							>
								<span class="xs:text-md text-sm sm:text-lg">#</span><span
									class="text-md xs:text-lg sm:text-xl">{rank}</span
								>
							</LeaderboardRankLink>
						{/if}
						<p class="text-md font-semibold whitespace-nowrap sm:text-lg">{name}</p>
					</div>
					<p class="text-right font-semibold sm:text-lg md:ml-2 md:text-xl lg:text-2xl">
						{weight.toLocaleString()}
					</p>
				</div>
				<div class="flex flex-row items-center justify-between gap-2 pb-0.5 md:pb-0">
					<p
						class="text-normal whitespace-nowrap {pestRank > 0
							? 'pl-1'
							: ''} sm:text-lg md:text-xl lg:text-2xl"
					>
						{value.toLocaleString()}
					</p>
					<div class="flex flex-row items-center gap-2">
						{#if pestRank > 0}
							<LeaderboardRankLink
								category={pest}
								player={ctx.ign}
								profile={ctx.selectedProfile?.profileName}
								rank={pestRank}
								class="rounded-md bg-card px-1 text-card-foreground hover:bg-muted"
							>
								<span class="xs:text-md text-sm sm:text-lg">#</span><span
									class="text-md xs:text-lg sm:text-xl">{pestRank}</span
								>
							</LeaderboardRankLink>
						{/if}
						<Popover.Mobile>
							{#snippet trigger()}
								<div class="flex h-6 flex-row items-center justify-center gap-2 align-middle">
									<p class="text-md font-semibold whitespace-nowrap sm:text-lg">
										{pestKills.toLocaleString()}
									</p>
									<img
										src="/images/pests/{pest}.png"
										class="pixelated aspect-square h-full object-contain"
										alt={pest}
									/>
								</div>
							{/snippet}
							<div class="flex max-w-md flex-col items-center gap-2">
								<p class="text-lg font-semibold first-letter:capitalize">{pest} Kills</p>
								<p>{pestKills.toLocaleString()}</p>
								<a
									class="text-lg font-semibold text-link hover:underline"
									href="/info/weight#pest-weight-adjustment">Weight Adjustment</a
								>
								{#if uncounted === 0}
									<p>None!</p>
								{:else}
									<p>-{uncounted.toLocaleString()} {name}</p>
								{/if}
							</div>
						</Popover.Mobile>
					</div>
				</div>
			</div>
		</div>
		{#if cropEnum}
			<Minion crop={cropEnum} />
		{/if}
	</div>
{/if}

{#snippet cropIcon(classes?: string)}
	<div class="crop-container pixelated flex aspect-square size-10 sm:size-14 md:size-20 {classes}" {style}>
		<img
			src="/images/crops/{key}.png"
			class="pixelated aspect-square rounded-lg object-contain p-[16%]"
			alt={name}
		/>
	</div>
{/snippet}

<style lang="postcss">
	@reference '$css';

	.crop-container {
		@apply aspect-square justify-center object-contain align-middle;
		aspect-ratio: 1 / 1;
		background-repeat: no-repeat;
		background-size: 85%;
		background-position: center;
		background-blend-mode: color;
	}
</style>
