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

	const by3Remainder = $derived(byNRemainder(3));
	const by2Remainder = $derived(byNRemainder(2));

	function byNRemainder(n: number) {
		const remainder = (leaderboards?.length ?? 0) % n;
		if (remainder === 0) return 0;
		return n - remainder;
	}
</script>

<section
	class="md:bg-card flex w-full flex-1 flex-col justify-center gap-2 rounded-lg md:border-2 md:p-4"
	data-sveltekit-preload-data="tap"
>
	<h2 class="text-2xl font-semibold">{title}</h2>

	<div
		class="bg-border grid h-full w-full flex-1 border-collapse grid-cols-1 gap-0.5 overflow-clip rounded-md border-2 sm:grid-cols-2 md:grid-cols-3"
	>
		{#each leaderboards ?? [] as lb (lb.id)}
			<div class="bg-background flex h-10 w-full flex-row items-center">
				<div class="flex flex-1 items-center justify-center">
					<a href="/leaderboard/{lb.id}" class="hover:bg-card/60 flex-1 items-center truncate p-2 px-3 pr-0">
						<div class="flex flex-row items-center gap-2">
							{#if lb.icon}
								<img
									src={lb.icon}
									class="pixelated inline-block aspect-square h-6 w-6 rounded-md"
									alt={lb.short ?? lb.title}
								/>
							{/if}
							<span class="truncate text-center whitespace-nowrap">{lb.short ?? lb.title}</span>
						</div>
					</a>
				</div>
				<div class="flex h-full">
					{#each lb.intervals ?? [] as interval (interval)}
						{#if interval !== 'current'}
							<div class="hover:bg-card/60 flex h-full flex-col items-center justify-center">
								<Tooltip.Simple>
									{#snippet child({ props })}
										<a
											{...props}
											href="/leaderboard/{lb.id}-{interval}"
											class="flex aspect-square h-full flex-row items-center justify-center border-l-2"
										>
											{#if interval === 'monthly'}
												<CalendarClock class="size-5" />
											{:else if interval === 'weekly'}
												<Hourglass class="size-5" />
											{/if}
										</a>
									{/snippet}
									{#if interval === 'monthly'}
										<p>View Monthly Leaderboard</p>
									{:else if interval === 'weekly'}
										<p>View Weekly Leaderboard</p>
									{/if}
								</Tooltip.Simple>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
		{#each { length: by3Remainder }}
			{@render empty('hidden md:block')}
		{/each}
		{#each { length: by2Remainder }}
			{@render empty('hidden sm:block md:hidden')}
		{/each}
	</div>
</section>

{#snippet empty(className: string)}
	<div class="bg-background h-10 w-full {className}"></div>
{/snippet}
