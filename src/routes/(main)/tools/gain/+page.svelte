<script lang="ts">
	import Head from '$comp/head.svelte';
	import PlayerProfilePicker from '$comp/tools/player-profile-picker.svelte';
	import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getCollectionSnapshots, getPlayerGuildData, getSkillSnapshots } from '$lib/remote';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { DatePicker } from '$ui/date-picker';
	import * as Popover from '$ui/popover';
	import * as Table from '$ui/table';
	import * as Tabs from '$ui/tabs';
	import { Walkthrough } from '$ui/walkthrough';
	import type { Step } from '$ui/walkthrough/ctx';
	import { utc } from '@date-fns/utc';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { addHours, fromUnixTime, getUnixTime, startOfDay } from 'date-fns';
	import { CROP_TO_PEST, getCropDisplayName, getCropFromName, type Crop } from 'farming-weight';
	import { BarChart, Tooltip } from 'layerchart';

	const GEXP_PER_HOUR = 9_000;
	const GAIN_WINDOW_DAYS = 9;
	const WALKTHROUGH_KEY = 'gain-tracker-walkthrough-seen';

	interface ProfileEntry {
		id: string;
		name: string;
		selected: boolean;
	}

	interface CollectionSnapshot {
		timestamp: number;
		cropWeight: number;
		crops: Record<string, number>;
		pests: Record<string, number>;
	}

	interface SkillSnapshot {
		timestamp: number;
		skills: Record<string, number>;
	}

	interface DayProgress {
		date: number;
		dateLabel: string;
		crops: Record<string, number>;
		pests: Record<string, number>;
		weight: number;
	}

	interface SkillDayProgress {
		date: number;
		dateLabel: string;
		skills: Record<string, number>;
		totalXp: number;
	}

	interface UptimeDayProgress {
		date: number;
		dateLabel: string;
		gexp: number;
		hours: number;
	}

	let loading = $state(false);
	let error = $state('');
	let playerName = $state('');
	let profileName = $state('');
	let playerUuid = $state('');
	let profileUuid = $state('');
	let profiles = $state<ProfileEntry[]>([]);
	let activeTab = $state<'crops' | 'skills' | 'uptime'>('crops');

	let cropDays = $state<DayProgress[]>([]);
	let skillDays = $state<SkillDayProgress[]>([]);
	let uptimeDays = $state<UptimeDayProgress[]>([]);
	let guildName = $state('');
	let guildId = $state('');
	let loadedRangeLabel = $state('');

	let walkthroughOpen = $state(typeof localStorage !== 'undefined' ? !localStorage.getItem(WALKTHROUGH_KEY) : false);

	function completeWalkthrough() {
		if (typeof localStorage !== 'undefined') localStorage.setItem(WALKTHROUGH_KEY, '1');
	}

	const walkthroughSteps: Step[] = [
		{
			target: 'gain-player-search',
			title: 'Search for a Player',
			description: 'Type an IGN to look up their farming data. Profiles are selected automatically.',
			position: 'bottom',
		},
		{
			target: 'gain-date-window',
			title: 'Pick a Date Window',
			description: 'Choose the start of a 9-day range. Use the arrows or pick a specific date.',
			position: 'bottom',
		},
		{
			target: 'gain-tabs',
			title: 'Switch Between Tabs',
			description: 'View Crop gains, Skill XP, or estimated Uptime from guild EXP history.',
			position: 'top',
		},
	];

	const tz = getLocalTimeZone();
	const minDate = new CalendarDate(2023, 7, 1);
	const maxStartDate = today(tz).subtract({ days: GAIN_WINDOW_DAYS - 1 });

	let selectedStart = $state(maxStartDate);

	const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
	const rangeFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	const tooltipFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	const chartPadding = { left: 60, bottom: 24, top: 10, right: 10 };
	const chartTickLabelProps = { class: 'stroke-0! font-normal! text-xs md:text-sm' };

	const selectedEnd = $derived(selectedStart.add({ days: GAIN_WINDOW_DAYS - 1 }));
	const selectedRangeLabel = $derived.by(() => formatDateRange(selectedStart.toDate(tz), selectedEnd.toDate(tz)));
	const backDisabled = $derived(selectedStart <= minDate);
	const forwardDisabled = $derived(selectedStart >= maxStartDate);
	const windowDirty = $derived(Boolean(playerUuid && loadedRangeLabel && loadedRangeLabel !== selectedRangeLabel));

	const cropChartData = $derived(
		cropDays.map((day) => ({ date: day.date, label: day.dateLabel, value: day.weight }))
	);
	const skillChartData = $derived(
		skillDays.map((day) => ({ date: day.date, label: day.dateLabel, value: day.totalXp }))
	);
	const uptimeChartData = $derived(
		uptimeDays.map((day) => ({ date: day.date, label: day.dateLabel, value: day.hours }))
	);

	const totalWeight = $derived(cropDays.reduce((sum, day) => sum + day.weight, 0));
	const avgWeight = $derived(cropDays.length ? totalWeight / cropDays.length : 0);
	const totalXp = $derived(skillDays.reduce((sum, day) => sum + day.totalXp, 0));
	const avgXp = $derived(skillDays.length ? totalXp / skillDays.length : 0);
	const totalGexp = $derived(uptimeDays.reduce((sum, day) => sum + day.gexp, 0));
	const avgGexp = $derived(uptimeDays.length ? totalGexp / uptimeDays.length : 0);

	async function onPlayerLoaded() {
		await fetchData();
	}

	async function fetchData() {
		if (!playerUuid || !profileUuid) return;

		const requestedStart = selectedStart;
		const requestedEnd = requestedStart.add({ days: GAIN_WINDOW_DAYS - 1 });
		const rangeStartDay = getCalendarDayTimestamp(requestedStart);
		const rangeEndDay = getCalendarDayTimestamp(requestedEnd);

		loading = true;
		error = '';
		guildName = '';
		guildId = '';
		cropDays = [];
		skillDays = [];
		uptimeDays = [];

		try {
			const [cropResult, skillResult, guildResult] = await Promise.all([
				getCollectionSnapshots({
					playerUuid,
					profileUuid,
					start: Math.floor(requestedStart.toDate(tz).getTime() / 1000),
					days: GAIN_WINDOW_DAYS,
				}).catch(() => null),
				getSkillSnapshots({
					playerUuid,
					profileUuid,
					start: Math.floor(requestedStart.toDate(tz).getTime() / 1000),
					days: GAIN_WINDOW_DAYS,
				}).catch(() => null),
				getPlayerGuildData({ playerUuid }).catch(() => null),
			]);

			if (cropResult) {
				cropDays = processCropData(cropResult as CollectionSnapshot[]);
			}

			if (skillResult) {
				skillDays = processSkillData(skillResult as SkillSnapshot[]);
			}

			if (guildResult) {
				guildName = guildResult.guildName ?? '';
				guildId = guildResult.guildId ?? '';
				if (guildResult.expHistory) {
					uptimeDays = processUptimeData(guildResult.expHistory, rangeStartDay, rangeEndDay);
				}
			}

			loadedRangeLabel = formatDateRange(requestedStart.toDate(tz), requestedEnd.toDate(tz));
		} catch {
			error = 'Failed to fetch gain data.';
		} finally {
			loading = false;
		}
	}

	function previousWindow() {
		if (selectedStart <= minDate) return;
		const nextStart = selectedStart.subtract({ days: GAIN_WINDOW_DAYS });
		selectedStart = nextStart < minDate ? minDate : nextStart;
	}

	function nextWindow() {
		if (selectedStart >= maxStartDate) return;
		const nextStart = selectedStart.add({ days: GAIN_WINDOW_DAYS });
		selectedStart = nextStart > maxStartDate ? maxStartDate : nextStart;
	}

	function processCropData(collections: CollectionSnapshot[]): DayProgress[] {
		const dataPoints = [...collections].sort((a, b) => +(a.timestamp ?? 0) - +(b.timestamp ?? 0));
		const days: DayProgress[] = [];

		for (let i = 0; i < dataPoints.length; i++) {
			const point = dataPoints[i];
			const lastPoint = dataPoints.at(i + 1) ?? point;
			const cropGains = calculateGains(lastPoint.crops, point.crops);
			const pestGains = calculateGains(lastPoint.pests, point.pests);
			const date = getDateFromTimestamp(lastPoint.timestamp);

			days.push({
				date,
				dateLabel: dateFormatter.format(new Date(date * 1000)),
				crops: cropGains,
				pests: pestGains,
				weight: +(lastPoint.cropWeight ?? 0) - +(point.cropWeight ?? 0),
			});
		}

		return trimDays(days, (day) => Object.values(day.crops).every((crop) => crop === 0));
	}

	function processSkillData(skills: SkillSnapshot[]): SkillDayProgress[] {
		const dataPoints = [...skills].sort((a, b) => +(a.timestamp ?? 0) - +(b.timestamp ?? 0));
		const days: SkillDayProgress[] = [];

		for (let i = 0; i < dataPoints.length; i++) {
			const point = dataPoints[i];
			const lastPoint = dataPoints.at(i + 1) ?? point;
			const skillGains = calculateGains(lastPoint.skills, point.skills);
			const totalXp = Object.values(skillGains).reduce((sum, value) => sum + Math.max(0, value), 0);
			const date = getDateFromTimestamp(lastPoint.timestamp);

			days.push({
				date,
				dateLabel: dateFormatter.format(new Date(date * 1000)),
				skills: skillGains,
				totalXp,
			});
		}

		return trimDays(days, (day) => Object.values(day.skills).every((skill) => skill === 0));
	}

	function processUptimeData(
		expHistory: Record<string, number>,
		startDay: number,
		endDay: number
	): UptimeDayProgress[] {
		return Object.entries(expHistory)
			.map(([dateStr, gexp]) => {
				const date = parseGuildExpHistoryDate(dateStr);
				if (date === null) return null;
				return {
					date,
					dateLabel: dateFormatter.format(new Date(date * 1000)),
					gexp,
					hours: gexp / GEXP_PER_HOUR,
				};
			})
			.filter((day): day is UptimeDayProgress => day !== null && day.date >= startDay && day.date <= endDay)
			.sort((a, b) => a.date - b.date)
			.slice(-GAIN_WINDOW_DAYS);
	}

	function getDateFromTimestamp(timestamp: number | undefined): number {
		return getUnixTime(addHours(startOfDay(fromUnixTime(timestamp ?? 0, { in: utc }), { in: utc }), 12));
	}

	function calculateGains(
		current: Record<string, number> | undefined,
		previous: Record<string, number> | undefined
	): Record<string, number> {
		return Object.entries(current ?? {}).reduce<Record<string, number>>((gains, [key, value]) => {
			gains[key] = value - (previous?.[key] ?? 0);
			return gains;
		}, {});
	}

	function trimDays<T>(days: T[], isEmpty: (day: T) => boolean): T[] {
		const trimmed = [...days];
		if (trimmed.length > 1 && isEmpty(trimmed.at(-1) as T)) {
			trimmed.pop();
		}
		while (trimmed.length > GAIN_WINDOW_DAYS) {
			trimmed.shift();
		}
		return trimmed;
	}

	function formatDateRange(start: Date, end: Date): string {
		return `${rangeFormatter.format(start)} - ${rangeFormatter.format(end)}`;
	}

	function getCalendarDayTimestamp(date: CalendarDate): number {
		return Math.floor(Date.UTC(date.year, date.month - 1, date.day, 12) / 1000);
	}

	function parseGuildExpHistoryDate(dateStr: string): number | null {
		const numericParts = dateStr
			.split(/\D+/)
			.filter(Boolean)
			.map((part) => Number(part));

		if (numericParts.length >= 3) {
			const [first, second, third] = numericParts;
			if (first >= 1900) {
				return Math.floor(Date.UTC(first, second - 1, third, 12) / 1000);
			}
			if (third >= 1900) {
				return Math.floor(Date.UTC(third, first - 1, second, 12) / 1000);
			}
		}

		const parsed = Date.parse(dateStr);
		if (Number.isNaN(parsed)) return null;

		const date = new Date(parsed);
		return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12) / 1000);
	}

	function formatCompact(num: number): string {
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
		if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
		return num.toFixed(0);
	}

	function formatHours(hours: number): string {
		const wholeHours = Math.floor(hours);
		const minutes = Math.round((hours - wholeHours) * 60);
		return `${wholeHours}h ${minutes}m`;
	}

	function allCrops(crops: Record<string, number>): { name: string; amount: number; img?: string }[] {
		return Object.entries(crops)
			.filter(([, amount]) => amount > 0)
			.sort((a, b) => b[1] - a[1])
			.map(([key, amount]) => {
				const crop = getCropFromName(key);
				const name = crop ? getCropDisplayName(crop) : key;
				return { name, amount, img: PROPER_CROP_TO_IMG[name] };
			});
	}

	function allPests(
		pests: Record<string, number>,
		crops: Record<string, number>
	): { name: string; amount: number; cropName: string }[] {
		return Object.entries(pests)
			.filter(([, amount]) => amount > 0)
			.sort((a, b) => b[1] - a[1])
			.map(([key, amount]) => {
				const cropEntry = Object.entries(CROP_TO_PEST).find(
					([, pest]) => String(pest).toLowerCase() === key.toLowerCase()
				);
				const cropName = cropEntry
					? getCropDisplayName(cropEntry[0] as Crop)
					: key.charAt(0).toUpperCase() + key.slice(1);
				return { name: key.charAt(0).toUpperCase() + key.slice(1), amount, cropName };
			});
	}

	function topCrops(crops: Record<string, number>, limit = 3): { name: string; amount: number; img?: string }[] {
		return allCrops(crops).slice(0, limit);
	}

	function allSkills(skills: Record<string, number>): { name: string; amount: number }[] {
		return Object.entries(skills)
			.filter(([, amount]) => amount > 0)
			.sort((a, b) => b[1] - a[1])
			.map(([key, amount]) => ({
				name: key.charAt(0).toUpperCase() + key.slice(1),
				amount,
			}));
	}

	function topSkills(skills: Record<string, number>, limit = 3): { name: string; amount: number }[] {
		return allSkills(skills).slice(0, limit);
	}

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([{ name: 'Tools', href: '/tools' }, { name: 'Crop Gain Tracker' }]);
	});
