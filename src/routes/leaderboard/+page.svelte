<script lang="ts">
	import { PUBLIC_HOST_URL } from '$env/static/public';
	import type { PageData } from './$types';

	export let data: PageData;

	const categories = data.categories;

	const crops = categories.find((category) => category && category.name === 'crops');
	const weight = categories.find((category) => category && category.name === 'weight');
	const skills = categories.find((category) => category && category.name === 'skills');
	const jacob = categories.find((category) => category && category.name === 'contests');
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

<main class="flex flex-col gap-16 mb-16">
	<h1 class="text-4xl text-center mt-16">Leaderboards</h1>
	<section class="flex flex-wrap justify-center gap-2">
		{#each weight?.pages ?? [] as leaderboard (leaderboard.name)}
			<div class="w-1/2 md:w-1/3 lg:w-1/6 xl:w-1/8">
				<a href="/leaderboard/{weight?.name}/{leaderboard.name.replace('DEFAULT', '')}">
					<div
						class="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 hover:dark:bg-zinc-700"
					>
						<h3 class="text-xl text-center">{leaderboard.title.replace(' Collection', '')}</h3>
					</div>
				</a>
			</div>
		{/each}
	</section>
	<section class="flex flex-wrap justify-center gap-2">
		{#each crops?.pages ?? [] as leaderboard, i (leaderboard.name)}
			<div class="w-1/2 md:w-1/3 lg:w-1/6 xl:w-1/8">
				<a href="/leaderboard/{crops?.name}/{leaderboard.name.replace('DEFAULT', '')}">
					<div
						class="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 hover:dark:bg-zinc-700"
					>
						<div class="crop" style="background-position: 0px {1000 - 100 * i}%;" />
						<h3 class="text-xl text-center">{leaderboard.title.replace(' Collection', '')}</h3>
					</div>
				</a>
			</div>
		{/each}
	</section>
	<h2 class="text-2xl text-center">Skills</h2>
	<section class="flex flex-wrap justify-center gap-2">
		{#each skills?.pages ?? [] as leaderboard (leaderboard.name)}
			<div class="w-1/2 md:w-1/3 lg:w-1/6 xl:w-1/8">
				<a href="/leaderboard/{skills?.name}/{leaderboard.name.replace('DEFAULT', '')}">
					<div
						class="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 hover:dark:bg-zinc-700"
					>
						<h3 class="text-xl text-center">{leaderboard.title.replace(' Collection', '')}</h3>
					</div>
				</a>
			</div>
		{/each}
	</section>
	<h2 class="text-2xl text-center">Jacob</h2>
	<section class="flex flex-wrap justify-center gap-2">
		{#each jacob?.pages ?? [] as leaderboard (leaderboard.name)}
			<div class="w-1/2 md:w-1/3 lg:w-1/6 xl:w-1/8">
				<a href="/leaderboard/{jacob?.name}/{leaderboard.name.replace('DEFAULT', '')}">
					<div
						class="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 hover:dark:bg-zinc-700"
					>
						<h3 class="text-xl text-center">{leaderboard.title.replace(' Collection', '')}</h3>
					</div>
				</a>
			</div>
		{/each}
	</section>
</main>

<style lang="postcss">
	.crop {
		@apply w-16 h-16;
		display: inline-block;
		background-image: url('/images/cropatlas.png');
		background-size: 100%;
		aspect-ratio: 1;
		background-size: 200% 1000%;
	}
</style>
