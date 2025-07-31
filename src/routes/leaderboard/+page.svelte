<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PageData } from './$types';
	import Category from './category.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Head
	title="Leaderboards"
	description="View the various leaderboards available on the site!"
	keywords="leaderboards, hypixel skyblock, level leaderboard, skills leaderboard, collection leaderboards"
/>

<div class="mb-16 flex flex-col items-center gap-16">
	<h1 class="mt-16 text-center text-4xl">Leaderboards</h1>

	<div class="flex w-full max-w-6xl flex-col items-center justify-center gap-4">
		{#each Object.entries(data.leaderboards ?? {}) as [category, leaderboards] (category)}
			<Category {leaderboards} title={category} />
		{/each}
	</div>
</div>
