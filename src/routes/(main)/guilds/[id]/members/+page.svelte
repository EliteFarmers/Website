<script lang="ts">
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import LeaderboardEntriesColumns from '$comp/leaderboards/entries-columns.svelte';
	import IntervalSelect from '$comp/leaderboards/interval-select.svelte';
	import LeaderboardPaginationLocal from '$comp/leaderboards/pagination-local.svelte';
	import type { GuildMembersLeaderboard, LeaderboardEntry } from '$lib/api/elite';
	import type { LeaderboardInfo } from '$lib/constants/leaderboards';
	import { getPageCtx } from '$lib/hooks/page.svelte';
	import { getGuildMembersLeaderboard } from '$lib/remote/guilds.remote';
	import { Button } from '$ui/button';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import Hourglass from '@lucide/svelte/icons/hourglass';
	import SquareActivity from '@lucide/svelte/icons/square-activity';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	const DEFAULT_LEADERBOARD_ID = 'skyblockxp';

	let { data }: PageProps = $props();

	const leaderboardLookup = (data.leaderboards?.leaderboards ?? {}) as Record<string, LeaderboardInfo>;
	const leaderboardOptions = Object.values(leaderboardLookup)
		.sort((a, b) => {
			if (a.category !== b.category) {
				return (a.category ?? '').localeCompare(b.category ?? '');
			}
			if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
				return a.order - b.order;
			}
			return a.title.localeCompare(b.title);
		})
		.map((info) => ({
			value: info.id,
			label: `${info.category ?? 'Leaderboards'} • ${info.title}${info.suffix ?? ''}`,
		}));

	const defaultSelected =
		(data.selectedLeaderboardId && leaderboardLookup[data.selectedLeaderboardId]
			? data.selectedLeaderboardId
			: leaderboardLookup[DEFAULT_LEADERBOARD_ID]
				? DEFAULT_LEADERBOARD_ID
				: leaderboardOptions[0]?.value) ?? '';

	let selected = $state(defaultSelected);
	let leaderboardData = $state<GuildMembersLeaderboard | null>(data.initialLeaderboard ?? null);
	let loading = $state(false);
	let interval = $state<string | undefined>(data.selectedInterval ?? data.initialLeaderboard?.interval ?? undefined);
	let mode = $state<'classic' | 'ironman' | 'island' | undefined>(data.selectedMode);
	let removed = $state<0 | 1 | 2 | undefined>(data.selectedRemoved);

	const entries = $derived.by<LeaderboardEntry[]>(() => leaderboardData?.entries ?? []);
	const pageSize = 20;
	let currentPage = $state(1);
	const totalEntries = $derived.by(() => entries.length);
	const totalPages = $derived.by(() => Math.max(1, Math.ceil(totalEntries / pageSize)));
	const effectivePage = $derived.by(() => Math.min(Math.max(currentPage, 1), totalPages));
	const pagedEntries = $derived.by<LeaderboardEntry[]>(() => {
		const start = (effectivePage - 1) * pageSize;
		return entries.slice(start, start + pageSize);
	});
	const currentOffset = $derived.by(() => (totalEntries ? (effectivePage - 1) * pageSize + 1 : 1));
	const currentEnd = $derived.by(() =>
		totalEntries ? Math.min(currentOffset + pagedEntries.length - 1, totalEntries) : 0
	);

	const selectedInfo = $derived.by<LeaderboardInfo | undefined>(() =>
		selected ? leaderboardLookup[selected] : undefined
	);
	const intervalType = $derived.by<'current' | 'weekly' | 'monthly'>(() => {
		if (selected?.endsWith('-weekly')) return 'weekly';
		if (selected?.endsWith('-monthly')) return 'monthly';
		return 'current';
	});
	const baseLeaderboardId = $derived.by(() => selected?.replace(/-(weekly|monthly)$/, ''));
	const intervalVariants = $derived.by(() =>
		(selectedInfo?.intervals ?? []).filter((variant) => variant !== intervalType)
	);

	let activeRequest = 0;

	function syncUrlState() {
		if (!browser) return;
		const nextUrl = new URL(window.location.href);
		if (selected) {
			nextUrl.searchParams.set('leaderboard', selected);
		} else {
			nextUrl.searchParams.delete('leaderboard');
		}
		if (interval && intervalType !== 'current') {
			nextUrl.searchParams.set('interval', interval);
		} else {
			nextUrl.searchParams.delete('interval');
		}
		if (mode) {
			nextUrl.searchParams.set('mode', mode);
		} else {
			nextUrl.searchParams.delete('mode');
		}
		if (removed !== undefined) {
			nextUrl.searchParams.set('removed', removed.toString());
		} else {
			nextUrl.searchParams.delete('removed');
		}
		replaceState(nextUrl, page.state);
	}

	async function loadLeaderboard(leaderboardId: string, overrides?: { interval?: string | undefined }) {
		if (!leaderboardId || !leaderboardLookup[leaderboardId]) {
			leaderboardData = null;
			return;
		}

		const requestId = ++activeRequest;
		loading = true;

		const intervalParam = overrides?.interval ?? (leaderboardId === selected ? interval : undefined);

		try {
			const result = await getGuildMembersLeaderboard({
				guildId: data.guild.id,
				leaderboardId,
				interval: intervalParam,
				mode,
				removed,
			});

			if (requestId === activeRequest) {
				leaderboardData = result ?? null;
				currentPage = 1;
				interval = result?.interval ?? overrides?.interval ?? undefined;
				syncUrlState();
			}
		} catch (cause) {
			console.error('Failed to fetch guild member leaderboard', cause);
		} finally {
			if (requestId === activeRequest) {
				loading = false;
			}
		}
	}

	function handleLeaderboardChange(value: string) {
		if (!value || value === selected) return;
		selected = value;
		interval = undefined;
		syncUrlState();
		loadLeaderboard(value);
	}

	function handleIntervalChange(value: string | undefined) {
		if (intervalType === 'current') return;
		const nextInterval = value ?? undefined;
		if (nextInterval === interval) return;
		interval = nextInterval;
		syncUrlState();
		loadLeaderboard(selected, { interval });
	}

	function handleVariantChange(variant: 'current' | 'weekly' | 'monthly') {
		if (!baseLeaderboardId) return;
		const target = variant === 'current' ? baseLeaderboardId : `${baseLeaderboardId}-${variant}`;
		handleLeaderboardChange(target);
	}

	onMount(() => {
		if (!selected || !leaderboardLookup[selected]) {
			const fallback = leaderboardOptions[0]?.value;
			if (fallback) {
				selected = fallback;
				loadLeaderboard(fallback);
			}
		} else if (!leaderboardData) {
			loadLeaderboard(selected);
		} else {
			syncUrlState();
		}
	});

	const pageCtx = getPageCtx();
	$effect.pre(() => {
		pageCtx.setBreadcrumbs([
			{ name: 'Guilds', href: '/guilds' },
			{ name: data.guild.name, href: `/guilds/${data.guild.id}` },
			{ name: 'Members' },
		]);
	});
