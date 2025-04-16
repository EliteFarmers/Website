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
	description="View the various leaderboards available on the site! See the 5 thousand farmers in every crop!"
/>

<div class="mb-16 flex flex-col items-center gap-16">
	<h1 class="mt-16 text-center text-4xl">Leaderboards</h1>

	<div class="flex w-full max-w-6xl flex-wrap items-center justify-center gap-4 lg:items-start">
		{#each Object.entries(data.leaderboards) as [category, leaderboards] (category)}
			<Category {leaderboards} title={category} />
		{/each}
	</div>
</div>
