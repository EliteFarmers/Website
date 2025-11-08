<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { LeaderboardDto } from '$lib/api';
	import * as Select from '$ui/select';
	import { utc, UTCDate } from '@date-fns/utc';
	import { endOfISOWeek, getISOWeek } from 'date-fns';
	import { SvelteDate, SvelteURLSearchParams } from 'svelte/reactivity';

	interface Props {
		leaderboard: LeaderboardDto;
	}

	let { leaderboard }: Props = $props();

	let firstInterval = $derived(leaderboard.firstInterval);
	let currentInterval = $derived(leaderboard.interval);

	let isMonthly = $derived(leaderboard.id.endsWith('-monthly'));
	let isWeekly = $derived(leaderboard.id.endsWith('-weekly'));

	let lastInterval = $derived.by(() => {
		if (isWeekly) {
			const weekEnd = endOfISOWeek(new UTCDate(), { in: utc });
			return weekEnd.toISOString().split('T')[0];
		}

		if (isMonthly) {
			return new UTCDate().toISOString().split('T')[0];
		}

		return undefined;
	});

	let options: { label: string; year: number; month: string; week?: number; value: string }[] = $derived.by(() => {
		if (!firstInterval || !lastInterval) return [];
		if (isWeekly) {
			const options = [];
			// First interval format: 2025-W45
			const [startYear, startWeek] = firstInterval.split('-W').map(Number);
			const startDate = new SvelteDate(Date.UTC(startYear, 0, 1));
			startDate.setUTCDate(startDate.getUTCDate() + (startWeek - 1) * 7);

			const endDate = new SvelteDate(lastInterval);
			const currentDate = new SvelteDate(endDate);

			while (currentDate >= startDate) {
				const year = currentDate.getUTCFullYear();
				const month = currentDate.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
				const weekNumber = getISOWeek(currentDate);

				options.push({
					label: `${month} ${year} - W${weekNumber}`,
					year: year,
					month: month,
					week: weekNumber,
					value: `${year}-W${String(weekNumber).padStart(2, '0')}`,
				});

				// Move to previous week
				currentDate.setUTCDate(currentDate.getUTCDate() - 7);
			}

			return options;
		}

		const [startYear, startMonth] = firstInterval.split('-').map(Number);
		const [endYear, endMonth] = lastInterval.split('-').map(Number);

		const options = [];
		for (let year = endYear; year >= startYear; year--) {
			for (
				let month = year === endYear ? endMonth : 12;
				month >= (year === startYear ? startMonth : 1);
				month--
			) {
				const label = new Date(Date.UTC(year, month - 1)).toLocaleString('default', {
					year: 'numeric',
					month: 'long',
					timeZone: 'UTC',
				});

				const monthName = new Date(Date.UTC(year, month - 1)).toLocaleString('default', {
					month: 'long',
					timeZone: 'UTC',
				});

				options.push({
					label: label,
					year: year,
					month: monthName,
					value: `${year}-${String(month).padStart(2, '0')}`,
				});
			}
		}

		return options;
	});
</script>

{#if isMonthly}
	<Select.Simple
		{options}
		size="sm"
		value={currentInterval}
		disabled={options.length === 1}
		change={(interval) => {
			if (isMonthly && lastInterval) {
				goto(
					`${page.url.pathname}?${new SvelteURLSearchParams({
						...Object.fromEntries(page.url.searchParams),
						interval: interval ?? lastInterval,
					})}`
				);
			}
		}}
	>
		{#snippet option({ year, month })}
			<div class="flex items-center justify-between gap-2">
				<span class="font-semibold">{year}</span><span>{month}</span>
			</div>
		{/snippet}
	</Select.Simple>
{/if}

{#if isWeekly}
	<Select.Simple
		{options}
		size="sm"
		value={currentInterval}
		disabled={options.length === 1}
		change={(interval) => {
			if (isWeekly && lastInterval) {
				goto(
					`${page.url.pathname}?${new SvelteURLSearchParams({
						...Object.fromEntries(page.url.searchParams),
						interval: interval ?? lastInterval,
					})}`
				);
			}
		}}
	>
		{#snippet option({ year, month, week })}
			<div class="flex items-center justify-between gap-2">
				<span class="font-semibold">{year}-<span>W{week}</span></span><span>{month}</span>
			</div>
		{/snippet}
	</Select.Simple>
{/if}
