<script lang="ts">
	import type { LeaderboardConfig } from '$lib/constants/leaderboards';

	interface Props {
		leaderboards: (LeaderboardConfig & { id: string })[];
		title: string;
	}

	let { leaderboards, title }: Props = $props();
</script>

<section class="flex w-full flex-1 basis-64 flex-col items-center justify-center gap-4">
	<h2 class="py-6 pt-8 text-3xl">{title}</h2>

	<div class="flex h-full w-full flex-1 flex-wrap items-center justify-center gap-2 px-4">
		{#each leaderboards as leaderboard (leaderboard.id)}
			<a
				href="/leaderboard/{leaderboard.id}"
				class="w-full max-w-64 flex-shrink-0 items-center rounded-md bg-primary-foreground p-2 px-3 hover:bg-primary-foreground/50"
			>
				<div class="flex flex-row items-center gap-2">
					{#if leaderboard.icon}
						<img
							src={leaderboard.icon}
							class="pixelated inline-block aspect-square h-6 w-6 rounded-md"
							alt={leaderboard.name}
						/>
					{/if}
					<h6 class="whitespace-nowrap text-center text-xl">{leaderboard.name}</h6>
				</div>
			</a>
		{/each}
	</div>
</section>
