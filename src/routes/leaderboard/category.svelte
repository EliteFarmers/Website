<script lang="ts">
	import type { LeaderboardInfo } from '$lib/constants/leaderboards';
	import * as Tooltip from '$ui/tooltip';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import Hourglass from '@lucide/svelte/icons/hourglass';
	interface Props {
		leaderboards?: LeaderboardInfo[];
		title: string;
	}

	let { leaderboards, title }: Props = $props();
</script>

<section class="flex w-full flex-1 basis-64 flex-col items-center justify-center gap-4">
	<h2 class="py-6 pt-8 text-3xl">{title}</h2>

	<div class="flex h-full w-full flex-1 flex-wrap items-center justify-center gap-2">
		{#each leaderboards ?? [] as lb (lb.id)}
			<div class="flex h-12 w-full max-w-64 flex-row items-center gap-2">
				<div class="flex flex-1 items-center justify-center">
					<a
						href="/leaderboard/{lb.id}"
						class="flex-1 items-center rounded-md border-2 bg-card p-2 px-3 hover:bg-card/50"
					>
						<div class="flex flex-row items-center gap-2">
							{#if lb.icon}
								<img
									src={lb.icon}
									class="pixelated inline-block aspect-square h-6 w-6 rounded-md"
									alt={lb.short ?? lb.title}
								/>
							{/if}
							<h6 class="whitespace-nowrap text-center text-xl">{lb.short ?? lb.title}</h6>
						</div>
					</a>
				</div>
				{#each lb.intervals ?? [] as interval (interval)}
					{#if interval !== 'current'}
						<div class="flex flex-col items-center justify-center">
							<Tooltip.Simple>
								{#snippet child({ props })}
									<a
										{...props}
										href="/leaderboard/{lb.id}-{interval}"
										class="flex aspect-square h-full flex-row items-center rounded-md border-2 bg-card p-3 hover:bg-card/50"
									>
										{#if interval === 'monthly'}
											<CalendarClock class="size-5" />
										{:else if interval === 'weekly'}
											<Hourglass class="size-5" />
										{/if}
									</a>
								{/snippet}
								<p>View Monthly Leaderboard</p>
							</Tooltip.Simple>
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</section>
