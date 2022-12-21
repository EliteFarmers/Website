<script lang="ts">
	import { PUBLIC_HOST_URL } from '$env/static/public';
	import { each } from 'svelte/internal';
	import type { PageData } from './$types';

	export let data: PageData;

	const categories = data.categories;
</script>

<svelte:head>
	<title>Leaderboards</title>
	<meta
		name="description"
		content="View the Farming Weight of any Hypixel Skyblock player! It's the one true method of accurately comparing between crops in the game."
	/>
	<meta name="keywords" content="farming, profile, skyblock, weight, calculate, Hypixel, elite" />
	<meta property="og:title" content="Elite - Skyblock Farming Weight" />
	<meta
		property="og:description"
		content="View the Farming Weight of any Hypixel Skyblock player! It's the one true method of accurately comparing between crops in the game."
	/>
	<meta property="og:image" content="{PUBLIC_HOST_URL}/favicon.png" />
</svelte:head>

<section>
	{#each categories as category}
		<h2 class="text-2xl text-center my-16">{category?.title ?? category?.pages[0].title}</h2>
		<div class="flex flex-wrap justify-center">
			{#each category?.pages ?? [] as leaderboard}
				<div class="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-4">
					<a href="/leaderboard/{category?.name}/{leaderboard.name.replace('DEFAULT', '')}">
						<div
							class="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-zinc-800"
						>
							<h3 class="text-xl text-center">{leaderboard.title}</h3>
							<p class="text-body text-center">{leaderboard.name}</p>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{/each}
</section>
