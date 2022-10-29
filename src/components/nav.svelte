<script lang="ts">
	import type { DiscordUser } from '$db/models/users';
	import { navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

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

<nav class="flex justify-between justify-items-center bg-gray-100 dark:bg-zinc-800 p-2">
	<section class="flex gap-2 mr-3 justify-start w-1/5 md:w-1/4">
		<a class="block sm:hidden p-3 rounded-md dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-600" href="/"
			>Elite</a
		>
		<a class="hidden sm:block p-3 rounded-md dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-600" href="/"
			>EliteDev</a
		>
		<a class="p-3 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600" href="/info"
			>Info</a
		>
		<a
			class="block md:hidden p-3 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
			href="/leaderboard">Top</a
		>
		<a
			class="hidden md:block p-3 rounded-md bg-gray-200 dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
			href="/leaderboard">Leaderboard</a
		>
	</section>
	<!-- Section that's centered in the nav bar -->
	<section class="hidden sm:flex gap-2 mx-6 justify-items-center justify-center w-3/5 md:1/2">
		<form
			class="m-0 p-0 w-[100%] flex justify-center justify-items-center align-middle"
			on:submit|preventDefault={search}
		>
			<input
				class="w-4/6 mx-2 bg-gray-200 dark:bg-zinc-700 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600"
				type="text"
				placeholder="Enter username"
				bind:value={searchVal}
				disabled={$navigating !== null}
			/>
			<a
				data-sveltekit-reload
				class="bg-gray-200 dark:bg-zinc-700 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600"
				href="/stats/{searchVal}"
				disabled={$navigating !== null}
			>
				<svg class="h-4 w-4 mt-1" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
					/>
				</svg>
			</a>
		</form>
	</section>
	<section class="flex gap-2 ml-3 justify-end w-1/5 md:w-1/4">
		<a
			class="block sm:hidden dark:bg-zinc-700 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600"
			href="/"
			disabled={$navigating !== null}
		>
			<svg class="h-4 w-4 mt-1" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
				/>
			</svg>
		</a>
		<!-- Login with discord styled button -->
		<div hidden={discordUser !== false}>
			<a
				data-sveltekit-reload
				class="bg-gray-200 dark:bg-zinc-700 hidden md:block p-3 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600"
				href="/login">Discord Login</a
			>
			<a
				data-sveltekit-reload
				class="bg-gray-200 dark:bg-zinc-700 block md:hidden p-3 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600"
				href="/login">Login</a
			>
		</div>
		<a
			class="bg-gray-200 p-3 rounded-md dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
			href="/profile"
			hidden={discordUser === false}
		>
			Profile</a
		>
		<!-- Logout button -->
		<a
			data-sveltekit-reload
			class="bg-gray-200 dark:bg-zinc-700 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600"
			href="/logout"
			hidden={discordUser === false}>Logout</a
		>
	</section>
</nav>
{#if $navigating}
	<div class="relative">
		<div
			class="w-full h-1 bg-green-300 absolute"
			transition:slide={{ delay: 100, duration: 500, easing: quadInOut }}
		/>
	</div>
{/if}