</script>

<Head
	title="Crop Gain Tracker | Elite"
	description="View daily crop collection, skill XP, and estimated uptime over a 9-day window."
/>

<Walkthrough bind:open={walkthroughOpen} steps={walkthroughSteps} padding={4} onComplete={completeWalkthrough} />

<div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 py-8">
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="text-3xl font-bold">Crop Gain Tracker</h1>
		<p class="text-muted-foreground max-w-lg text-sm">
			View daily crop collection, skill XP gains, and estimated playtime across any 9-day window.
		</p>
		<Button variant="ghost" size="sm" class="gap-1.5" onclick={() => (walkthroughOpen = true)}>
			<BookOpen class="h-4 w-4" />
			How to use
		</Button>
	</div>

	<div id="gain-player-search">
		<PlayerProfilePicker
			bind:playerUuid
			bind:profileUuid
			bind:playerName
			bind:profileName
			bind:profiles
			bind:loading
			bind:error
			onLoaded={onPlayerLoaded}
		/>
	</div>

	<div id="gain-date-window" class="bg-card w-full max-w-md rounded-lg border p-3">
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<p class="text-xs font-semibold tracking-wide uppercase">Date Window</p>
				<p class="text-muted-foreground text-xs">Choose the start of a fixed 9-day range.</p>
			</div>

			<div class="flex flex-col items-center gap-2 sm:flex-row">
				<Button variant="outline" size="icon" onclick={previousWindow} disabled={backDisabled}>
					<ArrowLeft class="h-4 w-4" />
				</Button>
				<DatePicker bind:value={selectedStart} minValue={minDate} maxValue={maxStartDate} class="w-52" />
				<Button variant="outline" size="icon" onclick={nextWindow} disabled={forwardDisabled}>
					<ArrowRight class="h-4 w-4" />
				</Button>
				<Button type="button" onclick={() => void fetchData()} disabled={!playerUuid || loading}>Update</Button>
			</div>

			<div class="text-center sm:text-left">
				<p class="text-muted-foreground text-xs">Selected window: {selectedRangeLabel}</p>
				{#if windowDirty}
					<p class="text-muted-foreground text-xs">Press Update to load this range.</p>
				{/if}
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center gap-2 py-12">
			<Loader2 class="h-4 w-4 animate-spin" />
			<span class="text-muted-foreground text-sm">Loading...</span>
		</div>
	{:else if playerName}
		<p class="text-muted-foreground text-center text-sm">
			Showing data for <strong>{playerName}</strong> ({profileName})
			{#if loadedRangeLabel}
				<span> &bull; {loadedRangeLabel}</span>
			{/if}
		</p>

		<Tabs.Root bind:value={activeTab} class="w-full" id="gain-tabs">
			<Tabs.List>
				<Tabs.Trigger value="crops">Crop Gains</Tabs.Trigger>
				<Tabs.Trigger value="skills">Skill XP</Tabs.Trigger>
				<Tabs.Trigger value="uptime">Uptime</Tabs.Trigger>
			</Tabs.List>

			<!-- CROP GAINS TAB -->
			<Tabs.Content value="crops">
				{#if cropDays.length === 0}
					<p class="text-muted-foreground py-8 text-center text-sm">
						No crop collection data found for this window. This player may not have farmed recently or has
						Collections API disabled.
					</p>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="bg-card rounded-lg border p-4">
								<p class="text-muted-foreground text-xs font-medium uppercase">Total Weight</p>
								<p class="text-xl font-bold">{totalWeight.toFixed(2)}</p>
							</div>
							<div class="bg-card rounded-lg border p-4">
								<p class="text-muted-foreground text-xs font-medium uppercase">Daily Average</p>
								<p class="text-xl font-bold">{avgWeight.toFixed(2)} / day</p>
							</div>
						</div>

						<div class="bg-card h-[280px] rounded-lg border p-4">
							<BarChart
								data={cropChartData}
								x="label"
								y="value"
								height={248}
								yNice
								padding={chartPadding}
								tooltipContext={{ mode: 'band' }}
								props={{
									bars: { fill: '#4ade80', radius: 6 },
									xAxis: { tickLabelProps: chartTickLabelProps },
									yAxis: {
										format: (value: number) => formatCompact(+value),
										tickLabelProps: chartTickLabelProps,
									},
								}}
							>
								{#snippet tooltip({ context })}
									<Tooltip.Root {context} class="bg-card">
										{#snippet children({ data })}
											<Tooltip.Header>
												{tooltipFormatter.format(new Date(data.date * 1000))}
											</Tooltip.Header>
											<Tooltip.List>
												<Tooltip.Item label="Weight" value={data.value.toFixed(2)} />
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</BarChart>
						</div>

						<div class="bg-card overflow-hidden rounded-lg border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Date</Table.Head>
										<Table.Head class="text-right">Weight</Table.Head>
										<Table.Head>Top Crops</Table.Head>
										<Table.Head class="w-10"></Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each [...cropDays].reverse() as day (day.date)}
										{@const crops = topCrops(day.crops)}
										{@const full = allCrops(day.crops)}
										{@const pests = allPests(day.pests, day.crops)}
										<Table.Row>
											<Table.Cell class="font-mono text-sm">
												{day.dateLabel}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{day.weight.toFixed(2)}
											</Table.Cell>
											<Table.Cell>
												<div class="flex flex-wrap gap-2">
													{#if crops.length > 0}
														{#each crops as crop (crop.name)}
															<span
																class="text-muted-foreground flex items-center gap-1 text-xs"
															>
																{#if crop.img}
																	<img
																		src={crop.img}
																		alt={crop.name}
																		class="pixelated h-4 w-4"
																	/>
																{/if}
																{formatCompact(crop.amount)}
															</span>
														{/each}
														{#if full.length > 3}
															<span class="text-muted-foreground text-xs">
																+{full.length - 3} more
															</span>
														{/if}
													{:else}
														<span class="text-muted-foreground text-xs">
															No crops collected
														</span>
													{/if}
												</div>
											</Table.Cell>
											<Table.Cell>
												{#if full.length > 0}
													<Popover.Root>
														<Popover.Trigger>
															<Button variant="ghost" size="sm" class="h-7 px-2 text-xs">
																View
															</Button>
														</Popover.Trigger>
														<Popover.Content class="w-72">
															<div class="flex flex-col gap-3">
																<div>
																	<p class="mb-1 text-xs font-semibold">
																		All Crop Changes
																	</p>
																	<div class="flex flex-col gap-1">
																		{#each full as crop (crop.name)}
																			<div
																				class="flex items-center justify-between gap-2"
																			>
																				<span
																					class="flex items-center gap-1.5 text-xs"
																				>
																					{#if crop.img}
																						<img
																							src={crop.img}
																							alt={crop.name}
																							class="pixelated h-4 w-4"
																						/>
																					{/if}
																					{crop.name}
																				</span>
																				<span class="font-mono text-xs">
																					{crop.amount.toLocaleString()}
																				</span>
																			</div>
																		{/each}
																	</div>
																</div>
																{#if pests.length > 0}
																	<div>
																		<p class="mb-1 text-xs font-semibold">
																			Pest Kills
																		</p>
																		<div class="flex flex-col gap-1">
																			{#each pests as pest (pest.name)}
																				<div
																					class="flex items-center justify-between gap-2"
																				>
																					<span class="text-xs">
																						{pest.name}
																						<span
																							class="text-muted-foreground"
																							>({pest.cropName})</span
																						>
																					</span>
																					<span class="font-mono text-xs">
																						+{pest.amount.toLocaleString()}
																					</span>
																				</div>
																			{/each}
																		</div>
																	</div>
																{/if}
															</div>
														</Popover.Content>
													</Popover.Root>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				{/if}
			</Tabs.Content>

			<!-- SKILL XP TAB -->
			<Tabs.Content value="skills">
				{#if skillDays.length === 0}
					<p class="text-muted-foreground py-8 text-center text-sm">
						No skill data available for this window.
					</p>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="bg-card rounded-lg border p-4">
								<p class="text-muted-foreground text-xs font-medium uppercase">Total XP</p>
								<p class="text-xl font-bold">{formatCompact(totalXp)}</p>
							</div>
							<div class="bg-card rounded-lg border p-4">
								<p class="text-muted-foreground text-xs font-medium uppercase">Daily Average</p>
								<p class="text-xl font-bold">{formatCompact(avgXp)} / day</p>
							</div>
						</div>

						<div class="bg-card h-70 rounded-lg border p-4">
							<BarChart
								data={skillChartData}
								x="label"
								y="value"
								height={248}
								yNice
								padding={chartPadding}
								tooltipContext={{ mode: 'band' }}
								props={{
									bars: { fill: '#60a5fa', radius: 6 },
									xAxis: { tickLabelProps: chartTickLabelProps },
									yAxis: {
										format: (value: number) => formatCompact(+value),
										tickLabelProps: chartTickLabelProps,
									},
								}}
							>
								{#snippet tooltip({ context })}
									<Tooltip.Root {context} class="bg-background text-primary">
										{#snippet children({ data })}
											<Tooltip.Header>
												{tooltipFormatter.format(new Date(data.date * 1000))}
											</Tooltip.Header>
											<Tooltip.List>
												<Tooltip.Item label="XP" value={formatCompact(data.value)} />
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</BarChart>
						</div>

						<div class="bg-card overflow-hidden rounded-lg border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Date</Table.Head>
										<Table.Head class="text-right">Total XP</Table.Head>
										<Table.Head>Top Skills</Table.Head>
										<Table.Head class="w-10"></Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each [...skillDays].reverse() as day (day.date)}
										{@const top = topSkills(day.skills)}
										{@const full = allSkills(day.skills)}
										<Table.Row>
											<Table.Cell class="font-mono text-sm">
												{day.dateLabel}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{formatCompact(day.totalXp)}
											</Table.Cell>
											<Table.Cell>
												<div class="flex flex-wrap gap-2">
													{#if top.length > 0}
														{#each top as skill (skill.name)}
															<span class="text-muted-foreground text-xs">
																{skill.name}: {formatCompact(skill.amount)}
															</span>
														{/each}
														{#if full.length > 3}
															<span class="text-muted-foreground text-xs">
																+{full.length - 3} more
															</span>
														{/if}
													{:else}
														<span class="text-muted-foreground text-xs">
															No skill XP gained
														</span>
													{/if}
												</div>
											</Table.Cell>
											<Table.Cell>
												{#if full.length > 0}
													<Popover.Root>
														<Popover.Trigger>
															<Button variant="ghost" size="sm" class="h-7 px-2 text-xs">
																View
															</Button>
														</Popover.Trigger>
														<Popover.Content class="w-64">
															<p class="mb-1 text-xs font-semibold">
																All Skill XP Changes
															</p>
															<div class="flex flex-col gap-1">
																{#each full as skill (skill.name)}
																	<div
																		class="flex items-center justify-between gap-2"
																	>
																		<span class="text-xs">{skill.name}</span>
																		<span class="font-mono text-xs">
																			{skill.amount.toLocaleString()}
																		</span>
																	</div>
																{/each}
															</div>
														</Popover.Content>
													</Popover.Root>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				{/if}
			</Tabs.Content>

			<!-- UPTIME TAB -->
			<Tabs.Content value="uptime">
				{#if uptimeDays.length === 0}
					<p class="text-muted-foreground py-8 text-center text-sm">
						No guild exp history available for this window. This player may not be in a guild.
					</p>
				{:else}
					<div class="mt-4 flex flex-col gap-4">
						<p class="text-muted-foreground text-xs">
							Estimated playtime based on Hypixel Guild EXP
							{#if guildName}
								in
								{#if guildId}
									<a
										href="/guilds/{guildId}"
										class="text-foreground inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:opacity-80"
									>
										{guildName}
										<ExternalLink class="inline h-3 w-3" />
									</a>
								{:else}
									<strong>{guildName}</strong>
								{/if}
							{/if}
							(~{GEXP_PER_HOUR.toLocaleString()} GEXP/hr)
						</p>

						<div class="grid gap-4 sm:grid-cols-2">
							<div class="bg-card rounded-lg border p-4">
								<p class="text-muted-foreground text-xs font-medium uppercase">Total GEXP</p>
								<p class="text-xl font-bold">{totalGexp.toLocaleString()}</p>
							</div>
							<div class="bg-card rounded-lg border p-4">
								<p class="text-muted-foreground text-xs font-medium uppercase">Daily Average</p>
								<p class="text-xl font-bold">
									{formatCompact(avgGexp)} GEXP / day
								</p>
							</div>
						</div>

						<div class="bg-card h-[280px] rounded-lg border p-4">
							<BarChart
								data={uptimeChartData}
								x="label"
								y="value"
								height={248}
								yNice
								padding={chartPadding}
								tooltipContext={{ mode: 'band' }}
								props={{
									bars: { fill: '#f472b6', radius: 6 },
									xAxis: { tickLabelProps: chartTickLabelProps },
									yAxis: {
										format: (value: number) => `${(+value).toFixed(1)}h`,
										tickLabelProps: chartTickLabelProps,
									},
								}}
							>
								{#snippet tooltip({ context })}
									<Tooltip.Root {context} class="bg-card">
										{#snippet children({ data })}
											<Tooltip.Header>
												{tooltipFormatter.format(new Date(data.date * 1000))}
											</Tooltip.Header>
											<Tooltip.List>
												<Tooltip.Item label="Hours" value={formatHours(data.value)} />
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</BarChart>
						</div>

						<div class="bg-card overflow-hidden rounded-lg border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Date</Table.Head>
										<Table.Head class="text-right">GEXP</Table.Head>
										<Table.Head class="text-right">Est. Hours</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each [...uptimeDays].reverse() as day (day.date)}
										<Table.Row>
											<Table.Cell class="font-mono text-sm">
												{day.dateLabel}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{day.gexp.toLocaleString()}
											</Table.Cell>
											<Table.Cell class="text-right font-mono">
												{formatHours(day.hours)}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{/if}

	<!-- FAQ -->
	<section class="w-full">
		<h2 class="mb-3 text-lg font-semibold">Frequently Asked Questions</h2>
		<Accordion.Root type="multiple" class="w-full">
			<Accordion.Item value="data-source">
				<Accordion.Trigger>Where does this data come from?</Accordion.Trigger>
				<Accordion.Content>
					Crop collection and skill XP data comes from periodic snapshots of your Hypixel SkyBlock profile via
					the Elite API. Uptime is estimated from your Hypixel Guild EXP history, which tracks total guild
					experience earned per day.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="no-data">
				<Accordion.Trigger>Why is there no data for a day?</Accordion.Trigger>
				<Accordion.Content>
					If a player didn't play during a snapshot window or has their Collections API disabled in SkyBlock,
					some days may appear blank. Guild EXP data may also be unavailable if the player is not in a guild.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="uptime-accuracy">
				<Accordion.Trigger>How accurate is the uptime estimate?</Accordion.Trigger>
				<Accordion.Content>
					Uptime is a rough estimate based on ~{GEXP_PER_HOUR.toLocaleString()} guild EXP earned per hour of active
					play. Actual playtime will vary depending on what activities you do in-game.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="weight">
				<Accordion.Trigger>What is "Weight"?</Accordion.Trigger>
				<Accordion.Content>
					Farming Weight is a standardized metric that measures farming progress. It accounts for all crops
					farmed, normalizing different collection rates so they can be compared fairly.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="pest-kills">
				<Accordion.Trigger>What are pest kill changes?</Accordion.Trigger>
				<Accordion.Content>
					Each crop attracts a specific pest type. The pest kills shown in the crop detail popover track how
					many of each pest type you defeated during that day. Click "View" on any row to see the full
					breakdown.
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>
</div>
