<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import Faq from '$comp/faq.svelte';
	import BreakdownChart from '$comp/tools/global-stats/breakdown-chart.svelte';
	import TrendChart from '$comp/tools/global-stats/trend-chart.svelte';
	import ToolPage from '$comp/tools/tool-page.svelte';
	import {
		breakdown,
		compact,
		comparison,
		fullDate,
		metricValue,
		STATS_RANGES,
		trendPoints,
		type Metric,
	} from '$lib/tools/global-stats';
	import * as Alert from '$ui/alert';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import { DatePicker } from '$ui/date-picker';
	import { parseDate } from '@internationalized/date';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let refreshing = $state(false);
	let busy = $derived(refreshing || navigating.to?.url.pathname === '/tools/global-stats');
	let current = $derived(data.summary?.current);
	let previous = $derived(data.summary?.previous);
	let points = $derived(data.points ?? []);
	let hasData = $derived(points.length > 0 || current?.updatedAt != null);
	let from = $derived(
		data.from ??
			(current?.from != null
				? Number(current.from)
				: points.length
					? Math.min(...points.map((point) => Number(point.timestamp)))
					: undefined)
	);
	let updatedAt = $derived(
		Math.max(Number(current?.updatedAt ?? 0), ...points.map((point) => Number(point.updatedAt)))
	);
	const metrics: { key: Metric; label: string; unit: string }[] = [
		{ key: 'npc', label: 'Total NPC value', unit: 'Estimated coins' },
		{ key: 'crops', label: 'Crop collection', unit: 'Items collected' },
		{ key: 'skills', label: 'Skill XP gained', unit: 'Across tracked skills' },
		{ key: 'pests', label: 'Pests killed', unit: 'Recorded kills' },
	];
	async function refresh() {
		refreshing = true;
		try {
			await invalidate('global-stats:data');
		} finally {
			refreshing = false;
		}
	}
</script>

