<script lang="ts">
	import { PUBLIC_DONATION_URL, PUBLIC_WEIGHT_REQ } from '$env/static/public';

	import Head from '$comp/head.svelte';
	import Entry from '$comp/leaderboards/entry.svelte';
	import { Card, Button } from 'flowbite-svelte';

	import type { LeaderboardEntry } from '$lib/api/elite';
	import type { PageData } from './$types';
	import Serverbar from '$comp/stats/discord/serverbar.svelte';
	import { ArrowUpRightFromSquareOutline } from 'flowbite-svelte-icons';

	export let data: PageData;

	$: entries = data.lb as LeaderboardEntry[];

	let donationClicked = false;
</script>

<Head
	title="Elite | Skyblock Farming Weight"
	description="View the Farming Weight of any Hypixel Skyblock player! It's the one true method of accurately comparing between crops in the game."
/>

<main>
	<h1 class="text-4xl text-center my-16">Welcome to Elite!</h1>
	<p class="text-body-xl text-center mb-16">View stats of any skyblock player!</p>

	<div class="flex flex-col w-full items-center gap-8">
		{#if data.eliteGuild}
			<div class="w-full max-w-3xl">
				<Serverbar guild={data.eliteGuild} />
			</div>
		{/if}
		<div class="flex flex-col md:flex-row gap-8 justify-center items-center">
			<div class="flex flex-col items-center gap-8">
				<Card color="none" border={false}>
					<h1 class="mb-4 w-full text-xl font-semibold">Join The Discord</h1>
					<p class="w-full mb-6">
						Join an exclusive community of Elite Farmers! Full membership unlocked after reaching {PUBLIC_WEIGHT_REQ}
						farming weight. Talk to the best of the best with thousands of fellow farmers! Also, join the support
						server for suggestions, bug reports, and coding talk!
					</p>
					<div class="flex flex-col md:flex-row gap-2 justify-center">
						<Button
							href="/discord"
							class="w-fit font-semibold"
							color="blue"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							Elite farmers
							<ArrowUpRightFromSquareOutline class="ml-2" size="sm" />
						</Button>
						<Button
							href="/support"
							class="w-fit font-semibold"
							color="blue"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							Support Server
							<ArrowUpRightFromSquareOutline class="ml-2" size="sm" />
						</Button>
					</div>
				</Card>
				<Card color="none" border={false}>
					<h1 class="mb-4 w-full text-xl font-semibold">Add To Discord</h1>
					<p class="w-full mb-6">
						Quickly access stats and leaderboards in Discord! Please note that the bot runs seperately from
						the website for now, leaderboards and stats may be out of sync.
					</p>
					<div class="flex justify-center">
						<Button
							href="/invite"
							class="w-fit font-semibold"
							target="_blank"
							color="blue"
							rel="noopener noreferrer nofollow"
						>
							Invite Elite Bot
							<ArrowUpRightFromSquareOutline class="ml-2" size="sm" />
						</Button>
					</div>
				</Card>
			</div>
			<div class="flex flex-col items-center">
				<Card class="!p-0 overflow-hidden" size="sm">
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
							<img src="images/SupportKaeso.webp" alt="Support The Website" /></button
						>
					{/if}
				</Card>
			</div>
		</div>
		<a
			class="lumini flex flex-row gap-8 w-1/2 hover:shadow-xl rounded-md"
			href="https://www.etsy.com/listing/1499421785/pixelated-crop-stickers"
			target="_blank"
			rel="noopener noreferrer nofollow"
		>
			<h1 class="p-8 text-3xl font-semibold">
				Art By Lumini
				<span class="text-sm font-xl">Click Me To Check Out Their Shop!</span>
			</h1>
		</a>
	</div>

	<section class="flex justify-center mt-4 mb-10">
		<div class="flex gap-2 flex-col justify-center w-[90%] sm:w-[70%] md:w-[50%]">
			<h1 class="w-full text-3xl p-4 text-center">Top Farmers</h1>
			{#each entries as e, i}
				<Entry entry={e} rank={i + 1} formatting={'decimal'} />
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
		background-image: url('/images/LuminiBanner.webp');
		background-size: cover;
		background-position: center;
		height: fit-content;
	}

	.lumini h1 {
		color: black;
	}
</style>
