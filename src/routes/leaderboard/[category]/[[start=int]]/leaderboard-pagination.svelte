<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import { Button } from '$ui/button';
	import type { LeaderboardInfo } from '$lib/constants/leaderboards';
	import type { components } from '$lib/api/api';
	import { page } from '$app/state';

	interface Props {
		info: LeaderboardInfo;
		leaderboard: components['schemas']['LeaderboardDto'];
	}

	let { info, leaderboard }: Props = $props();

	let currentPage = $derived(Math.floor(leaderboard.offset / 20) + 1);
	let maxPage = $derived(Math.floor(leaderboard.maxEntries / 20) + 1);
</script>

<div class="flex flex-col items-center gap-2 md:flex-row">
	<div class="order-3 flex items-center justify-center whitespace-nowrap text-sm font-medium lg:order-1">
		<span
			>Page <strong>{currentPage.toLocaleString()}</strong> of
			<strong>{maxPage.toLocaleString()}</strong></span
		>
	</div>
	<div class="order-2 flex items-center space-x-2">
		<Button
			variant="outline"
			class="size-8 p-0"
			href="/leaderboard/{info.id}{page.url.search}"
			disabled={currentPage === 0}
		>
			<span class="sr-only">Go to first page</span>
			<ChevronsLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			href="/leaderboard/{info.id}/{Math.max(leaderboard.offset - 19, 1)}{page.url.search}"
			disabled={currentPage === 0}
		>
			<span class="sr-only">Go to previous page</span>
			<ChevronLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			href="/leaderboard/{info.id}/{Math.min(leaderboard.offset + 21, leaderboard.maxEntries)}{page.url.search}"
			disabled={currentPage === maxPage}
		>
			<span class="sr-only">Go to next page</span>
			<ChevronRight />
		</Button>
		<Button
			variant="outline"
			class="size-8 p-0"
			href="/leaderboard/{info.id}/{maxPage * 20}{page.url.search}"
			disabled={currentPage === maxPage}
		>
			<span class="sr-only">Go to last page</span>
			<ChevronsRight />
		</Button>
	</div>
</div>
