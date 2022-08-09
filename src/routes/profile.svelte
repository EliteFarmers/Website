<script lang="ts" context="module">
	import type { Load } from './__types/profile';

	export const load: Load = async ({ params, fetch, session }) => {
		if (!session.discordUser) {
			// Redirect to login page
			return { 
				status: 302, 
				redirect: '/api/auth' 
			};
		}

		return {
			status: 200,
			props: {
				discordUser: session.discordUser,
				user: session.user,
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { DiscordUser, User } from '$db/models/users';

	export let discordUser: DiscordUser;
	export let user: User | false;

	onMount(async () => {
		console.log(discordUser);
		console.log(user);
	});
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
		<a href="/stats/{user.ign}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
			View Profile Stats
		</a>		
	{/if}
</div>