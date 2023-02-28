<script lang="ts">
	import { page } from '$app/stores';
	import Head from '$comp/head.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Head title="Player Not Found" description="This player could not be found, maybe you meant one of these?" />

<main class="flex flex-col justify-center items-center w-full">
	<section class="flex flex-col justify-center items-center w-full">
		<h1 class="text-center text-3xl mt-16 mb-8">Player Not Found</h1>
		<article class="w-10/12 md:w-1/2">
			<p class="text-lg my-4">
				We couldn't find a player with the name <strong>{$page.params.id}</strong>. Maybe you meant one of
				these?
			</p>
			{#each data.similar as suggestion}
				<div class="bg-gray-100 dark:bg-zinc-800 rounded-md m-2">
					<a class="p-2 flex flex-row" href="/stats/{suggestion.ign}">
						<img
							class="w-8 h-8 m-2"
							src="https://mc-heads.net/avatar/{suggestion.uuid}"
							alt="{suggestion.ign} Player Head"
						/>
						<h1>
							<strong>{suggestion.ign}</strong>
						</h1>
					</a>
				</div>
			{/each}
		</article>
	</section>
</main>