<ToolPage title="Global Stats" description="Collection, skill XP, and NPC value across players tracked by Elite.">
	{#snippet actions()}
		<Button variant="outline" size="sm" onclick={refresh} disabled={busy}>
			<RefreshCw class={busy ? 'size-4 animate-spin' : 'size-4'} aria-hidden="true" /> Refresh
		</Button>
	{/snippet}

	<div
		class="sticky top-16 z-20 -mx-2 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-2 py-3 backdrop-blur supports-backdrop-filter:bg-background/80"
	>
		<nav class="flex flex-wrap gap-1" aria-label="Stats date range">
			{#each STATS_RANGES as range (range.value)}
				{@const keepStart =
					range.value !== 'today' &&
					range.value !== 'all' &&
					data.start &&
					data.from !== undefined &&
					data.from + (Number(range.value) - 1) * 86_400 <= data.today}
				<Button
					href={`${resolve('/tools/global-stats')}?range=${range.value}${keepStart ? `&start=${data.start}` : ''}`}
					variant={data.range === range.value ? 'secondary' : 'ghost'}
					size="sm"
					class="px-2 sm:px-3"
					aria-current={data.range === range.value ? 'page' : undefined}
					>{range.value === 'today' && data.range === 'today' && data.from !== data.today
						? '1 day'
						: range.label}</Button
				>
			{/each}
		</nav>
		<div class="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Start date">
			<DatePicker
				class="w-fit min-w-40"
				minValue={parseDate('2023-07-15')}
				maxValue={parseDate(new Date(data.today * 1000).toISOString().slice(0, 10))}
				bind:value={
					() =>
						from === undefined ? undefined : parseDate(new Date(from * 1000).toISOString().slice(0, 10)),
					(value) => {
						if (value)
							void goto(
								`${resolve('/tools/global-stats')}?range=${data.range}&start=${value.toString()}`,
								{ noScroll: true, keepFocus: true }
							);
					}
				}
			/>
			<p class="text-xs text-muted-foreground" aria-live="polite">
				{#if busy}Loading stats…{:else if from !== undefined}{fullDate(from)}{from !== data.to
						? ` - ${fullDate(data.to)}`
						: ''}{:else}All recorded days{/if}
			</p>
		</div>
	</div>

	{#if data.points === null || data.summary === null}
		<Alert.Root variant="destructive">
			<Alert.Title
				>{data.points === null && data.summary === null
					? 'Stats are temporarily unavailable'
					: 'Some stats could not be loaded'}</Alert.Title
			>
			<Alert.Description
				>{data.points === null ? 'Charts could not be loaded. ' : ''}{data.summary === null
					? 'Period totals could not be loaded. '
					: ''}Try refreshing in a moment.</Alert.Description
			>
		</Alert.Root>
	{/if}

	<div class="flex min-w-0 flex-col gap-6" aria-busy={busy}>
		{#if hasData}
			{#if current && current.updatedAt != null}
				<dl class="grid grid-cols-2 gap-x-5 gap-y-6 border-b pb-6 lg:grid-cols-4">
					{#each metrics as metric (metric.key)}
						{@const value = metricValue(current, metric.key)}
						{@const change = comparison(
							value,
							previous?.updatedAt != null ? metricValue(previous, metric.key) : undefined
						)}
						<div class="min-w-0 space-y-1.5">
							<dt class="text-sm text-muted-foreground">{metric.label}</dt>
							<dd
								class="text-2xl font-semibold tabular-nums md:text-3xl"
								title={value.toLocaleString('en')}
							>
								{compact(value)}
							</dd>
							<dd class="text-xs text-muted-foreground">{metric.unit}</dd>
							{#if change}<dd class="pt-1 text-xs">
									<span class="font-medium tabular-nums">{change}</span>
									<span class="text-muted-foreground"
										>{data.range === 'today'
											? data.from === data.today
												? 'vs yesterday'
												: 'vs previous day'
											: 'vs previous period'}</span
									>
								</dd>{/if}
						</div>
					{/each}
				</dl>
			{/if}

			<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
				{#if updatedAt > 0}<span
						>Updated {new Intl.DateTimeFormat('en', {
							dateStyle: 'medium',
							timeStyle: 'short',
							timeZone: 'UTC',
						}).format(updatedAt * 1000)} UTC</span
					>{/if}
				<span
					>{data.interval === 'week'
						? 'Weekly totals'
						: data.interval === 'hour'
							? 'Hourly totals'
							: 'Daily totals'}</span
				>
			</div>
			{#if current?.npcPricesComplete === false || points.some((point) => !point.npcPricesComplete)}
				<Alert.Root
					><Alert.Title>Some NPC prices are unavailable</Alert.Title><Alert.Description
						>NPC values for this period are incomplete and may understate the total.</Alert.Description
					></Alert.Root
				>
			{/if}

			{#if data.points !== null}
				<TrendChart
					interval={data.interval}
					title="NPC value over time"
					npc
					data={trendPoints(points, 'npc', from, data.chartTo, data.interval)}
					unit="Coins"
					color="var(--color-wheat)"
					tall
				/>
			{/if}
			{#if current && current.updatedAt != null}
				<Card.Root class="gap-4 rounded-md border-2 p-4 shadow-none md:p-5">
					<div>
						<h2 class="text-lg">Generated NPC Value Breakdown</h2>
					</div>
					{#if current.totalNpcValue > 0}<div
							class="flex h-3 overflow-hidden rounded-xs bg-muted"
							aria-hidden="true"
						>
							<div
								class="bg-wheat"
								style:width={`${(current.totalCropNpcValue / current.totalNpcValue) * 100}%`}
							></div>
							<div
								class="bg-progress"
								style:width={`${(current.totalPestNpcCoins / current.totalNpcValue) * 100}%`}
							></div>
						</div>{/if}
					<dl class="grid gap-4 sm:grid-cols-2">
						<div>
							<dt class="flex items-center gap-2 text-sm text-muted-foreground">
								<span class="size-2 rounded-xs bg-wheat" aria-hidden="true"></span>Crop NPC sell value
							</dt>
							<dd class="mt-1 text-xl tabular-nums">
								{compact(current.totalCropNpcValue)}
								<span class="text-xs text-muted-foreground">coins</span>
							</dd>
						</div>
						<div>
							<dt class="flex items-center gap-2 text-sm text-muted-foreground">
								<span class="size-2 rounded-xs bg-progress" aria-hidden="true"></span>Pest NPC coin
								rewards
							</dt>
							<dd class="mt-1 text-xl tabular-nums">
								{compact(current.totalPestNpcCoins)}
								<span class="text-xs text-muted-foreground">coins</span>
							</dd>
						</div>
					</dl>
				</Card.Root>
			{/if}
			{#if data.points !== null}
				<div class="grid min-w-0 gap-4 xl:grid-cols-2">
					<TrendChart
						interval={data.interval}
						title="Crop collection"
						data={trendPoints(points, 'crops', from, data.chartTo, data.interval)}
						unit="Items"
					/>
					<TrendChart
						interval={data.interval}
						title="Skill XP"
						data={trendPoints(points, 'skills', from, data.chartTo, data.interval)}
						unit="XP"
						color="var(--primary)"
					/>
				</div>
			{/if}
			{#if current && current.updatedAt != null}
				<div class="grid items-start gap-4 md:grid-cols-2">
					<BreakdownChart
						title="Collection Gain Per Crop"
						rows={breakdown(current.crops)}
						unit="Items"
						crops
					/>
					<BreakdownChart
						title="NPC Value Generated Per Crop"
						rows={breakdown(current.cropNpcValues)}
						unit="Coins"
						crops
					/>
					<BreakdownChart
						title="Coin Rewards Per Pest"
						rows={breakdown(current.pestNpcCoins)}
						unit="Coins"
						pests
					/>
					<BreakdownChart title="XP Gained Per Skill" rows={breakdown(current.skills)} unit="XP" />
				</div>
			{/if}
		{:else if data.points !== null && data.summary !== null}
			<Card.Root class="items-center gap-2 rounded-md border-2 px-5 py-12 text-center shadow-none"
				><h2 class="text-lg">No recorded progress in this period</h2>
				<p class="text-sm text-muted-foreground">Choose a longer date range to explore earlier activity.</p>
				<Button variant="outline" href={`${resolve('/tools/global-stats')}?range=all`}>View all time</Button
				></Card.Root
			>
		{/if}
	</div>

	<Faq
		items={[
			{
				question: 'What does NPC value measure?',
				answer: 'NPC value combines the estimated NPC sell value of collected crops with NPC coin rewards from pests (each pest kill deposits 10,000 coins directly to your purse). Crop sell value is potential revenue. It does not confirm that crops were sold.',
			},
			{
				question: 'Whose progress is included?',
				answer: "Stats include players whose data was recorded by Elite, not every SkyBlock player. Gains are recorded when profiles update, so activity can appear later than it happened. For example, if someone's stats were loaded 3 days ago, and then loaded again today, all of the increases in their numbers would be attributed to today.",
			},
			{
				question: 'How do the date ranges work?',
				answer: 'All dates use the UTC timezone, with weeks starting on Monday. The darker bar on the right is the current, incomplete period (for example, today).',
			},
			{
				question: 'What does the contributor line show?',
				answer: "The contributor count is the amount of profile members that were updated and contributed any amount of increase for that day, or averaged for a week. This isn't a count of unique players, though it's likely close due to not many players actively playing on more than one profile.",
			},
			{
				question: 'Why are there gaps?',
				answer: 'A gap means no observations were available for that period, not necessarily no activity. For example, at the start of the all-time data, there are a few gaps due to a bug that prevented data from saving in the Elite API.',
			},
			{
				question: 'How accurate is this data?',
				answer:
					"It's accurate, but only to the extent that data was actually recorded by Elite. Elite does not poll players for changes, these updates trickle in over time as the website is used and players interact with it." +
					'Compared to Hypixel, Elite data is missing players with collections API off, and generally just includes less players due to them never being searched for. However, these numbers are still surprisingly close to the data that Hypixel has shared in the past',
			},
			{
				question: 'Can I use this data in a video/project?',
				answer: 'Yes, you are free to use the data in videos or projects, but please give appropriate credit to Elite for the data source. Reach out to us if you have any questions.',
			},
		]}
	/>
</ToolPage>
