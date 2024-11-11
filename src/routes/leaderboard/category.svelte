<script lang="ts">
	import type { LeaderboardConfig } from '$lib/constants/leaderboards';

	interface Props {
		leaderboards: (LeaderboardConfig & { id: string })[];
		title: string;
	}

	let { leaderboards, title }: Props = $props();
</script>

<section class="flex flex-col flex-1 basis-64 items-center justify-center gap-4 w-full">
	<h2 class="text-3xl pt-8 py-6">{title}</h2>

	<div class="flex flex-wrap gap-2 h-full px-4 w-full flex-1 justify-center items-center">
		{#each leaderboards as leaderboard (leaderboard.id)}
			<a
				href="/leaderboard/{leaderboard.id}"
				class="flex-shrink-0 w-full max-w-64 p-2 px-3 items-center rounded-md bg-primary-foreground hover:bg-primary-foreground/50"
			>
				<div class="flex flex-row gap-2 items-center">
					{#if leaderboard.icon}
						<img
							src={leaderboard.icon}
							class="w-6 h-6 rounded-md inline-block aspect-square pixelated"
							alt={leaderboard.name}
						/>
					{/if}
					<h6 class="text-center text-xl whitespace-nowrap">{leaderboard.name}</h6>
				</div>
			</a>
		{/each}
	</div>
</section>
