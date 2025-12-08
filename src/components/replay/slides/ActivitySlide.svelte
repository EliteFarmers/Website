<script lang="ts">
	import type { PlayerRecapInfo } from '$lib/api/schemas';
	import * as Item from '$ui/item/index.js';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Flame from '@lucide/svelte/icons/flame';

	interface Props {
		data: PlayerRecapInfo;
	}

	let { data }: Props = $props();

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-cyan-950 to-black p-8 text-white"
>
	<h2
		class="animate-fade-in mb-12 bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl"
	>
		Time Well Spent
	</h2>

	<div class="animate-scale-in grid w-full max-w-3xl grid-cols-1 gap-6 delay-200">
		<!-- Days Active -->
		<Item.Root variant="outline" class="border-cyan-500/20 bg-cyan-950/10 p-8 backdrop-blur-sm">
			<Item.Media
				variant="icon"
				class="mb-4 flex size-20 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400"
			>
				<Calendar class="size-10" />
			</Item.Media>
			<Item.Content class="">
				<Item.Title class="mb-2 text-6xl font-black text-white">{data.daysActive}</Item.Title>
				<Item.Description class="text-xl text-cyan-200"
					>Day{data.daysActive !== 1 ? 's' : ''} Active</Item.Description
				>
			</Item.Content>
		</Item.Root>

		<!-- Most Active Month -->
		<Item.Root variant="outline" class="border-blue-500/20 bg-blue-950/10 p-8 backdrop-blur-sm">
			<Item.Media
				variant="icon"
				class="mb-4 flex size-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-400"
			>
				<Flame class="size-10" />
			</Item.Media>
			<Item.Content class="">
				<Item.Title class="mb-2 text-6xl font-black text-white">{data.mostActiveMonth}</Item.Title>
				<Item.Description class="text-xl text-blue-200">Most Active Month</Item.Description>
			</Item.Content>
		</Item.Root>
	</div>

	<div
		class="animate-fade-in mt-12 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-zinc-400 backdrop-blur-sm delay-500"
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
			transform: scale(0.9);
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
	.delay-200 {
		animation-delay: 0.2s;
	}
	.delay-500 {
		animation-delay: 0.5s;
	}
</style>
