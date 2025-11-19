<script lang="ts">
	import Serverbar from '$comp/discord/serverbar.svelte';
	import Head from '$comp/head.svelte';
	import Entry from '$comp/leaderboards/entry.svelte';
	import MainSearch from '$comp/stats/main-search.svelte';
	import { PUBLIC_DONATION_URL, PUBLIC_WEIGHT_REQ } from '$env/static/public';
	import { getArticlesPaginated } from '$lib/remote/articles.remote';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import ScrollArea from '$ui/scroll-area/scroll-area.svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import type { PageData } from './$types';
	import ArticlePill from './articles/article-pill.svelte';
	import ArticleSkeleton from './articles/article-skeleton.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const recentArticles = getArticlesPaginated({ page: 1, pageSize: 4 });
</script>

<Head
	title="Skyblock Farming Weight"
	description="View the Farming Weight of any Hypixel Skyblock player! It's the one true method of accurately comparing between crops in the game."
/>

<div>
	<div class="mb-16 flex flex-col items-center gap-4 lg:gap-8">
		<div>
			<h1 class="my-16 text-center text-4xl">Welcome to Elite!</h1>
			<p class="mb-8 text-center text-lg">View farming stats of any skyblock player!</p>
		</div>

		<MainSearch class="mx-auto w-full max-w-lg lg:flex-1" />
	</div>

	<div class="my-8 flex w-full flex-col items-center gap-8">
		{#if data.eliteGuild}
			<div class="w-full max-w-3xl">
				<Serverbar guild={data.eliteGuild} lazy={false} />
			</div>
		{/if}

		<div class="flex max-w-full flex-col gap-4">
			<h2 class="text-3xl">Recent Articles</h2>
			<ScrollArea class="flex max-w-4xl" orientation="horizontal">
				<div class="flex flex-row items-start gap-6">
					{#await recentArticles}
						{#each { length: 4 }, i (i)}
							<ArticleSkeleton />
						{/each}
					{:then articles}
						{#if articles?.data.length}
							{#each articles.data as article (article.slug)}
								<ArticlePill {article} />
							{/each}
						{/if}
					{/await}
				</div>
			</ScrollArea>
			<a href="/articles" class="group relative flex flex-row items-center justify-end gap-4">
				<span class="mr-10 font-semibold underline">View All Articles</span>
				<div class="group-hover:animate-bounce-horizontal absolute top-0 right-2">
					<ArrowRight class="size-6" />
				</div>
			</a>
		</div>

		<div class="flex flex-col items-center justify-center gap-4 md:flex-row">
			<div class="flex flex-col items-center gap-4">
				<Card.Root class="max-w-md">
					<Card.Header>
						<Card.Title class="text-xl">Join The Discord</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="mb-6 w-full text-lg">
							Full membership unlocked after reaching {(+PUBLIC_WEIGHT_REQ).toLocaleString()}
							farming weight. Also, join the support server for suggestions and bug reports!
						</p>
						<div class="flex flex-col justify-center gap-2 md:flex-row">
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
						<p class="mb-6 w-full text-lg">
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
						<p class="mb-6 w-full text-lg">
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
						<p class="mb-6 w-full text-lg">
							Directly support the art on Elite by purchasing crop stickers! All proceeds go to the
							artist, and you get a cool sticker!
						</p>
						<div class="flex justify-center">
							<Button
								href="https://www.etsy.com/listing/1499421785/pixelated-crop-stickers"
								class="w-fit font-semibold"
								target="_blank"
								variant="secondary"
								rel="noopener nofollow"
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

	<section class="mt-4 mb-10 flex justify-center">
		<div class="flex w-[90%] flex-col items-center gap-2 sm:w-[70%] md:w-[50%]" data-sveltekit-preload-data="tap">
			<h1 class="w-full p-4 text-center text-3xl">Top Farmers</h1>
			{#await data.lb}
				<p>Loading...</p>
			{:then lb}
				{#each lb?.entries ?? [] as e, i (i)}
					<Entry entry={e} rank={i + 1} leaderboard={data.leaderboard} />
				{/each}
				<div class="flex w-full justify-center">
					<Button href="/leaderboard/farmingweight" class="max-w-md text-center" variant="secondary"
						>View Full Leaderboard
					</Button>
				</div>
			{:catch error}
				<p>{error.message}</p>
			{/await}
		</div>
	</section>
</div>
