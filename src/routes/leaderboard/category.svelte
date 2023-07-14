<script lang="ts">
	import type { LeaderboardConfig } from '$lib/constants/leaderboards';

	export let leaderboards: (LeaderboardConfig & { id: string })[];
	export let title: string;
	export let grow = 1;
</script>

<section class="flex flex-col flex-1 col-span-{grow} items-center justify-center gap-4 w-full">
	<h2 class="text-3xl pt-8 py-6">{title}</h2>

	<div class="flex flex-col gap-2 h-full px-4 pb-4 w-full">
		{#each leaderboards as leaderboard (leaderboard.id)}
			<a
				href="/leaderboard/{leaderboard.id}"
				class="flex-1 p-4 items-center rounded-md bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 hover:dark:bg-zinc-700"
			>
				<div class="flex flex-row gap-4 items-center">
					{#if leaderboard.icon}
						<img src={leaderboard.icon} class="w-12 h-12 rounded-md" alt={leaderboard.name} />
					{/if}
					<h6 class="text-center text-2xl">{leaderboard.name}</h6>
				</div>
			</a>
		{/each}
	</div>
</section>

<style lang="postcss">
	img {
		display: inline-block;
		aspect-ratio: 1;
		image-rendering: pixelated;
	}
</style>
