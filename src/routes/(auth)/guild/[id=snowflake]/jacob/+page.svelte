<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card } from 'flowbite-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: features = data.guild?.features;
</script>

<main class="flex flex-col items-center">
	<div class="flex flex-row items-center gap-4">
		<img class="w-16 h-16" src="https://cdn.discordapp.com/icons/{data.guildId}/{data.guild?.icon}.webp" alt="Guild Icon">
		<h1 class="text-4xl my-16">
			{data.guild?.name}
		</h1>
	</div>

	<section class="flex flex-col gap-2">
		<p class="text-lg">You have {data.leaderboards?.length ?? 0} / {data.maxLeaderboards} available Jacob Leaderboards created</p>
		{#if (data.leaderboards?.length ?? 0) < (data.maxLeaderboards ?? 0)}
			<form
				method="POST"
				action="?/create"
				class="flex w-full mb-16 justify-center items-center"
				use:enhance
			>
				<Button type="submit">
					Create New
				</Button>
			</form>
		{/if}
	</section>
	
	{#each data.leaderboards ?? [] as lb (lb.id)}
		<section>
			<h3>
				{data.guild?.name} Jacob Leaderboard
			</h3>
		</section>
	{/each}

</main>
