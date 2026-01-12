<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import type { HypixelGuildDetailsDto } from '$lib/api/schemas/HypixelGuildDetailsDto';
	import { SortHypixelGuildsBy } from '$lib/api/schemas/SortHypixelGuildsBy';
	import { getHypixelGuildsList } from '$lib/remote/guilds.remote';
	import type { PaginationState, SortingState } from '@tanstack/table-core';
	import { onMount } from 'svelte';
	import { getColumns } from './columns.js';
	import GuildsTable from './guilds-table.svelte';

	interface Props {
		guilds: HypixelGuildDetailsDto[];
		total?: number | null;
		page?: number | null;
		pageSize?: number | null;
		sortBy?: string | null;
	}

	let { guilds, total = null, page = null, pageSize: pSize = null, sortBy = null }: Props = $props();

	const DEFAULT_PAGE_SIZE = 10;

	const columnSortMap: Record<string, GuildSort> = {
		'Member Count': SortHypixelGuildsBy.memberCount,
		'Skyblock Level': SortHypixelGuildsBy.skyblockExperienceAverage,
		'Farming Weight': SortHypixelGuildsBy.farmingWeight,
		'Skill Level': SortHypixelGuildsBy.skillLevelAverage,
		'Catacombs Level': SortHypixelGuildsBy.catacombsExperience,
		'Slayer Xp': SortHypixelGuildsBy.slayerExperience,
	};

	const defaultSorting: SortingState = $derived.by(() => {
		if (sortBy) {
			const columnId = Object.entries(columnSortMap).find(([, value]) => value === sortBy)?.[0];
			if (columnId) {
				return [{ id: columnId, desc: true }];
			}
		}
		return [{ id: 'Skyblock Level', desc: true }];
	});

	type GuildSort = (typeof SortHypixelGuildsBy)[keyof typeof SortHypixelGuildsBy];

	const columns = $derived(getColumns());
	let tableData = $derived(guilds);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let activeRequest = 0;
	let pageIndex = $derived(page ?? 0);
	let pageSize = $derived(pSize ?? DEFAULT_PAGE_SIZE);
	let totalGuilds = $derived<number | null>(total);
	let sorting = $derived(defaultSorting);

	function normalizeSorting(sorting: SortingState): SortingState {
		return sorting.length ? sorting : defaultSorting;
	}

	async function loadGuilds({
		sorting: nextSorting,
		page,
		size,
	}: {
		sorting: SortingState;
		page: number;
		size: number;
	}) {
		const normalized = normalizeSorting(nextSorting);
		const primary = normalized[0];
		const sortBy = columnSortMap[primary.id] ?? SortHypixelGuildsBy.memberCount;
		const descending = primary.desc ?? false;
		const requestId = ++activeRequest;

		isLoading = true;
		errorMessage = null;

		try {
			const response = await getHypixelGuildsList({
				sortBy,
				descending,
				page: page + 1,
				pageSize: size,
			});

			// Update query parameters
			const url = new URL(window.location.href);
			url.searchParams.set('sort', sortBy);
			url.searchParams.set('page', String(page + 1));
			url.searchParams.set('size', String(size));
			replaceState(url, pageState.state);

			if (requestId === activeRequest) {
				tableData = response.guilds;
				totalGuilds = response.total;

				if (!response.guilds.length) {
					errorMessage = 'No guilds found for this sort.';
				}
			}
		} catch (error) {
			console.error('Failed to fetch guild data', error);
			if (requestId === activeRequest) {
				errorMessage = 'Unable to load guild data right now.';
			}
		} finally {
			if (requestId === activeRequest) {
				isLoading = false;
			}
		}
	}

	function handleSortingChange(next: SortingState) {
		sorting = normalizeSorting(next);
		pageIndex = 0;
		loadGuilds({ sorting, page: 0, size: pageSize });
	}

	function handlePaginationChange(next: PaginationState) {
		pageIndex = next.pageIndex;
		pageSize = next.pageSize;
		loadGuilds({ sorting, page: next.pageIndex, size: next.pageSize });
	}

	onMount(() => {
		loadGuilds({ sorting, page: pageIndex, size: pageSize });
	});
</script>

<div class="w-full max-w-6xl py-2">
	<GuildsTable
		data={tableData}
		{columns}
		initialSorting={defaultSorting}
		onSortingChange={handleSortingChange}
		manualPagination
		{pageIndex}
		{pageSize}
		pageCount={totalGuilds !== null
			? Math.max(1, Math.ceil(totalGuilds / pageSize))
			: pageIndex + (tableData.length === pageSize ? 2 : 1)}
		onPaginationChange={handlePaginationChange}
		loading={isLoading}
	/>
	{#if errorMessage}
		<p class="text-destructive mt-2 text-sm">{errorMessage}</p>
	{/if}
</div>
