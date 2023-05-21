<script lang="ts">
	import type { DiscordUser } from '$db/models/users';
	import { navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	import {
		Avatar,
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

	export let discordUser: DiscordUser | false;

	let searchVal = '';

	async function search() {
		const isAtStats = $page.url.pathname.startsWith('/stats');

		const url = `${$page.url.origin}/stats/${searchVal}`;

		if (isAtStats) {
			window.location.href = url;
			goto(url);
		} else {
			await goto(url);
		}
		searchVal = '';
	}
</script>

<Navbar let:hidden let:toggle class="flex items-center align-middle" color="none">
	<NavBrand href="/">
		<img src="/favicon.webp" class="mr-3 h-6 sm:h-9" alt="Elite Logo" />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"> EliteWebsite </span>
	</NavBrand>
	<div class="hidden relative md:flex lg:order-1 w-1/3" id="mobile-menu-3">
		<div class="relative md:block w-full">
			<form on:submit|preventDefault={search} class="flex gap-2 items-center justify-center">
				<Input let:props placeholder="Player name" size="md">
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
				<Input let:props placeholder="Player name" size="md">
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

	<NavUl {hidden} class="lg:order-3 mx-auto items-end justify-center lg:mx-0 md:items-center">
		<NavLi href="/" active={$page.url.pathname === '/'}>Home</NavLi>
		<NavLi href="/info" active={$page.url.pathname === '/info'}>Info</NavLi>
		<NavLi href="/leaderboard" active={$page.url.pathname === '/leaderboard'}>Top Players</NavLi>
		<DarkMode initialTheme="dark" />

		{#if discordUser}
			<div class="flex items-center lg:order-2">
				<Avatar
					id="avatar-menu"
					src="https://cdn.discordapp.com/avatars/{discordUser.id}/{discordUser.avatar}.png"
				/>
			</div>
			<Dropdown placement="bottom" triggeredBy="#avatar-menu">
				<DropdownHeader>
					<span class="block text-sm"> {discordUser.username} </span>
				</DropdownHeader>
				<DropdownItem href="/profile">Profile</DropdownItem>
				<DropdownItem href="/stats">My Stats</DropdownItem>
				<DropdownDivider />
				<DropdownItem href="/logout">Sign out</DropdownItem>
			</Dropdown>
		{:else}
			<div class="flex lg:order-2 my-0">
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
