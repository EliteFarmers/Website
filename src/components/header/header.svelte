<script lang="ts">
	import { navigating, page } from '$app/state';
	import ModeToggle from '$comp/header/mode-toggle.svelte';
	import SearchMenu from '$comp/header/search-menu.svelte';
	import NavBreadcrumb from '$comp/sidebar/nav-breadcrumb.svelte';
	import type { LeaderboardInfo } from '$lib/constants/leaderboards';
	import { getFavoritesContext } from '$lib/stores/favorites.svelte';
	import { Button } from '$ui/button';
	import { Separator } from '$ui/separator';
	import * as Sidebar from '$ui/sidebar';
	import Heart from '@lucide/svelte/icons/heart';
	import Search from '@lucide/svelte/icons/search';
	import { quadInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import SmallAnnouncements from './small-announcements.svelte';

	interface Props {
		leaderboards?: Record<string, LeaderboardInfo>;
	}

	let { leaderboards }: Props = $props();

	const sidebar = Sidebar.useSidebar();
	let searchOpen = $state(false);

	const favorites = getFavoritesContext();

	function toggleFavorite() {
		if (!favorites.removeFavorite(page.url.pathname)) {
			favorites.addFavorite(favorites.currentPage);
		}
	}
</script>

<header class="bg-background sticky top-0 z-40 flex h-16 shrink items-center justify-between gap-2 border-b px-4">
	<div class="flex flex-row items-center gap-2">
		<Sidebar.Trigger class="-my-2 -ml-2 size-10" />
		<Separator orientation="vertical" class="mr-2 h-4" />
		<NavBreadcrumb />
	</div>
	<div class="flex items-center justify-between gap-2 md:justify-end">
		<Button variant="ghost" class="px-3 py-1" onclick={toggleFavorite}>
			<Heart class={favorites.favorited ? 'fill-destructive text-destructive' : ''}></Heart>
		</Button>
		{#if sidebar.isMobile}
			<Button
				onclick={() => (searchOpen = true)}
				class="bg-card order-4 border px-3 py-4"
				variant="outline"
				size="sm"
			>
				<Search />
			</Button>
			<SearchMenu bind:open={searchOpen} useButton={false} {leaderboards} />
		{:else}
			<div class="order-2 w-full flex-1 md:w-auto md:flex-none">
				<SearchMenu {leaderboards} />
			</div>
		{/if}
		<div class="order-3 flex items-center gap-2">
			<ModeToggle />
		</div>
	</div>
</header>

{#await navigating.complete}
	<div class="sticky top-16 z-40 w-full">
		<div class="relative">
			<div
				class="bg-progress absolute top-0 h-1.5 w-full"
				transition:slide={{ delay: 100, duration: 500, easing: quadInOut }}
			></div>
		</div>
	</div>
{/await}

<SmallAnnouncements />
