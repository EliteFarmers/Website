<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Select from '$ui/select';
	import { utc, UTCDate } from '@date-fns/utc';
	import { endOfISOWeek, getISOWeek } from 'date-fns';
	import { SvelteDate, SvelteURLSearchParams } from 'svelte/reactivity';

	interface IntervalSource {
		id: string;
		firstInterval?: string | null;
		interval?: string | null;
	}

	interface Props {
		leaderboard: IntervalSource;
		value?: string | null | undefined;
		param?: string;
		onChange?: (interval: string | undefined) => void;
	}

	let { leaderboard, value = undefined, param = 'interval', onChange }: Props = $props();

	const firstInterval = $derived.by(() => leaderboard.firstInterval ?? undefined);
	const currentInterval = $derived.by(() => value ?? leaderboard.interval ?? undefined);
	const isMonthly = $derived.by(() => leaderboard.id.endsWith('-monthly'));
	const isWeekly = $derived.by(() => leaderboard.id.endsWith('-weekly'));

	const lastInterval = $derived.by(() => {
		if (isWeekly) {
			const weekEnd = endOfISOWeek(new UTCDate(), { in: utc });
			return weekEnd.toISOString().split('T')[0];
		}

		if (isMonthly) {
			return new UTCDate().toISOString().split('T')[0];
		}

		return undefined;
	});

	const options = $derived.by(() => {
		if (!firstInterval || !lastInterval)
			return [] as {
				label: string;
				year: number;
				month: string;
				week?: number;
				value: string;
			}[];

		if (isWeekly) {
			const weeklyOptions: {
				label: string;
				year: number;
				month: string;
				week: number;
				value: string;
			}[] = [];
			const [startYear, startWeek] = firstInterval.split('-W').map(Number);
			const startDate = new SvelteDate(Date.UTC(startYear, 0, 1));
			startDate.setUTCDate(startDate.getUTCDate() + (startWeek - 1) * 7);

			const endDate = new SvelteDate(lastInterval);
			const currentDate = new SvelteDate(endDate);

			while (currentDate >= startDate) {
				const year = currentDate.getUTCFullYear();
				const month = currentDate.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
				const weekNumber = getISOWeek(currentDate);

				weeklyOptions.push({
					label: `${month} ${year} - W${weekNumber}`,
					year,
					month,
					week: weekNumber,
					value: `${year}-W${String(weekNumber).padStart(2, '0')}`,
				});

				currentDate.setUTCDate(currentDate.getUTCDate() - 7);
			}

			return weeklyOptions;
		}

		const [startYear, startMonth] = firstInterval.split('-').map(Number);
		const [endYear, endMonth] = lastInterval.split('-').map(Number);
		const monthlyOptions: {
			label: string;
			year: number;
			month: string;
			week?: number;
			value: string;
		}[] = [];

		for (let year = endYear; year >= startYear; year--) {
			const monthStart = year === startYear ? startMonth : 1;
			const monthEnd = year === endYear ? endMonth : 12;
			for (let month = monthEnd; month >= monthStart; month--) {
				const date = new SvelteDate(Date.UTC(year, month - 1, 1));
				monthlyOptions.push({
					label: date.toLocaleString('default', {
						month: 'long',
						year: 'numeric',
						timeZone: 'UTC',
					}),
					year,
					month: date.toLocaleString('default', {
						month: 'long',
						timeZone: 'UTC',
					}),
					value: `${year}-${String(month).padStart(2, '0')}`,
				});
			}
		}

		return monthlyOptions;
	});

	function updateInterval(next?: string | null) {
		const fallback = next ?? lastInterval ?? undefined;
		if (fallback === currentInterval) return;
		if (onChange) {
			onChange(fallback);
			return;
		}

		const params = new SvelteURLSearchParams({
			...Object.fromEntries(page.url.searchParams),
		});

		if (fallback) {
			params.set(param, fallback);
		} else {
			params.delete(param);
		}

		goto(`${page.url.pathname}?${params}`);
	}
</script>

{#if isMonthly && options.length}
	<Select.Simple {options} size="sm" value={currentInterval} disabled={options.length === 1} change={updateInterval}>
		{#snippet option({ year, month })}
			<div class="flex items-center justify-between gap-2">
				<span class="font-semibold">{year}</span><span>{month}</span>
			</div>
		{/snippet}
	</Select.Simple>
{/if}

{#if isWeekly && options.length}
	<Select.Simple {options} size="sm" value={currentInterval} disabled={options.length === 1} change={updateInterval}>
		{#snippet option({ year, month, week })}
			<div class="flex items-center justify-between gap-2">
				<span class="font-semibold">{year}-<span>W{week}</span></span><span>{month}</span>
			</div>
		{/snippet}
	</Select.Simple>
{/if}
