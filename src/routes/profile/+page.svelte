<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import Head from '$comp/head.svelte';
	import type { PageData, ActionData } from './$types';
	import Guild from './guild.svelte';

	$: discordUser = $page.data.discordUser;
	$: user = $page.data.user;

	export let data: PageData;
	export let form: ActionData;
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<div class="flex md:flex-row justify-center gap-16 m-16">
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
		<!-- Form to input username to link account -->
		{#if !user}
			<form method="POST" action="?/link" class="w-full max-w-md mb-16" use:enhance>
				<div class="flex flex-col gap-4 items-center w-full">
					<div class="grid col-span-1 relative w-full">
						<input
							type="text"
							name="username"
							class="w-full px-4 py-2 border-2 rounded text-black"
							placeholder="Username"
						/>
						<span class="text-red-600 text-sm absolute bottom-0 select-none">{form?.error ?? ''}</span>
					</div>
					<button
						type="submit"
						class="w-full bg-gray-200 p-3 rounded-md dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
					>
						Link Account
					</button>
				</div>
			</form>

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
		{:else}
			<a
				href="/stats/"
				class="w-full mb-4 max-w-md text-center bg-gray-200 p-3 rounded-md dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
			>
				View Profile Stats
			</a>
			<!-- Form to unlink account -->
			<form method="POST" action="?/unlink" class="w-full max-w-md mb-16" use:enhance>
				<div class="flex flex-col gap-4 items-center w-full">
					<button
						type="submit"
						class="w-full bg-gray-200 p-3 rounded-md dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600"
					>
						Unlink Account
					</button>
				</div>
			</form>
		{/if}
	</div>	
	<section class="grid md:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense lg:w-[70%] mb-16">
		{#each data.guilds as guild (guild.id)}
			<Guild {guild} />
		{/each}
	</section>
</div>
