<script lang="ts">
	import type { PlayerRecapInfo } from '$lib/api/schemas';

	interface Props {
		data: PlayerRecapInfo;
	}

	let { data }: Props = $props();

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
</script>

<div class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-cyan-900 to-blue-900 p-8">
	<h2 class="animate-fade-in mb-12 text-4xl font-bold text-cyan-300 md:text-5xl">Time Well Spent</h2>

	<div class="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
		<!-- Days Active -->
		<div
			class="animate-scale-in flex flex-col items-center justify-center rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-center backdrop-blur-sm delay-100"
		>
			<div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/20 text-4xl">📅</div>
			<p class="text-6xl font-black text-white">{data.daysActive}</p>
			<p class="text-xl text-cyan-200">Days Active</p>
		</div>

		<!-- Most Active Month -->
		<div
			class="animate-scale-in flex flex-col items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 p-8 text-center backdrop-blur-sm delay-300"
		>
			<div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-400/20 text-4xl">🔥</div>
			<p class="text-6xl font-black text-white">{data.mostActiveMonth}</p>
			<p class="text-xl text-blue-200">Most Active Month</p>
		</div>
	</div>

	<div
		class="animate-fade-in mt-12 rounded-xl bg-black/30 p-4 text-center text-sm text-gray-300 backdrop-blur-sm delay-500"
	>
		<p>
			Tracking Period: <span class="font-bold text-white">{formatDate(data.firstDataPoint)}</span> -
			<span class="font-bold text-white">{formatDate(data.lastDataPoint)}</span>
		</p>
	</div>
</div>

<style>
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
		animation: scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		opacity: 0;
	}
	.delay-100 {
		animation-delay: 0.1s;
	}
	.delay-300 {
		animation-delay: 0.3s;
	}
	.delay-500 {
		animation-delay: 0.5s;
	}
</style>
