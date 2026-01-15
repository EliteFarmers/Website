<script lang="ts">
	import { cn } from '$lib/utils';
	import * as Popover from '$ui/popover';
	import { STAT_ICONS, STAT_NAMES, Stat, type FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		class?: string;
	}

	let { upgrade, class: className }: Props = $props();

	const CROP_FORTUNE_STATS = new Set([
		Stat.CactusFortune,
		Stat.CarrotFortune,
		Stat.CocoaBeanFortune,
		Stat.MelonFortune,
		Stat.MushroomFortune,
		Stat.NetherWartFortune,
		Stat.PotatoFortune,
		Stat.PumpkinFortune,
		Stat.SugarCaneFortune,
		Stat.WheatFortune,
		Stat.SunflowerFortune,
		Stat.MoonflowerFortune,
		Stat.WildRoseFortune,
	]);

	// Primary display stat (FarmingFortune or the first crop fortune)
	const primaryStat = $derived.by(() => {
		if (!upgrade.stats) return { stat: Stat.FarmingFortune, value: upgrade.increase ?? 0 };
		const ff = upgrade.stats[Stat.FarmingFortune];
		if (ff !== undefined && ff !== 0) return { stat: Stat.FarmingFortune, value: ff };
		// Check for crop fortune
		for (const [statKey, value] of Object.entries(upgrade.stats)) {
			const stat = statKey as Stat;
			if (CROP_FORTUNE_STATS.has(stat) && value !== 0) {
				return { stat, value: value as number };
			}
		}
		return { stat: Stat.FarmingFortune, value: upgrade.increase ?? 0 };
	});

	// Other stats (not primary)
	const otherStats = $derived.by(() => {
		if (!upgrade.stats) return [];
		return Object.entries(upgrade.stats)
			.filter(([statKey, value]) => {
				const stat = statKey as Stat;
				if (stat === primaryStat.stat) return false;
				if (value === 0) return false;
				return true;
			})
			.map(([statKey, value]) => ({ stat: statKey as Stat, value: value as number }))
			.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
	});

	// const hasContent = $derived(primaryStat.value !== 0 || otherStats.length > 0 || upgrade.max);
	const isNegative = $derived(primaryStat.value < 0);
	const maxOnly = $derived(primaryStat.value === 0 && upgrade.max && upgrade.max > 0);
	const forCompletion = $derived(upgrade.stats === undefined && primaryStat.value === 0);

	const background = $derived(
		maxOnly || forCompletion ? 'bg-progress/40' : isNegative ? 'bg-destructive/60' : 'bg-progress'
	);
</script>

<Popover.Mobile>
	{#snippet trigger()}
		<div
			class={cn(
				'relative flex h-full min-h-4 flex-row items-center gap-1.5 rounded-md px-1',
				background,
				className
			)}
		>
			<span>{STAT_ICONS[primaryStat.stat] ?? '☘'}</span>
			<span class="text-md relative z-10 pr-1 font-mono leading-none md:text-lg">
				{primaryStat.value !== 0 ? (+primaryStat.value.toFixed(2)).toLocaleString() : '0'}
			</span>
		</div>
	{/snippet}
	<div class="flex max-w-xs flex-col gap-2">
		<p class="font-semibold">Upgrade Stats</p>

		<div class="flex flex-col gap-1">
			{#if primaryStat.value !== 0}
				<div
					class="even:bg-card flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none"
				>
					<p class="flex items-center gap-1">
						<span>{STAT_ICONS[primaryStat.stat] ?? '☘'}</span>
						{STAT_NAMES[primaryStat.stat] ?? primaryStat.stat}
					</p>
					<p class={primaryStat.value < 0 ? 'text-destructive' : ''}>
						{primaryStat.value > 0 ? '+' : ''}{(+primaryStat.value.toFixed(2)).toLocaleString()}
					</p>
				</div>
			{/if}
			{#each otherStats as { stat, value } (stat)}
				<div
					class="even:bg-card flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none"
				>
					<p class="flex items-center gap-1">
						<span>{STAT_ICONS[stat] ?? ''}</span>
						{STAT_NAMES[stat] ?? stat}
					</p>
					<p class={value < 0 ? 'text-destructive' : ''}>
						{value > 0 ? '+' : ''}{(+value.toFixed(2)).toLocaleString()}
					</p>
				</div>
			{/each}
		</div>

		{#if isNegative}
			<p class="text-muted-foreground max-w-sm text-sm">
				This upgrade is suggested despite lower stats because it increases profit per hour.
			</p>
		{:else if forCompletion}
			<p class="text-muted-foreground max-w-sm text-sm">This upgrade is shown for completion!</p>
		{:else if maxOnly}
			<p class="text-muted-foreground max-w-sm text-sm">
				This upgrade gives no fortune right away, but maxes out at {(upgrade.max ?? 0).toLocaleString()} fortune as
				you upgrade it later.
			</p>
		{/if}
	</div>
</Popover.Mobile>
