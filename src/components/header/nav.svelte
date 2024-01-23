<script lang="ts">
	import { navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	import {
		DarkMode,
		Dropdown,
		DropdownDivider,
		DropdownHeader,
		DropdownItem,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Button,
		Input,
	} from 'flowbite-svelte';
	import Usericon from '$comp/stats/discord/usericon.svelte';

	import ModeToggle from '$comp/header/mode-toggle.svelte';
	import MainNav from '$comp/header/main-nav.svelte';
	import MobileNav from '$comp/header/mobile-nav.svelte';
	import SearchMenu from '$comp/header/search-menu.svelte';

	let searchVal = '';

	async function search() {
		await goto(`/@${searchVal}`);

		searchVal = '';
	}
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
		<MainNav />
		<MobileNav />
		<div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
			<div class="w-full flex-1 md:w-auto md:flex-none">
				<SearchMenu />
			</div>
			<nav class="flex items-center">
				<!-- <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
					<div
						class={cn(
							buttonVariants({
								size: "sm",
								variant: "ghost"
							}),
							"w-9 px-0"
						)}
					>
						<Icons.gitHub class="h-4 w-4" />
						<span class="sr-only">GitHub</span>
					</div>
				</a>
				<a href={siteConfig.links.twitter} target="_blank" rel="noreferrer">
					<div
						class={cn(
							buttonVariants({
								size: "sm",
								variant: "ghost"
							}),
							"w-9 px-0"
						)}
					>
						<Icons.twitter class="h-3 w-3 fill-current" />
						<span class="sr-only">X (formerly known as Twitter)</span>
					</div>
				</a> -->
				<ModeToggle />
			</nav>
		</div>
	</div>
</header>

<Navbar let:hidden let:toggle class="flex items-center align-middle" color="none">
	<NavBrand href="/">
		<img src="/favicon.webp" class="mr-3 h-6 sm:h-9" alt="Elite Logo" />
		<span class="self-center whitespace-nowrap text-xl font-semibold px-1">Elite Farmers</span>
	</NavBrand>
	<div class="hidden relative md:flex lg:order-1 w-1/3" id="mobile-menu-3">
		<div class="relative md:block w-full">
			<form on:submit|preventDefault={search} class="flex gap-2 items-center justify-center">
				<Input let:props placeholder="Player name" size="md" class="dark:bg-zinc-800">
					<input type="text" {...props} bind:value={searchVal} />
				</Input>
				<Button class="!p-2.5 h-full" type="submit" name="Search">
					<svg
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/></svg
					>
				</Button>
			</form>
		</div>
	</div>

	<div class="md:hidden lg:order-3">
		<Button
			color="none"
			data-collapse-toggle="mobile-menu-3"
			aria-controls="mobile-menu-3"
			aria-expanded="false"
			id="search-button"
			name="Show Search Bar"
			aria-label="Show Search Bar"
			class="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm !p-2"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6 dark:text-white"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
				/></svg
			>
		</Button>
		<NavHamburger on:click={toggle} />
	</div>
	<Dropdown class="w-full" color="none" placement="bottom-end" triggeredBy="#search-button">
		<DropdownItem defaultClass="w-full">
			<form on:submit|preventDefault={search} class="flex gap-2 items-center justify-center">
				<Input let:props placeholder="Player name" size="md" class="dark:bg-zinc-800">
					<input type="text" {...props} bind:value={searchVal} />
				</Input>
				<Button class="!p-2.5 h-full" type="submit" name="Search">
					<svg
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/></svg
					>
				</Button>
			</form>
		</DropdownItem>
	</Dropdown>

	<NavUl
		{hidden}
		class="lg:order-3 mx-auto items-end justify-center lg:mx-0 md:items-center"
		ulClass="flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:items-center"
	>
		<NavLi href="/info" active={$page.url.pathname === '/info'}>Info</NavLi>
		<NavLi href="/browse" active={$page.url.pathname === '/browse'}>Browse</NavLi>
		<NavLi href="/contests" active={$page.url.pathname === '/contests'}>Contests</NavLi>
		<NavLi href="/leaderboard" active={$page.url.pathname === '/leaderboard'}>Top Players</NavLi>
		<DarkMode initialTheme="dark" />

		{#if $page.data.userInfo}
			<div class="flex items-center lg:order-2 cursor-pointer" id="avatar-menu">
				<Usericon user={$page.data.userInfo} size={10} />
			</div>
			<Dropdown placement="bottom-end" triggeredBy="#avatar-menu">
				<DropdownHeader>
					<span class="block text-sm w-32"> {$page.data.userInfo.username}</span>
				</DropdownHeader>
				<DropdownItem href="/profile">Profile</DropdownItem>
				<DropdownItem href="/stats">My Stats</DropdownItem>
				<DropdownDivider />
				<DropdownItem href="/logout" data-sveltekit-preload-data="off">Sign out</DropdownItem>
			</Dropdown>
		{:else}
			<div class="flex lg:order-2 my-0" data-sveltekit-preload-data="off">
				<Button href="/login" size="sm">Login</Button>
			</div>
		{/if}
	</NavUl>
</Navbar>
{#if $navigating}
	<div class="relative">
		<div
			class="w-full h-1 bg-green-300 absolute"
			transition:slide={{ delay: 100, duration: 500, easing: quadInOut }}
		/>
	</div>
{/if}
