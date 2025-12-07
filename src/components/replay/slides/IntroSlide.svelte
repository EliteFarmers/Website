<script lang="ts">
	import type { PlayerRecapInfo } from '$lib/api/schemas';

	interface Props {
		data: PlayerRecapInfo;
		year: number | string;
	}

	let { data, year }: Props = $props();
</script>

<div class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-8">
	<h1 class="animate-fade-in-up mb-8 text-6xl font-bold">Your {year} Wrapped</h1>

	<div class="animate-scale-in relative mb-6 h-48 w-48">
		<img src={data.skin} alt={data.ign} class="h-full w-full object-contain drop-shadow-2xl" />
	</div>

	<h2 class="mb-4 text-4xl font-bold text-yellow-400">{data.ign}</h2>

	<div class="mb-8 flex items-center gap-4 rounded-xl bg-black/30 p-4 backdrop-blur-sm">
		<img src={data.discord.avatar} alt="Discord" class="h-12 w-12 rounded-full" />
		<span class="text-xl">{data.discord.username}</span>
	</div>
</div>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in-up {
		animation: fade-in-up 1s ease-out forwards;
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.animate-scale-in {
		animation: scale-in 0.8s ease-out 0.3s forwards;
		opacity: 0; /* Start hidden */
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.animate-fade-in {
		animation: fade-in 1s ease-out forwards;
		opacity: 0;
	}
	.delay-300 {
		animation-delay: 0.3s;
		animation-fill-mode: forwards;
	}
	.delay-400 {
		animation-delay: 0.4s;
		animation-fill-mode: forwards;
	}
</style>
