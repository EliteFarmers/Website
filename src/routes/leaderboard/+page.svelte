<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PageData } from './$types';
	import Category from './category.svelte';

	export let data: PageData;

	$: categories = data.categories;

	$: ({ skills, general, collections, pest, milestones } = categories);
</script>

<Head
	title="Elite | Leaderboards"
	description="View the various leaderboards available on the site! See the 5 thousand farmers in every crop!"
/>

<main class="flex flex-col gap-16 mb-16 px-8 items-center">
	<h1 class="text-4xl text-center mt-16">Leaderboards</h1>

	<div class="flex flex-wrap justify-center items-center lg:items-start gap-4 w-full max-w-6xl">
		<Category leaderboards={general} title="General" />
		<Category leaderboards={collections.sort((a, b) => a.name.localeCompare(b.name))} title="Collections" />
		<Category leaderboards={pest} title="Pests" />
		<Category leaderboards={skills.sort((a, b) => a.name.localeCompare(b.name))} title="Skills" />
		<Category leaderboards={milestones.sort((a, b) => a.name.localeCompare(b.name))} title="Milestones" />
	</div>
</main>