</script>

<section class="flex flex-col gap-2">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<h2 class="text-2xl font-semibold">{data.guild.name} Member Leaderboards</h2>
			<p class="text-muted-foreground text-sm">
				View and rank guild members across any Elite <a href="/leaderboard" class="text-primary underline"
					>leaderboard</a
				>!
			</p>
		</div>
		<div class="flex flex-col items-center justify-center gap-2 lg:flex-row lg:items-end lg:justify-between">
			<div class="flex flex-col items-center justify-center gap-2 lg:flex-row lg:flex-wrap">
				<ComboBox
					options={leaderboardOptions}
					placeholder="Select a leaderboard"
					value={selected}
					onChange={handleLeaderboardChange}
					btnClass="h-8 w-full justify-between md:w-64 lg:w-72"
					triggerClass="h-8 w-full max-w-md md:w-auto"
					popoverClass="w-full md:w-auto"
				/>
				<div class="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:justify-start">
					{#if leaderboardData}
						<IntervalSelect
							leaderboard={leaderboardData}
							value={interval}
							onChange={handleIntervalChange}
						/>
					{/if}
					{#each intervalVariants as variant (variant)}
						<Button
							class="mx-0 h-8 px-0"
							variant="outline"
							type="button"
							onclick={() => handleVariantChange(variant)}
						>
							{#if variant === 'monthly'}
								<CalendarClock />
								<span class="hidden max-lg:inline-block">Monthly</span>
							{:else if variant === 'weekly'}
								<Hourglass />
								<span class="hidden max-lg:inline-block">Weekly</span>
							{:else}
								<SquareActivity />
								<span class="hidden max-lg:inline-block">All Time</span>
							{/if}
						</Button>
					{/each}
				</div>
			</div>
			{#if totalPages >= 1}
				<div class="flex justify-center md:justify-end">
					<LeaderboardPaginationLocal
						currentPage={effectivePage}
						pageCount={totalPages}
						onChange={(pageNumber) => (currentPage = pageNumber)}
					/>
				</div>
			{/if}
		</div>
	</div>

	{#if totalEntries}
		{#if pagedEntries.length}
			<LeaderboardEntriesColumns
				entries={pagedEntries}
				leaderboard={selectedInfo}
				offset={currentOffset}
				showLeaderboardName
			>
				{#snippet namePrefix({ entry })}
					{#if data.guild.tag}
						<span
							class="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
							aria-label={`${data.guild.tag} guild tag for ${entry.ign ?? entry.members?.[0]?.ign ?? 'member'}`}
						>
							{data.guild.tag}
						</span>
						<span aria-hidden="true" class="text-muted-foreground text-xs">•</span>
					{/if}
				{/snippet}
			</LeaderboardEntriesColumns>
		{:else if !loading}
			<p class="text-muted-foreground text-sm">No members found for this leaderboard.</p>
		{/if}
	{:else if !loading}
		<p class="text-muted-foreground text-sm">No members found for this leaderboard.</p>
	{/if}

	{#if totalPages >= 1}
		<div class="flex flex-col items-center gap-2 lg:flex-row lg:justify-between">
			<div class="lg:flex-1">
				{#if selectedInfo && totalEntries}
					<p class="text-muted-foreground text-sm">
						Showing {currentOffset.toLocaleString()} - {currentEnd.toLocaleString()} of
						{totalEntries.toLocaleString()} members.
					</p>
				{/if}
			</div>
			<div class="flex justify-center md:justify-end">
				<LeaderboardPaginationLocal
					currentPage={effectivePage}
					pageCount={totalPages}
					onChange={(pageNumber) => (currentPage = pageNumber)}
				/>
			</div>
		</div>
	{/if}
</section>
