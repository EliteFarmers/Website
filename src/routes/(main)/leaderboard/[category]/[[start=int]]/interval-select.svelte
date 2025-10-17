<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { LeaderboardDto } from '$lib/api';
	import * as Select from '$ui/select';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	interface Props {
		leaderboard: LeaderboardDto;
	}

	let { leaderboard }: Props = $props();

	let firstInterval = $derived(leaderboard.firstInterval);
	let currentInterval = $derived(leaderboard.interval);

	let isMonthly = $derived(leaderboard.id.endsWith('-monthly'));

	let lastInterval = $derived.by(() => {
		if (!isMonthly) return undefined;
		const now = new Date();
		return now.toISOString().split('T')[0];
	});

	let options = $derived.by(() => {
		if (!isMonthly || !firstInterval || !lastInterval) return [];
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
