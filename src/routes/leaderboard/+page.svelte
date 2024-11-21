<script lang="ts">
	import Head from '$comp/head.svelte';
	import type { PageData } from './$types';
	import Category from './category.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let categories = $derived(data.categories);

	let { skills, general, collections, pest, milestones } = $derived(categories);
</script>

<Head
	title="Elite | Leaderboards"
	description="View the various leaderboards available on the site! See the 5 thousand farmers in every crop!"
/>

<main class="mb-16 flex flex-col items-center gap-16 px-8">
	<h1 class="mt-16 text-center text-4xl">Leaderboards</h1>

	<div class="flex w-full max-w-6xl flex-wrap items-center justify-center gap-4 lg:items-start">
		<Category leaderboards={general} title="General" />
		<Category leaderboards={collections.sort((a, b) => a.name.localeCompare(b.name))} title="Collections" />
		<Category leaderboards={pest} title="Pests" />
		<Category leaderboards={skills.sort((a, b) => a.name.localeCompare(b.name))} title="Skills" />
		<Category leaderboards={milestones.sort((a, b) => a.name.localeCompare(b.name))} title="Milestones" />
	</div>
</main>
