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
</script>

<Head
	title="Elite | Skyblock Farming Weight"
	description="View the Farming Weight of any Hypixel Skyblock player! It's the one true method of accurately comparing between crops in the game."
/>

<main>
	<h1 class="text-4xl text-center my-16">Welcome to Elite!</h1>
	<p class="text-body-xl text-center mb-16">View farming stats of any skyblock player!</p>

	<div class="flex flex-col w-full items-center gap-8">
		{#if data.eliteGuild}
			<div class="w-full max-w-3xl">
				<Serverbar guild={data.eliteGuild} />
			</div>
		{/if}
		<div class="flex flex-col md:flex-row gap-4 justify-center items-center">
			<div class="flex flex-col items-center gap-4">
				<Card color="none" border={false} class="dark:bg-zinc-800">
					<h1 class="mb-4 w-full text-xl font-semibold">Join The Discord</h1>
					<p class="w-full mb-6">
						Full membership unlocked after reaching {(+PUBLIC_WEIGHT_REQ).toLocaleString()}
						farming weight. Also, join the support server for suggestions, bug reports!
					</p>
					<div class="flex flex-col md:flex-row gap-2 justify-center">
						<Button
							href="/discord"
							class="w-fit font-semibold"
							color="blue"
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							Elite Farmers
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
				<Card color="none" border={false} class="dark:bg-zinc-800">
					<h1 class="mb-4 w-full text-xl font-semibold">Support Development!</h1>
					<p class="w-full mb-6">
						Donate on Ko-Fi to support the development of Elite! Also check Server Subscriptions on the
						development server to unlock some perks!
					</p>
					<div class="flex justify-center">
						<Button
							href={PUBLIC_DONATION_URL}
							class="w-fit font-semibold"
							target="_blank"
							color="green"
							rel="noopener noreferrer nofollow"
						>
							Donate on Ko-Fi
							<ArrowUpRightFromSquareOutline class="ml-2" size="sm" />
						</Button>
					</div>
				</Card>
			</div>
			<div class="flex flex-col items-center gap-4">
				<Card color="none" border={false} class="dark:bg-zinc-800">
					<h1 class="mb-4 w-full text-xl font-semibold">Add To Discord</h1>
					<p class="w-full mb-6">
						Quickly access stats and leaderboards in Discord! Try out commands like <strong>/weight</strong
						>, <strong>/rates</strong>, and <strong>/leaderboard</strong>!
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
				<Card color="none" border={false} class="dark:bg-zinc-800">
					<h1 class="mb-4 w-full text-xl font-semibold">Purchase Crop Stickers!</h1>
					<p class="w-full mb-6">
						Direcly support the art on Elite by purchasing crop stickers! All proceeds go to the artist, and
						you get a cool sticker!
					</p>
					<div class="flex justify-center">
						<Button
							href="https://www.etsy.com/listing/1499421785/pixelated-crop-stickers"
							class="w-fit font-semibold"
							target="_blank"
							color="green"
							rel="noopener noreferrer nofollow"
						>
							Open Lumini's Shop
							<ArrowUpRightFromSquareOutline class="ml-2" size="sm" />
						</Button>
					</div>
				</Card>
			</div>
		</div>
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
