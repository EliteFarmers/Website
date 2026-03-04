<script lang="ts">
	import { getRecapContext } from '$lib/stores/recap.svelte';
	import { Crop, CROP_INFO, getCropFromName } from 'farming-weight';

	const context = getRecapContext();
	let data = $derived(context.current?.global);

	const formatCompact = (num: number | bigint) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
	const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

	let coinValue = $derived.by(() => {
		let total = BigInt(0);
		for (const [crop, amount] of Object.entries(data?.totalCropsBreakdown ?? {})) {
			total += BigInt(CROP_INFO[getCropFromName(crop) ?? Crop.Wheat].npc) * BigInt(amount);
		}
		return total;
	});
</script>

{#if data}
	<div
		class="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-900 to-gray-900 p-4 pt-16 md:p-8"
	>
		<h2 class="animate-fade-in mb-8 shrink-0 text-center text-3xl font-bold text-slate-300 md:mb-16 md:text-5xl">
			Community Impact
		</h2>

		<div class="custom-scrollbar w-full max-w-7xl overflow-y-auto">
			<div class="grid grid-cols-2 gap-3 pb-4 md:grid-cols-3 md:gap-8 md:pb-8">
				<!-- Big Stats -->
				<div class="col-span-2 grid grid-cols-2 gap-3 md:col-span-3 md:grid-cols-2 md:gap-8">
					<div
						class="animate-pop-in rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-center delay-100 md:rounded-3xl md:p-8"
					>
						<p class="mb-1 text-xs text-blue-400 md:mb-2 md:text-lg">Total Crops Farmed</p>
						<p class="text-xl font-black text-white md:text-5xl">{formatCompact(data.totalCrops)}</p>
					</div>
					<div
						class="animate-pop-in rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center delay-200 md:rounded-3xl md:p-8"
					>
						<p class="mb-1 text-xs text-yellow-400 md:mb-2 md:text-lg">Total Crops NPC Value</p>
						<p class="text-xl font-black text-white md:text-5xl">{formatCompact(coinValue)}</p>
					</div>
					<div
						class="animate-pop-in rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center delay-300 md:rounded-3xl md:p-8"
					>
						<p class="mb-1 text-xs text-rose-400 md:mb-2 md:text-lg">Total Pests Killed</p>
						<p class="text-xl font-black text-white md:text-5xl">{formatCompact(data.totalPests)}</p>
					</div>
					<div
						class="animate-pop-in rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-center delay-300 md:col-span-1 md:rounded-3xl md:p-8"
					>
						<p class="mb-1 text-xs text-purple-400 md:mb-2 md:text-lg">Total XP Gained</p>
						<p class="text-xl font-black text-white md:text-5xl">{formatCompact(data.totalXp)}</p>
					</div>
				</div>

				<!-- Fun Stats -->
				<div
					class="animate-slide-up flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 delay-400 md:rounded-2xl md:p-6"
				>
					<p class="mb-1 text-lg font-bold text-green-400 md:mb-2 md:text-4xl">
						{formatNumber(data.ironmanToNormal)}
					</p>
					<p class="text-center text-xs text-green-200/70 md:text-base">Ironman ➔ Normal Conversions</p>
				</div>

				<div
					class="animate-slide-up flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-3 delay-500 md:rounded-2xl md:p-6"
				>
					<p class="mb-1 text-lg font-bold text-red-400 md:mb-2 md:text-4xl">
						{formatNumber(data.bannedWiped)}
					</p>
					<p class="text-center text-xs text-red-200/70 md:text-base">Wiped/Kicked Members</p>
				</div>

				<div
					class="animate-slide-up col-span-2 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 delay-600 md:col-span-1 md:rounded-2xl md:p-6"
				>
					<p class="mb-1 text-lg font-bold text-white md:mb-2 md:text-4xl">
						{formatNumber(data.trackedPlayers)}
					</p>
					<p class="text-center text-xs text-gray-400 md:text-base">Included Farmers</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
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
	}

	@keyframes pop-in {
		0% {
			opacity: 0;
			transform: scale(0.5);
		}
		70% {
			transform: scale(1.1);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
	.animate-pop-in {
		animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		opacity: 0;
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
	.delay-200 {
		animation-delay: 0.2s;
	}
	.delay-300 {
		animation-delay: 0.3s;
	}
	.delay-400 {
		animation-delay: 0.4s;
	}
	.delay-500 {
		animation-delay: 0.5s;
	}
	.delay-600 {
		animation-delay: 0.6s;
	}
</style>
