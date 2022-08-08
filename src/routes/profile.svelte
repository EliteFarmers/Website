<script lang="ts" context="module">
	import type { Load } from './__types/profile';

	export const load: Load = async ({ params, fetch, session }) => {
		if (!session.user) {
			// Redirect to login page
			return { 
				status: 302, 
				redirect: '/api/auth' 
			};
		}

		return {
			status: 200,
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	export let user: User;

	onMount(async () => {
		console.log(user);
	});
</script>

<svelte:head>
	<title>{user.username}'s Profile</title>
</svelte:head>

<div class="flex justify-center items-center">
	<div class="w-full max-w-md">
		<div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
			<div class="flex justify-between items-center">
				<div class="flex items-center">
					<img class="w-10 h-10 rounded-full mr-4" src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png" alt="{user.username}'s avatar" />
					<div class="text-sm font-bold leading-none">{user.username}</div>
				</div>
				<div class="flex items-center">
					<div class="text-sm font-bold leading-none">{user.username}</div>
					<div class="ml-2 text-gray-500 text-xs">#{user.discriminator}</div>
				</div>
			</div>
			<div class="text-gray-700">
				<div class="text-sm font-bold leading-none">{user.id}</div>
				<div class="text-sm font-bold leading-none">{user.email}</div>
			</div>
		</div>
	</div>
</div>