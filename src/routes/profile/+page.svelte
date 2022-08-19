<script lang="ts" context="module">
	throw new Error("@migration task: Check code was safely removed (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292722)");

	// import type { Load } from '../$types';

	// export const load: Load = async ({ params, fetch, session }) => {
	// 	if (!session.discordUser) {
	// 		// Redirect to login page
	// 		return { 
	// 			status: 302, 
	// 			redirect: '/login' 
	// 		};
	// 	}

	// 	return {
	// 		status: 200,
	// 		props: {
	// 			discordUser: session.discordUser,
	// 			user: session.user,
	// 		}
	// 	};
	// }
</script>

<script lang="ts">
	throw new Error("@migration task: Add data prop (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)");

	import { onMount } from 'svelte';
	import type { DiscordUser, User } from '$db/models/users';
	
	export let discordUser: DiscordUser;
	export let user: User | false;

	onMount(async () => {
		console.log(discordUser);
		console.log(user);
	});

	let linkValue = 'Hi';
	const linkSubmit = async () => {
		if (!linkValue || !linkValue.match(/^[a-zA-Z0-9_]{1,16}$/)) {
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
	}
</script>

<svelte:head>
	<title>{discordUser.username}'s Profile</title>
</svelte:head>

<div class="flex justify-center items-center">
	<div class="w-full max-w-md">
		<div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
			<div class="flex justify-between items-center">
				<div class="flex items-center">
					<img class="w-10 h-10 rounded-full mr-4" src="https://cdn.discordapp.com/avatars/{discordUser.id}/{discordUser.avatar}.png" alt="{discordUser.username}'s avatar" />
					<div class="text-sm font-bold leading-none">{(user) ? user.ign : discordUser.username}</div>
				</div>
				<div class="flex items-center">
					<div class="text-sm font-bold leading-none">{discordUser.username}</div>
					<div class="ml-2 text-gray-500 text-xs">#{discordUser.discriminator}</div>
				</div>
			</div>
			<div class="text-gray-700">
				<div class="text-sm font-bold leading-none">{discordUser.id}</div>
				<div class="text-sm font-bold leading-none">{discordUser.email}</div>
			</div>
		</div>
	</div>
	<!-- Link to view profile stats -->
	{#if user}
		<a href="/stats/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
			View Profile Stats
		</a>
	{:else}
		<!-- Form to input username to link account -->
		<form on:submit|preventDefault={linkSubmit}>
			<div class="flex items-center">
				<input type="text" name="username" bind:value={linkValue} class="w-full px-4 py-2 border-2 rounded" placeholder="Username" />
				<button type="submit" class="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
					Link Account
				</button>
			</div>
		</form>
	{/if}
</div>