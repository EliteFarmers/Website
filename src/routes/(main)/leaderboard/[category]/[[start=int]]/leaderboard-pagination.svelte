<script lang="ts">
	import { page } from '$app/state';
	import type { LeaderboardDto } from '$lib/api';
	import type { LeaderboardInfo } from '$lib/constants/leaderboards';
	import { Button } from '$ui/button';
	import { Skeleton } from '$ui/skeleton';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';

	interface Props {
		info: LeaderboardInfo;
		leaderboard?: LeaderboardDto;
		loading?: boolean;
	}

	let { info, leaderboard, loading = false }: Props = $props();

	let currentPage = $derived(leaderboard ? Math.floor(leaderboard.offset / 20) + 1 : 0);
	let maxPage = $derived(leaderboard ? Math.floor(leaderboard.maxEntries / 20) + 1 : 0);
</script>

<div class="flex flex-col items-center gap-2 md:flex-row">
	<div class="order-3 flex items-center justify-center text-sm font-medium whitespace-nowrap lg:order-1">
		{#if loading}
			<Skeleton class="h-6 w-24" />
		{:else}
			<span
				>Page <strong>{currentPage.toLocaleString()}</strong> of
				<strong>{maxPage.toLocaleString()}</strong></span
			>
		{/if}
	</div>
	<div class="order-2 flex items-center space-x-2">
		<Button
			variant="outline"
			class="size-8 p-0"
			href="/leaderboard/{info.id}{page.url.search}"
			disabled={currentPage === 0 || loading}
		>
			<span class="sr-only">Go to first page</span>
			<ChevronsLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			href="/leaderboard/{info.id}/{Math.max(leaderboard ? leaderboard.offset - 19 : 1, 1)}{page.url.search}"
			disabled={currentPage === 0 || loading}
		>
			<span class="sr-only">Go to previous page</span>
			<ChevronLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			href="/leaderboard/{info.id}/{Math.min(
				leaderboard ? leaderboard.offset + 21 : 1,
				leaderboard ? leaderboard.maxEntries : 1
			)}{page.url.search}"
			disabled={currentPage === maxPage || loading}
		>
			<span class="sr-only">Go to next page</span>
			<ChevronRight />
		</Button>
		<Button
			variant="outline"
			class="size-8 p-0"
			href="/leaderboard/{info.id}/{Math.max(1, maxPage * 20 - 19)}{page.url.search}"
			disabled={currentPage === maxPage || loading}
		>
			<span class="sr-only">Go to last page</span>
			<ChevronsRight />
		</Button>
	</div>
</div>
