<script lang="ts">
	import { CROP_FORTUNE_STATS, Stat, type FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		totalCost: number;
		value?: number;
	}

	let { upgrade, totalCost, value }: Props = $props();

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
		// Fall back to the largest non-zero non-fortune stat (e.g. Overbloom)
		let best: { stat: Stat; value: number } | undefined;
		for (const [statKey, value] of Object.entries(upgrade.stats)) {
			if (!value) continue;
			if (!best || Math.abs(value as number) > Math.abs(best.value)) {
				best = { stat: statKey as Stat, value: value as number };
			}
		}
		if (best) return best;
		return { stat: Stat.FarmingFortune, value: upgrade.increase ?? 0 };
	});

	const increase = $derived(value ?? (upgrade.increase || primaryStat.value || 0));
	const costPer = $derived.by(() => {
		const cost = increase > 0 ? Math.round(totalCost / increase) : 0;

		if (cost === 0 && upgrade.stats) {
			return (upgrade.max ?? increase) > 0 ? Math.round(totalCost / (upgrade.max ?? increase)) : 0;
		}
		return cost;
	});

	function costPerFortune(fortune: number, totalCost: number): number {
		if (fortune <= 0) return 0;
		return Math.round(totalCost / fortune);
	}

	const copper = $derived(
		costPerFortune(increase, (upgrade.cost?.copper ?? 0) + (upgrade.cost?.applyCost?.copper ?? 0))
	);
	const bits = $derived(costPerFortune(increase, (upgrade.cost?.bits ?? 0) + (upgrade.cost?.applyCost?.bits ?? 0)));
	const kernels = $derived(
		costPerFortune(increase, (upgrade.cost?.kernels ?? 0) + (upgrade.cost?.applyCost?.kernels ?? 0))
	);
</script>

{#if copper > 0}
	<p class="text-sm">
		<span class="dark:text-completed">{copper.toLocaleString()}</span>
		<span class="text-muted-foreground">copper</span>
	</p>
{:else if bits > 0}
	<p class="text-sm">
		<span class="dark:text-completed">{bits.toLocaleString()}</span>
		<span class="text-muted-foreground">bits</span>
	</p>
{:else if kernels > 0}
	<p class="text-sm">
		<span class="dark:text-completed">{kernels.toLocaleString()}</span>
		<span class="text-muted-foreground">kernel{kernels === 1 ? '' : 's'}</span>
	</p>
{/if}
{#if costPer > 0}
	<span>
		<span class="dark:text-completed text-right font-semibold">{Math.round(costPer).toLocaleString()}</span>
		<span class="text-muted-foreground"> coins </span>
	</span>
{/if}
{#if copper === 0 && bits === 0 && costPer === 0}
	<span class="text-muted-foreground">Not Available</span>
{/if}
