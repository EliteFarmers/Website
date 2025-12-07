<script lang="ts">
	import type { EventRecap } from '$lib/api/schemas';

	interface Props {
		data: EventRecap[];
	}

	let { data }: Props = $props();

	let participatedEvents = $derived(data.filter((e) => e.participated));
	let missedEvents = $derived(data.filter((e) => !e.participated));

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'farmingWeight':
				return '⚖️';
			case 'pests':
				return '🐛';
			case 'medals':
				return '🥇';
			case 'collection':
				return '📦';
			case 'experience':
				return '✨';
			default:
				return '📅';
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'farmingWeight':
				return 'text-yellow-400';
			case 'pests':
				return 'text-red-400';
			case 'medals':
				return 'text-orange-400';
			case 'collection':
				return 'text-lime-400';
			case 'experience':
				return 'text-cyan-400';
			default:
				return 'text-white';
		}
	};
</script>

<div class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900 p-8">
	<h2 class="animate-fade-in mb-8 text-4xl font-bold text-purple-300 md:text-5xl">Event Horizon</h2>

	<div class="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Participated Events -->
		<div class="animate-slide-up flex flex-col gap-4 delay-100">
			<h3 class="text-2xl font-bold text-white">Participated</h3>
			<div class="custom-scrollbar flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-2">
				{#each participatedEvents as event, i}
					<div
						class="relative flex items-center justify-between overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-transform hover:scale-105"
						style:animation-delay="{i * 100}ms"
					>
						<!-- Mock Banner Background -->
						{#if event.banner}
							<div class="absolute inset-0 z-0 opacity-20">
								<!-- In a real app, use the banner URL. For now, just a gradient placeholder if no image -->
								<div class="h-full w-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
							</div>
						{/if}

						<div class="z-10 flex items-center gap-3">
							<span class="text-2xl">{getTypeIcon(event.type)}</span>
							<div>
								<p class="font-bold text-white">{event.name}</p>
								<p class="text-xs {getTypeColor(event.type)} tracking-wider uppercase opacity-80">
									{event.type}
								</p>
								{#if event.score}
									<p class="text-xs text-gray-300">Score: {event.score.toLocaleString()}</p>
								{/if}
							</div>
						</div>

						{#if event.rank}
							<div class="z-10 text-right">
								<p class="text-2xl font-black text-white">#{event.rank}</p>
								<p class="text-[10px] tracking-wider text-purple-300 uppercase">Rank</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Missed Events -->
		<div class="animate-slide-up flex flex-col gap-4 delay-300">
			<h3 class="text-2xl font-bold text-gray-400">Missed Opportunities</h3>
			<div class="flex flex-wrap gap-2">
				{#each missedEvents as event}
					<div
						class="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-400"
					>
						<span>{getTypeIcon(event.type)}</span>
						<span>{event.name}</span>
					</div>
				{/each}
			</div>

			{#if participatedEvents.length > 0}
				<div class="mt-auto rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6 text-center">
					<p class="text-lg text-purple-200">Best Performance</p>
					{#if participatedEvents.some((e) => e.rank)}
						{@const best = participatedEvents
							.filter((e) => e.rank)
							.sort((a, b) => (a.rank || 999999) - (b.rank || 999999))[0]}
						<p class="mt-2 text-3xl font-black text-white">{best.name}</p>
						<div class="mt-2 flex justify-center gap-4">
							<div>
								<p class="text-sm text-purple-300">Rank</p>
								<p class="text-xl font-bold text-yellow-400">#{best.rank}</p>
							</div>
							<div>
								<p class="text-sm text-purple-300">Score</p>
								<p class="text-xl font-bold text-white">{best.score?.toLocaleString()}</p>
							</div>
						</div>
					{:else}
						<p class="mt-2 text-xl font-bold text-white">Thanks for participating!</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
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
