<script lang="ts">
	import * as Sidebar from '$ui/sidebar';
	import { Separator } from '$ui/separator';
	import SearchMenu from '$comp/header/search-menu.svelte';
	import NavBreadcrumb from '$comp/sidebar/nav-breadcrumb.svelte';
	import ModeToggle from '$comp/header/mode-toggle.svelte';
	import { navigating } from '$app/state';
	import { quadInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
</script>

<header class="sticky top-0 z-40 flex h-16 shrink items-center justify-between gap-2 border-b bg-background px-4">
	<div class="flex flex-row items-center gap-2">
		<Sidebar.Trigger class="-my-2 -ml-2 size-10" />
		<Separator orientation="vertical" class="mr-2 h-4" />
		<NavBreadcrumb />
	</div>
	<div class="flex items-center justify-between gap-4 md:justify-end">
		<div class="w-full flex-1 md:w-auto md:flex-none">
			<SearchMenu />
		</div>
		<div class="flex items-center gap-2">
			<ModeToggle />
		</div>
	</div>
</header>

{#await navigating.complete}
	<div class="sticky top-16 z-40 w-full">
		<div class="relative">
			<div
				class="absolute top-0 h-1.5 w-full bg-progress"
				transition:slide={{ delay: 100, duration: 500, easing: quadInOut }}
			></div>
		</div>
	</div>
{/await}
