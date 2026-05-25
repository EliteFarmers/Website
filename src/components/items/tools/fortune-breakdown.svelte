<script lang="ts">
	import StatBreakdownDialog from '$comp/rates/stat-breakdown-dialog.svelte';
	import { getStatColor } from '$lib/format';
	import { cn } from '$lib/utils';
	import { STAT_ICONS, Stat } from 'farming-weight';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		title?: string;
		stat?: Stat;
		total?: number | undefined;
		breakdown?: Record<string, number | { value: number; stat: Stat }> | undefined;
		enabled?: boolean;
		small?: boolean;
		max?: number;
		child?: import('svelte').Snippet | undefined;
		children?: import('svelte').Snippet;
		class?: string;
	}

	let {
		title = 'Farming Fortune Breakdown',
		stat = undefined,
		total = undefined,
		breakdown = undefined,
		enabled = true,
		small = false,
		max = undefined,
		class: className,
		child,
		children,
	}: Props = $props();

	let list = $derived(
		Object.entries(breakdown ?? {})
			.map(([k, v]) => {
				if (typeof v === 'number') return { key: k, value: v, stat: Stat.FarmingFortune };
				return { key: k, value: v.value, stat: v.stat };
			})
			.sort((a, b) => b.value - a.value)
	);

	let primaryStatAndTotal = $derived.by(() => {
		if (total !== undefined && Number.isFinite(total)) {
			return { stat: stat ?? Stat.FarmingFortune, total };
		}

		const hasStatInfo = list.some((entry) => entry.stat !== undefined);

		if (hasStatInfo) {
			const totals = new SvelteMap<Stat, number>();
			for (const entry of list) {
				if (!entry.stat) continue;
				totals.set(entry.stat, (totals.get(entry.stat) ?? 0) + entry.value);
			}

			const farmingFortune = totals.get(Stat.FarmingFortune) ?? 0;
			if (farmingFortune !== 0) {
				return { stat: Stat.FarmingFortune, total: farmingFortune };
			}

			let pickedStat: Stat = Stat.FarmingFortune;
			let pickedTotal = 0;
			for (const [stat, value] of totals.entries()) {
				if (value > pickedTotal) {
					pickedStat = stat;
					pickedTotal = value;
				}
			}

			return { stat: pickedStat, total: pickedTotal };
		}

		const legacyTotal = total ?? list.reduce((acc, entry) => acc + entry.value, 0);
		return { stat: stat ?? Stat.FarmingFortune, total: legacyTotal };
	});

	let primaryStat = $derived(primaryStatAndTotal.stat);
	let sum = $derived(primaryStatAndTotal.total);
	let maxed = $derived(max !== undefined && sum >= max);

	const safeNumber = (value: number | undefined | null) => (Number.isFinite(value ?? NaN) ? (value as number) : 0);
	let displaySum = $derived(safeNumber(sum));

	let statColor = $derived(
		primaryStat !== Stat.FarmingFortune ? getStatColor(primaryStat, enabled ? 1 : 0.4) : undefined
	);

	let background = $derived(
		enabled
			? maxed
				? (statColor ?? 'bg-completed')
				: sum < 0
					? 'bg-destructive'
					: (statColor ?? 'bg-progress')
			: maxed
				? (statColor ?? 'bg-completed/40')
				: sum < 0
					? 'bg-destructive/40'
					: (statColor ?? 'bg-progress/40')
	);
</script>

{#if list.length <= 0 && !child}
	<div
		class={cn(
			'relative flex max-h-fit min-h-4 max-w-fit flex-row items-center gap-1.5 rounded-md px-1',
			background,
			className
		)}
	>
		<span>{STAT_ICONS[primaryStat] ?? STAT_ICONS[Stat.FarmingFortune]}</span>
		<span class="relative {small ? 'md:text-md text-sm' : 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none">
			{(+displaySum.toFixed(2)).toLocaleString()}
		</span>
	</div>
{:else}
	<StatBreakdownDialog {title} stat={primaryStat} total={sum} {breakdown}>
		{#snippet trigger({ props })}
			<button
				{...props}
				class={cn(
					'relative flex h-fit min-h-4 flex-row items-center gap-1.5 rounded-md px-1',
					background,
					className
				)}
			>
				<span>{STAT_ICONS[primaryStat] ?? STAT_ICONS[Stat.FarmingFortune]}</span>
				<span
					class="relative {small
						? 'md:text-md text-sm'
						: 'text-md md:text-lg'} z-10 pr-1 font-mono leading-none"
				>
					{(+displaySum.toFixed(2)).toLocaleString()}
				</span>
			</button>
		{/snippet}
		{#if child}
			{@render child?.()}
		{:else}
			{@render children?.()}
		{/if}
	</StatBreakdownDialog>
{/if}
