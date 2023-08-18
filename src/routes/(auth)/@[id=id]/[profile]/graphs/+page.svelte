<script lang="ts">
	import Graph from '$comp/charts/collectiongraph.svelte';
	import Cropselector from '$comp/stats/contests/cropselector.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main class="flex flex-col gap-2 justify-center items-center my-16">
	<h1 class="text-4xl">{data.account.name} | {data.selectedProfile.profileName}</h1>
	<p>Discord ID: {data.account.discordId}</p>
	<p>Discord: {data.account.discordUsername}</p>

	<Cropselector />

	<div class="flex flex-col gap-4 w-full">
		<Graph points={data.collectionGraph ?? []} />
		<!-- <Skillgraph points={data.skillGraph ?? []} /> -->
	</div>
</main>
