<script lang="ts">
	import Head from '$comp/seo/head.svelte';
	import { getPageCtx, type Crumb } from '$lib/hooks/page.svelte';
	import * as Accordion from '$ui/accordion';
	import type { PageData } from './$types';
	import StreamerCard from './streamer-card.svelte';
	import StreamerHero from './streamer-hero.svelte';
	import { resolveThumbnail } from './streamer-utils';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const directory = $derived(data.directory);
	const heroImage = $derived(resolveThumbnail(directory.hero?.liveStream?.thumbnailUrl, 1200, 630));

	const pageCtx = getPageCtx();
	const crumbs = $derived<Crumb[]>([{ name: 'Streamers', href: '/streamers' }]);

	$effect(() => {
		pageCtx.setBreadcrumbs(crumbs);
	});
</script>

<Head
	title="SkyBlock Streamers | Elite Skyblock"
	description="Browse live Hypixel SkyBlock streamers and featured community creators."
	imageUrl={heroImage}
	canonicalPath="/streamers"
/>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
	<header class="flex justify-start pt-8 text-center">
		<h1 class="text-2xl md:text-4xl">Streamers</h1>
	</header>

	{#if directory.serviceUnavailable}
		<div class="bg-card text-muted-foreground rounded-md border p-4 text-sm">
			Some stream data could not be loaded. The page is showing the data that is currently available.
		</div>
	{/if}

	{#if directory.hero}
		<StreamerHero item={directory.hero} />
	{/if}

	{#if directory.promotedLive.length > 0}
		<section class="flex flex-col gap-4">
			<div>
				<h2 class="text-2xl font-semibold">Featured Live</h2>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each directory.promotedLive as item (item.key)}
					<StreamerCard {item} />
				{/each}
			</div>
		</section>
	{/if}

	{#if directory.discoveredLive.length > 0}
		<section class="flex flex-col gap-4">
			<div>
				<h2 class="text-2xl font-semibold">Live Now</h2>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each directory.discoveredLive as item (item.key)}
					<StreamerCard {item} />
				{/each}
			</div>
		</section>
	{/if}

	{#if directory.registeredOffline.length > 0}
		<section class="flex flex-col gap-4">
			<div>
				<h2 class="text-2xl font-semibold">Offline Featured Streamers</h2>
			</div>
			<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{#each directory.registeredOffline as item (item.key)}
					<StreamerCard {item} showThumbnail={false} />
				{/each}
			</div>
		</section>
	{/if}

	{#if !directory.hero && directory.promotedLive.length === 0 && directory.discoveredLive.length === 0 && directory.registeredOffline.length === 0}
		<section class="bg-card flex min-h-64 flex-col items-center justify-center rounded-md border p-8 text-center">
			<h2 class="text-2xl font-semibold">No streamers found</h2>
			<p class="text-muted-foreground mt-2 max-w-md">
				Check back soon for live SkyBlock streams and featured creators.
			</p>
		</section>
	{/if}

	<section class="bg-card rounded-md border p-6 shadow-sm">
		<h2 class="text-2xl font-semibold">FAQ</h2>
		<Accordion.Root type="multiple" class="mt-4 w-full">
			<Accordion.Item value="how-streamers-appear">
				<Accordion.Trigger><p class="text-left">How do streamers show up here?</p></Accordion.Trigger>
				<Accordion.Content>
					The live list is built from Twitch streams in the Minecraft category that match Hypixel SkyBlock
					keywords. Registered streamers are managed separately, so they can still appear on the page even
					when their current stream title is not a keyword match. YouTube live streams are not currently
					supported and therefore do not appear in the live list.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="page-utility">
				<Accordion.Trigger><p class="text-left">What is this page for?</p></Accordion.Trigger>
				<Accordion.Content>
					It gives players a single place to find active SkyBlock streams, discover creators already streaming
					Hypixel content, and quickly open a creator's Twitch, links, creator codes, or Elite profile
					metadata.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="featured-order">
				<Accordion.Trigger><p class="text-left">Why are some streamers shown first?</p></Accordion.Trigger>
				<Accordion.Content>
					Registered streamers and those who have ties to the website may be shown first, other than that,
					streamers are generally shown in the order of most viewers to least viewers.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="apply">
				<Accordion.Trigger
					><p class="text-left">How can I apply to be a featured streamer?</p></Accordion.Trigger
				>
				<Accordion.Content>
					If you are a content creator and would like to be considered for featured streamer status, please <a
						href="/contact"
						class="text-link underline">reach out</a
					>! This is not a paid advertisement slot, and you'll show up regardless if you are featured or not
					(as long as you are actively streaming SkyBlock/Hypixel content).
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</section>
</main>
