<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Head from '$comp/head.svelte';
	import type { PageData } from './$types';
	import Guild from './guild.svelte';

	$: discordUser = $page.data.discordUser;
	$: user = $page.data.user;

	export let data: PageData;

	onMount(async () => {
		console.log(discordUser);
		console.log(user);
	});

	let errorMessage = '';
	let linkValue = '';
	const linkSubmit = async () => {
		let skip = false;

		if (user && !linkValue) {
			linkValue = '$Unlink';

			// Alert the user that unlinking their account will remove all of their data.
			if (
				confirm('Are you sure you want to unlink your account? This removes all of your preferences and data.')
			) {
				skip = true;
			} else {
				linkValue = '';
			}
		}

		if (!skip && ((!linkValue && !user) || !linkValue.match(/^[a-zA-Z0-9_]{1,16}$/))) {
			errorMessage = 'Invalid username';
			return;
		}

		const body = new URLSearchParams({ username: linkValue });
		// Send post request to link endpoint

		const response = await fetch('/api/link', {
			method: 'POST',
			body: body,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		if (response.status === 200) {
			linkValue = '';
			user = !skip;
			location.reload();
		} else {
			const data = await response.text();
			errorMessage = data;
		}
	};
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<div class="flex flex-col justify-center items-center">
	<div class="w-full max-w-xl mb-8">
		<div class="bg-gray-100 dark:bg-zinc-800 shadow-md rounded m-8 px-8 pt-6 pb-8 mb-4">
			<div class="flex justify-between items-center">
				<div class="flex items-center bg-gray-200 dark:bg-zinc-700 p-2 rounded-md">
					<img
						class="w-10 h-10 rounded-full mr-4"
						src="https://cdn.discordapp.com/avatars/{discordUser.id}/{discordUser.avatar}.png"
						alt="{discordUser.username}'s avatar"
					/>
					<div class="text-2xl font-bold leading-none">{user ? user.ign : discordUser.username}</div>
				</div>
				<div class="flex items-center">
					<div class="text-xl font-bold leading-none">{discordUser.username}</div>
					<div class="ml-2 text-gray-500 dark:text-zinc-300 text-md">#{discordUser.discriminator}</div>
				</div>
			</div>
			<div>
				<br />
				<div class="text-md">
					UUID: <span class="text-sm text-gray-500 dark:text-zinc-300"
						>{user.uuid ?? 'Minecraft Account Unlinked'}</span
					>
				</div>
				<div class="text-md">
					Discord ID: <span class="text-sm text-gray-500 dark:text-zinc-300">{discordUser.id}</span>
				</div>
			</div>
		</div>
	</div>
	<!-- Link to view profile stats -->
	{#if user}
		<a
			href="/stats/"
			class="w-full max-w-md text-center bg-gray-200 p-3 rounded-md dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
		>
			View Profile Stats
		</a>
	{/if}
	<!-- Form to input username to link account -->
	<form on:submit|preventDefault={linkSubmit} class="w-full max-w-md mb-16">
		<div class="flex flex-col gap-4 items-center w-full">
			<div class="grid col-span-1 relative w-full">
				<input
					hidden={user}
					type="text"
					name="username"
					bind:value={linkValue}
					class="w-full px-4 py-2 border-2 rounded text-black"
					placeholder="Username"
				/>
				<span class="text-red-600 text-sm absolute bottom-0 select-none">{errorMessage}</span>
			</div>
			{#if user}
				<button
					type="submit"
					class="w-full p-3 rounded-md bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
				>
					Unlink Account
				</button>
			{:else}
				<button
					type="submit"
					class="w-full bg-gray-200 p-3 rounded-md dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
				>
					Link Account
				</button>

				<div class="text-center flex flex-col">
					<h1 class="text-lg py-2">
						Ensure <span class="text-green-500 select-all"
							>{discordUser.username}#{discordUser.discriminator}</span
						> is linked in Hypixel.net as follows:
					</h1>
					<video autoplay loop muted class="w-full max-w-md rounded-md" src="/images/HypixelLink.mp4" />
					<h1 class="text-md py-2">
						(Enter <span class="text-green-500 select-all"
							>{discordUser.username}#{discordUser.discriminator}</span
						>, the video is just the example)
					</h1>
				</div>
			{/if}
		</div>
	</form>

	<section class="grid md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense lg:w-[70%]">
		{#each data.guilds as guild (guild.id)}
			<Guild {guild} />
		{/each}
	</section>
</div>
