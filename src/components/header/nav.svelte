<!-- @migration task: review uses of `navigating` -->
<script lang="ts">
	import { navigating } from '$app/state';
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	import ModeToggle from '$comp/header/mode-toggle.svelte';
	import MainNav from '$comp/header/main-nav.svelte';
	import MobileNav from '$comp/header/mobile-nav.svelte';
	import SearchMenu from '$comp/header/search-menu.svelte';
	import * as Sidebar from '$ui/sidebar';
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
		<MainNav />
		<MobileNav />
		<div class="flex flex-1 items-center justify-between gap-4 md:justify-end">
			<div class="w-full flex-1 md:w-auto md:flex-none">
				<SearchMenu />
			</div>
			<nav class="flex items-center gap-2">
				<ModeToggle />
				<!-- <UserDropdown /> -->
			</nav>
		</div>
	</div>
</header>

<div class="absolute left-2 top-16">
	<Sidebar.Trigger size="lg" class="size-14" />
</div>

{#await navigating.complete}
	<div class="relative">
		<div
			class="absolute h-1 w-full bg-ring"
			transition:slide={{ delay: 100, duration: 500, easing: quadInOut }}
		></div>
	</div>
{/await}
