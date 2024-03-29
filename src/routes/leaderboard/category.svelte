<script lang="ts">
	import type { LeaderboardConfig } from '$lib/constants/leaderboards';

	export let leaderboards: (LeaderboardConfig & { id: string })[];
	export let title: string;
</script>

<section class="flex flex-col flex-1 basis-72 items-center justify-center gap-4 w-full">
	<h2 class="text-3xl pt-8 py-6">{title}</h2>

	<div class="flex flex-col gap-2 h-full px-4 pb-4 w-full justify-center items-center">
		{#each leaderboards as leaderboard (leaderboard.id)}
			<a
				href="/leaderboard/{leaderboard.id}"
				class="max-w-md flex-1 flex-shrink-0 w-full p-2 px-4 items-center rounded-md bg-primary-foreground hover:bg-primary-foreground/50"
			>
				<div class="flex flex-row gap-4 items-center">
					{#if leaderboard.icon}
						<img
							src={leaderboard.icon}
							class="w-8 h-8 rounded-md inline-block aspect-square pixelated"
							alt={leaderboard.name}
						/>
					{/if}
					<h6 class="text-center text-2xl">{leaderboard.name}</h6>
				</div>
			</a>
		{/each}
	</div>
</section>
