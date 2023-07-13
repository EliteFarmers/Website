<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PageData } from './$types';
	import Category from './category.svelte';

	export let data: PageData;

	$: categories = data.categories;

	$: ({ skills, general, collections } = categories)
</script>

<Head
	title="Elite | Leaderboards"
	description="View the various leaderboards available on the site! See the top thousand farmers in every crop!"
/>

<main class="flex flex-col gap-16 mb-16 px-8">
	<h1 class="text-4xl text-center mt-16">Leaderboards</h1>

	<div class="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 w-full">
		<Category leaderboards={general} title="General" />
		<Category leaderboards={collections.sort((a, b) => a.name.localeCompare(b.name))} title="Collections" grow={2} />
		<Category leaderboards={skills.sort((a, b) => a.name.localeCompare(b.name))} title="Skills" />
	</div>
</main>
