<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import { PUBLIC_DONATION_URL } from '$env/static/public';
	import { Button } from 'flowbite-svelte';
	import type { PageData, ActionData } from './$types';
	import Guild from './guild.svelte';

	export let data: PageData;
	export let form: ActionData;

	$: user = data.discordUser || undefined;
	$: mc = data.mcAccount;

	console.log(data.premium);
</script>

<Head title="Profile" description="View your profile and link your Minecraft account!" />

<div class="flex flex-col lg:flex-row justify-center gap-16 m-16">
	<div class="flex flex-col items-start">
		<div class="w-full max-w-xl mb-8">
			<div class="bg-gray-100 dark:bg-zinc-800 shadow-md rounded m-8 px-8 pt-6 pb-8 mb-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center bg-gray-200 dark:bg-zinc-700 p-2 rounded-md">
						{#if user}
							<img
								class="w-10 h-10 rounded-full mr-4"
								src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png"
								alt="{user?.username}'s avatar"
							/>
						{/if}
						<div class="text-2xl font-bold leading-none">{mc?.name ?? user?.username ?? 'N/A'}</div>
					</div>
					<div class="flex items-center">
						<div class="text-xl font-bold leading-none">{user?.username}</div>
						<div class="ml-2 text-gray-500 dark:text-zinc-300 text-md">#{user?.discriminator}</div>
					</div>
				</div>
				<div>
					<br />
					<div class="text-md">
						UUID: <span class="text-sm text-gray-500 dark:text-zinc-300"
							>{mc?.id ?? 'Minecraft Account Unlinked'}</span
						>
					</div>
					<div class="text-md">
						Discord ID: <span class="text-sm text-gray-500 dark:text-zinc-300">{user?.id}</span>
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-col items-start mb-8">
			<div class="flex gap-8 items-baseline">
				<h1 class="text-xl">Premium Status</h1>
				{#if data.premium === 'gold'}
					<h2 class="text-lg text-yellow-500 font-semibold">Gold</h2>
				{:else if data.premium === 'silver'}
					<h2 class="text-lg text-zinc-400 font-semibold">Silver</h2>
				{:else if data.premium === 'gold'}
					<h2 class="text-lg text-orange-700 font-semibold">Bronze</h2>
				{:else}
					<h2 class="text-lg text-gray-500 font-semibold">None!</h2>
				{/if}
				<Button class="m-1" href="/plans" rel="noopener noreferrer">Upgrade</Button>
			</div>
			{#if data.premium !== '' && data.premium !== 'none'}
				<h2 class="text-lg text-center">Thank You!</h2>
			{/if}
		</div>
		<!-- Form to input username to link account -->
		{#if !mc?.name}
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
					Ensure <span class="text-green-500 select-all">{user?.username}#{user?.discriminator ?? '0'}</span> is
					linked in Hypixel.net as follows:
				</h1>
				<video autoplay loop muted class="w-full max-w-md rounded-md" src="/images/HypixelLink.mp4" />
				<h1 class="text-md py-2">
					(Enter <span class="text-green-500 select-all"
						>{user?.discriminator ? `${user?.username}#${user.discriminator}` : `${user?.username}`}</span
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
	<section class="flex flex-col lg:w-[70%]">
		<h1 class="text-2xl mb-4">Events</h1>
		{#if true}
			<p>You're not a part of any currently running events!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			<!-- {#each data.events as event (event.id)}
				<Event {event} />
			{/each} -->
		</div>

		<h1 class="text-2xl mb-4">Your Servers</h1>
		{#if data.guildsWithBot.length === 0}
			<p>This feature is a work in progress, check back later!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.guildsWithBot as guild (guild.id)}
				<Guild {guild} />
			{/each}
		</div>

		<h1 class="text-2xl mb-4">Other Servers</h1>
		{#if data.guildsWithBot.length === 0}
			<p>This feature is a work in progress, check back later!</p>
		{/if}
		<div class="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense mb-16">
			{#each data.guilds as guild (guild.id)}
				<Guild {guild} />
			{/each}
		</div>
	</section>
</div>
