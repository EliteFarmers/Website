<script lang="ts">
	import type { HypixelGuildDetailsDto } from '$lib/api/schemas/HypixelGuildDetailsDto';
	import { SortHypixelGuildsBy } from '$lib/api/schemas/SortHypixelGuildsBy';
	import { getHypixelGuildsList } from '$lib/remote/guilds.remote';
	import type { SortingState } from '@tanstack/table-core';
	import { getColumns } from './columns.js';
	import GuildsTable from './guilds-table.svelte';

	interface Props {
		guilds: HypixelGuildDetailsDto[];
	}

	const DEFAULT_PAGE_SIZE = 30;
	const DEFAULT_SORTING: SortingState = [{ id: 'Skyblock Level', desc: true }];

	type GuildSort = (typeof SortHypixelGuildsBy)[keyof typeof SortHypixelGuildsBy];

	const columnSortMap: Record<string, GuildSort> = {
		'Member Count': SortHypixelGuildsBy.memberCount,
		'Skyblock Level': SortHypixelGuildsBy.skyblockExperienceAverage,
		'Farming Weight': SortHypixelGuildsBy.farmingWeight,
		'Skill Level': SortHypixelGuildsBy.skillLevelAverage,
		'Catacombs Level': SortHypixelGuildsBy.catacombsExperience,
		'Slayer Xp': SortHypixelGuildsBy.slayerExperience,
	};

	let { guilds }: Props = $props();

	const columns = $derived(getColumns());
	let tableData = $derived(guilds);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let activeRequest = 0;

	function normalizeSorting(sorting: SortingState): SortingState {
		return sorting.length ? sorting : DEFAULT_SORTING;
	}

	async function fetchGuildsForSorting(sorting: SortingState) {
		const normalized = normalizeSorting(sorting);
		const primary = normalized[0];
		const sortBy = columnSortMap[primary.id] ?? SortHypixelGuildsBy.memberCount;
		const descending = primary.desc ?? false;
		const requestId = ++activeRequest;

		isLoading = true;
		errorMessage = null;

		try {
			const next = await getHypixelGuildsList({
				sortBy,
				descending,
				pageSize: DEFAULT_PAGE_SIZE,
			});

			if (requestId === activeRequest) {
				tableData = next;

				if (!next.length) {
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
		fetchGuildsForSorting(next);
	}
</script>

<div class="w-full max-w-6xl py-2">
	<GuildsTable
		data={tableData}
		{columns}
		initialSorting={DEFAULT_SORTING}
		onSortingChange={handleSortingChange}
		loading={isLoading}
	/>
	{#if errorMessage}
		<p class="text-destructive mt-2 text-sm">{errorMessage}</p>
	{/if}
</div>
