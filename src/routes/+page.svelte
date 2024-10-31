<script lang="ts">
	import { PUBLIC_DONATION_URL, PUBLIC_WEIGHT_REQ } from '$env/static/public';

	import Head from '$comp/head.svelte';
	import Entry from '$comp/leaderboards/entry.svelte';
	import * as Card from '$ui/card';
	import { Button } from '$ui/button';

	import type { LeaderboardEntry } from '$lib/api/elite';
	import type { PageData } from './$types';
	import Serverbar from '$comp/stats/discord/serverbar.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	export let data: PageData;
</script>

<Head
	title="Elite | Skyblock Farming Weight"
	description="View the Farming Weight of any Hypixel Skyblock player! It's the one true method of accurately comparing between crops in the game."
/>

<main>
	<h1 class="text-4xl text-center my-16">Welcome to Elite!</h1>
	<p class="text-lg text-center mb-16">View farming stats of any skyblock player!</p>

	<div class="flex flex-col w-full items-center gap-8">
		{#if data.eliteGuild}
			<div class="w-full max-w-3xl">
				<Serverbar guild={data.eliteGuild} lazy={false} />
			</div>
		{/if}
		<div class="flex flex-col md:flex-row gap-4 justify-center items-center">
			<div class="flex flex-col items-center gap-4">
				<Card.Root class="max-w-md">
					<Card.Header>
						<Card.Title class="text-xl">Join The Discord</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="w-full mb-6 text-lg">
							Full membership unlocked after reaching {(+PUBLIC_WEIGHT_REQ).toLocaleString()}
							farming weight. Also, join the support server for suggestions and bug reports!
						</p>
						<div class="flex flex-col md:flex-row gap-2 justify-center">
							<Button
								href="/discord"
								class="w-fit font-semibold"
								variant="secondary"
								target="_blank"
								rel="noopener noreferrer nofollow"
							>
								Elite Farmers
								<ExternalLink class="ml-2" size={20} />
							</Button>
							<Button
								href="/support"
								class="w-fit font-semibold"
								variant="secondary"
								target="_blank"
								rel="noopener noreferrer nofollow"
							>
								Support Server
								<ExternalLink class="ml-2" size={20} />
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root class="max-w-md">
					<Card.Header>
						<Card.Title class="text-xl">Support Development!</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="w-full mb-6 text-lg">
							Donate on Ko-Fi to support the development of Elite! Also check Server Subscriptions on the
							development server to unlock some perks!
						</p>
						<div class="flex justify-center">
							<Button
								href={PUBLIC_DONATION_URL}
								class="w-fit font-semibold"
								target="_blank"
								variant="secondary"
								rel="noopener noreferrer nofollow"
							>
								Donate on Ko-Fi
								<ExternalLink class="ml-2" size={20} />
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
			<div class="flex flex-col items-center gap-4">
				<Card.Root class="max-w-md">
					<Card.Header>
						<Card.Title class="text-xl">Add To Discord</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="w-full mb-6 text-lg">
							Quickly access stats and leaderboards in Discord! Try out commands like <strong
								>/weight</strong
							>, <strong>/rates</strong>, and <strong>/leaderboard</strong>!
						</p>
						<div class="flex justify-center">
							<Button
								href="/invite"
								class="w-fit font-semibold"
								target="_blank"
								variant="secondary"
								rel="noopener noreferrer nofollow"
							>
								Invite Elite Bot
								<ExternalLink class="ml-2" size={20} />
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root class="max-w-md">
					<Card.Header>
						<Card.Title class="text-xl">Purchase Crop Stickers!</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="w-full mb-6 text-lg">
							Direcly support the art on Elite by purchasing crop stickers! All proceeds go to the artist,
							and you get a cool sticker!
						</p>
						<div class="flex justify-center">
							<Button
								href="https://www.etsy.com/listing/1499421785/pixelated-crop-stickers"
								class="w-fit font-semibold"
								target="_blank"
								variant="secondary"
								rel="noopener noreferrer nofollow"
							>
								Open Lumini's Shop
								<ExternalLink class="ml-2" size={20} />
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>

	<section class="flex justify-center mt-4 mb-10">
		<div class="flex gap-2 flex-col items-center w-[90%] sm:w-[70%] md:w-[50%]" data-sveltekit-preload-data="tap">
			<h1 class="w-full text-3xl p-4 text-center">Top Farmers</h1>
			{#await data.lb}
				<p>Loading...</p>
			{:then lb}
				{#each lb?.entries ?? [] as e, i}
					<Entry entry={e} rank={i + 1} formatting={'decimal'} />
				{/each}
				<div class="flex justify-center w-full">
					<Button href="/leaderboard/weight/farming" class="text-center max-w-md" variant="secondary"
						>View Full Leaderboard
					</Button>
				</div>
			{/await}
		</div>
	</section>
</main>
