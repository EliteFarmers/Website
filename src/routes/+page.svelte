<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		PUBLIC_BOT_INVITE,
		PUBLIC_SUPPORT_SERVER_INVITE,
		PUBLIC_COMMUNITY_INVITE,
		PUBLIC_DONATION_URL,
	} from '$env/static/public';

	import Head from '$comp/head.svelte';
	import Entry from './leaderboard/[category]/[page]/[[start]]/entry.svelte';

	import Card from '@smui/card';
	import Button from '@smui/button';
	import LayoutGrid, { Cell } from '@smui/layout-grid';

	import type { PageData } from './$types';
	import Helpplease from '$comp/+helpplease.svelte';
	export let data: PageData;

	let enteredText = '';
	let donationClicked = false;
</script>

<Head
	title="Elite | Skyblock Farming Weight"
	description="View the Farming Weight of any Hypixel Skyblock player! It's the one true method of accurately comparing between crops in the game."
/>

<main>
	<h1 class="text-4xl text-center my-16">Welcome to Elite!</h1>
	<p class="text-body-xl text-center">Look up any skyblock player!</p>

	<div class="flex align-items-center justify-center justify-self-center relative mb-8">
		<form on:submit|preventDefault class="w-10/12 flex align-items-center justify-center">
			<div class="relative inline-block md:w-1/3">
				<input
					class="p-2 m-4 mb-0 text-left border-2 rounded-lg w-[100%] mx-auto dark:text-black"
					bind:value={enteredText}
					maxlength="100"
					placeholder="Search for player"
					type="text"
				/>
			</div>
			<button
				class="p-2 m-4 rounded-lg border-2 border-white dark:border-green-800 bg-green-300 dark:bg-green-600 hover:bg-green-400}"
				on:click={() => {
					goto(`/stats/${enteredText}`);
				}}
			>
				Search
			</button>
		</form>
	</div>

	<Helpplease />

	<div class="flex w-full justify-center">
		<LayoutGrid fixedColumnWidth>
			<Cell span={8}>
				<Card class="p-8 mb-8">
					<h1 class="p-2 mb-4 w-full text-center rounded-md text-xl">Join The Discord</h1>
					<p class="w-full text-center mb-6">
						Join an exclusive community of Elite Farmers! Full membership only unlocked after reaching 4,750
						farming weight. For website/bot support, join the support server!
					</p>
					<div class="flex flex-col lg:flex-row justify-evenly m-1">
						<Button
							href={PUBLIC_SUPPORT_SERVER_INVITE}
							variant="raised"
							class="m-1"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							<p>Join Support Server</p>
						</Button>
						<Button
							href={PUBLIC_COMMUNITY_INVITE}
							variant="raised"
							class="m-1"
							color="secondary"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							<p>Join Elite Farmers</p>
						</Button>
					</div>
				</Card>
				<Card class="p-8">
					<h1 class="p-2 mb-4 w-full text-center rounded-md text-xl">Add To Your Server</h1>
					<p class="w-full text-center mb-6">
						Quickly access stats and leaderboards in Discord! Elite Bot is verified and already present in
						more than 400 servers! Please note that the bot runs seperately from the website for now,
						leaderboards and stats may be slightly out of sync.
					</p>
					<div class="flex justify-center">
						<Button
							href={PUBLIC_BOT_INVITE}
							variant="raised"
							class="m-1"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							<p>Invite Elite Bot</p>
						</Button>
					</div>
				</Card>
			</Cell>
			<Cell span={4}>
				<Card>
					{#if donationClicked}
						<iframe
							id="kofiframe"
							src="{PUBLIC_DONATION_URL}/?hidefeed=true&widget=true&embed=true&preview=true"
							style="border:none;width:100%;padding:4px;"
							height="512"
							title="kaeso"
						/>
					{:else}
						<button on:click={() => (donationClicked = true)}>
							<img src="images/SupportKaeso.png" alt="Support The Website" /></button
						>
					{/if}
				</Card>
			</Cell>
			<Cell span={12}>
				<Card class="overflow-hidden">
					<a
						class="lumini flex flex-row gap-8 w-full hover:shadow-xl"
						href="https://www.redbubble.com/people/Luumini/shop"
						target="_blank"
						rel="noopener noreferrer nofollow"
					>
						<h1 class="p-8 text-3xl font-semibold">
							Art By Lumini
							<span class="text-sm font-xl">Click Me To Check Out Their Shop!</span>
						</h1>
					</a>
				</Card>
			</Cell>
		</LayoutGrid>
	</div>

	<section class="flex justify-center mt-4 mb-10">
		<div class="flex gap-2 flex-col justify-center w-[90%] sm:w-[70%] md:w-[50%]">
			<h1 class="w-full text-3xl p-4 text-center">Top Farmers</h1>
			{#each data.lb as e, i}
				<Entry
					entry={{ ign: e.ign ?? '', cute_name: e.cute_name ?? '', amount: e.amount }}
					rank={i + 1}
					formatting={'decimal'}
				/>
			{/each}
			<div class="flex justify-center w-full">
				<a
					href="/leaderboard/weight/farming"
					class="text-center max-w-md px-4 py-2 m-2 rounded-md bg-gray-200 hover:bg-gray-400 dark:bg-zinc-700 dark:hover:bg-zinc-800"
					>View Full Leaderboard</a
				>
			</div>
		</div>
	</section>
</main>

<style>
	.lumini {
		display: block;
		background-image: url('/images/LuminiBanner.png');
		background-size: cover;
		background-position: center;
		height: fit-content;
	}

	.lumini h1 {
		color: black;
	}
</style>
