<script lang="ts">
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import * as Item from '$ui/item/index.js';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Flame from '@lucide/svelte/icons/flame';

	const context = getRecapContext();
	let data = $derived(context.data);

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center overflow-auto bg-linear-to-b from-cyan-950 to-black p-4 text-white md:p-8"
>
	<h2
		class="animate-fade-in mb-6 bg-linear-to-r from-cyan-300 to-blue-500 bg-clip-text text-center text-3xl font-bold text-transparent md:mb-12 md:text-5xl"
	>
		Time Well Spent
	</h2>

	<div class="animate-scale-in grid w-full max-w-xl grid-cols-1 gap-4 delay-200 md:gap-6">
		<!-- Days Active -->
		<Item.Root variant="outline" class="border-cyan-500/20 bg-cyan-950/10 p-4 backdrop-blur-sm md:p-8">
			<Item.Media
				variant="icon"
				class="mb-2 flex size-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 md:mb-4 md:size-20"
			>
				<Calendar class="size-6 md:size-10" />
			</Item.Media>
			<Item.Content class="">
				<Item.Title class="mb-1 text-4xl font-black text-white md:mb-2 md:text-6xl"
					>{data.player.daysActive}</Item.Title
				>
				<Item.Description class="text-lg text-cyan-200 md:text-xl"
					>Day{data.player.daysActive !== 1 ? 's' : ''} Active</Item.Description
				>
			</Item.Content>
		</Item.Root>

		<!-- Most Active Month -->
		<Item.Root variant="outline" class="border-blue-500/20 bg-blue-950/10 p-4 backdrop-blur-sm md:p-8">
			<Item.Media
				variant="icon"
				class="mb-2 flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 md:mb-4 md:size-20"
			>
				<Flame class="size-6 md:size-10" />
			</Item.Media>
			<Item.Content class="">
				<Item.Title class="mb-1 text-4xl font-black text-white md:mb-2 md:text-6xl"
					>{data.player.mostActiveMonth || 'N/A'}</Item.Title
				>
				<Item.Description class="text-lg text-blue-200 md:text-xl">Most Active Month</Item.Description>
			</Item.Content>
		</Item.Root>
	</div>

	<div
		class="animate-fade-in mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-center text-xs text-zinc-400 backdrop-blur-sm delay-500 md:mt-12 md:p-4 md:text-sm"
	>
		<p>
			Tracking Period: <span class="font-bold text-white">{formatDate(data.player.firstDataPoint)}</span> -
			<span class="font-bold text-white">{formatDate(data.player.lastDataPoint)}</span>
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
