<script lang="ts">
	import type { EventRecap } from '$lib/api/schemas';
	import * as Item from '$ui/item/index.js';
	import Bug from '@lucide/svelte/icons/bug';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Medal from '@lucide/svelte/icons/medal';
	import Package from '@lucide/svelte/icons/package';
	import Scale from '@lucide/svelte/icons/scale';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	interface Props {
		data: EventRecap[];
		year?: number | string;
	}

	let { data, year = new Date().getFullYear() }: Props = $props();

	let participatedEvents = $derived(data.filter((e) => e.participated));

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'farmingWeight':
				return Scale;
			case 'pests':
				return Bug;
			case 'medals':
				return Medal;
			case 'collection':
				return Package;
			case 'experience':
				return Sparkles;
			default:
				return Calendar;
		}
	};
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-violet-950 to-black p-8 text-white"
>
	<h2
		class="animate-fade-in mb-8 bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl"
	>
		Event Horizon
	</h2>

	{#if participatedEvents.length > 0}
		<div class="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Participated Events -->
			<div class="animate-slide-up flex flex-col gap-4 delay-100">
				<h3 class="text-2xl font-bold text-white">Participated</h3>
				<div class="custom-scrollbar flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-2">
					{#each participatedEvents as event, i (event.name || i)}
						<Item.Root
							variant="outline"
							class="border-white/10 bg-white/5 backdrop-blur-sm transition-transform hover:scale-105"
							style="animation-delay: {i * 100}ms"
						>
							<Item.Media variant="icon" class="text-violet-400">
								{@const Icon = getTypeIcon(event.type)}
								<Icon class="size-6" />
							</Item.Media>
							<Item.Content>
								<Item.Title class="text-white">{event.name}</Item.Title>
								<Item.Description>{event.type}</Item.Description>
								{#if event.score}
									<p class="text-xs text-zinc-400">Score: {event.score.toLocaleString()}</p>
								{/if}
							</Item.Content>
							{#if event.rank}
								<Item.Actions class="flex-col items-end justify-center gap-0">
									<span class="text-lg font-bold text-white">#{event.rank}</span>
									<span class="text-[10px] text-zinc-400 uppercase">Rank</span>
								</Item.Actions>
							{/if}
						</Item.Root>
					{/each}
				</div>
			</div>

			<!-- Best Performance -->
			<div class="animate-slide-up flex flex-col justify-center gap-4 delay-300">
				<div class="mt-auto mb-auto w-full">
					<Item.Root
						variant="outline"
						class="flex-col items-center justify-center border-purple-500/20 bg-purple-500/10 p-6 text-center"
					>
						<Item.Content class="items-center">
							<Item.Description class="text-purple-200">Best Performance</Item.Description>
							{#if participatedEvents.some((e) => e.rank)}
								{@const best = participatedEvents
									.filter((e) => e.rank)
									.sort((a, b) => (a.rank || 999999) - (b.rank || 999999))[0]}
								<Item.Title class="py-2 text-3xl font-black text-white">{best.name}</Item.Title>
								<div class="flex gap-8">
									<div class="text-center">
										<p class="text-xs text-purple-300 uppercase">Rank</p>
										<p class="text-xl font-bold text-yellow-400">#{best.rank}</p>
									</div>
									<div class="text-center">
										<p class="text-xs text-purple-300 uppercase">Score</p>
										<p class="text-xl font-bold text-white">{best.score?.toLocaleString()}</p>
									</div>
								</div>
							{:else}
								<Item.Title>Thanks for participating!</Item.Title>
							{/if}
						</Item.Content>
					</Item.Root>
				</div>
			</div>
		</div>
	{:else}
		<div class="animate-slide-up flex flex-col items-center justify-center gap-4 delay-100">
			<div
				class="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md transition-transform hover:scale-105"
			>
				<div class="mb-4 flex justify-center">
					<Calendar class="size-16 text-zinc-600" />
				</div>
				<p class="text-xl font-medium text-zinc-300">
					You didn't participate in any events in {year}!
				</p>
				<p class="mt-2 text-sm text-zinc-500">Maybe next year?</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fade-in 1s ease-out forwards;
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-slide-up {
		animation: slide-up 0.6s ease-out forwards;
		opacity: 0;
	}
	.delay-100 {
		animation-delay: 0.1s;
	}
	.delay-300 {
		animation-delay: 0.3s;
	}
</style>
