<script lang="ts">
	import { page } from '$app/stores';
	import type { YearlyRecapData } from '$lib/api/schemas';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		data: YearlyRecapData;
	}

	let { data }: Props = $props();

	let showShareModal = $state(false);
	let isPublic = $state(false);
	let copied = $state(false);

	function toggleShareModal() {
		showShareModal = !showShareModal;
	}

	function copyLink(withPassword = false) {
		let url = $page.url.href;
		if (withPassword) {
			url += '?key=random-secret-key-123';
		}
		navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	const formatCompact = (num: number) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
</script>

<div
	class="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-gray-900 to-black p-4"
>
	<h2
		class="animate-fade-in mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-center text-4xl font-bold text-transparent md:mb-8 md:text-5xl"
	>
		That's a Wrap!
	</h2>

	<div
		class="animate-scale-in mb-6 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md delay-200"
	>
		<div class="mb-4 flex items-center justify-center gap-4">
			<div class="h-16 w-16 overflow-hidden rounded-full border-2 border-yellow-400">
				<img src={data.player.skin} alt={data.player.ign} class="h-full w-full object-cover" />
			</div>
			<div class="text-left">
				<h3 class="text-2xl font-bold text-white">{data.player.ign}</h3>
				<p class="text-sm text-gray-400">{data.year} Farming Legend</p>
			</div>
		</div>

		<div class="mb-6 grid grid-cols-2 gap-3 text-left">
			<div class="rounded-lg bg-black/30 p-3">
				<p class="text-[10px] text-gray-400 uppercase">Farming Weight</p>
				<p class="text-lg font-bold text-yellow-300">+{formatCompact(data.player.farmingWeight.gained)}</p>
			</div>
			<div class="rounded-lg bg-black/30 p-3">
				<p class="text-[10px] text-gray-400 uppercase">Top Crop</p>
				<p class="truncate text-lg font-bold text-yellow-300">
					{Object.entries(data.collections.increases).sort(([, a], [, b]) => Number(b) - Number(a))?.[0]?.[0]}
				</p>
			</div>
			<div class="rounded-lg bg-black/30 p-3">
				<p class="text-[10px] text-gray-400 uppercase">Contests</p>
				<p class="text-lg font-bold text-yellow-300">{data.contests.total}</p>
			</div>
			<div class="rounded-lg bg-black/30 p-3">
				<p class="text-[10px] text-gray-400 uppercase">Pests</p>
				<p class="text-lg font-bold text-yellow-300">{data.pests.kills}</p>
			</div>
		</div>

		<!-- All Profiles Summary -->
		<div class="mb-4 border-t border-white/10 pt-4">
			<p class="mb-2 text-xs tracking-wider text-gray-400 uppercase">All Profiles Stats</p>
			<div class="flex justify-between text-sm">
				<span
					>Total Weight: <span class="font-bold text-white"
						>{formatCompact(data.allProfilesSummary.totalWeightGained)}</span
					></span
				>
				<span
					>Coins: <span class="font-bold text-white"
						>{formatCompact(data.allProfilesSummary.totalCoinsGained)}</span
					></span
				>
			</div>
			{#if data.allProfilesSummary.wipedProfiles > 0}
				<p class="mt-2 text-xs text-red-400">💀 {data.allProfilesSummary.wipedProfiles} Profile(s) Wiped</p>
			{/if}
		</div>
	</div>

	<!-- Profile Switcher -->
	<div class="animate-fade-in mb-8 flex flex-wrap justify-center gap-2 delay-500">
		{#each data.profiles as profile}
			<a
				href="/replay/{data.year}/{data.player.ign}/{profile.name}"
				data-sveltekit-reload
				class="rounded-full border border-white/20 px-3 py-1 text-xs font-bold transition-colors
				{profile.name === data.currentProfile
					? 'border-yellow-500 bg-yellow-500 text-black'
					: 'bg-black/40 text-gray-300 hover:bg-white/10'}"
			>
				{profile.cuteName}
				{profile.wiped ? '💀' : ''}
			</a>
		{/each}
	</div>

	<button
		onclick={toggleShareModal}
		class="group animate-fade-in relative rounded-full bg-white px-8 py-3 text-lg font-bold text-black shadow-lg shadow-white/10 transition-transform delay-500 hover:scale-105"
	>
		Share Your Replay
	</button>

	{#if showShareModal}
		<div
			class="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
			transition:fade
		>
			<div class="w-full max-w-sm rounded-3xl border border-gray-700 bg-gray-900 p-6" transition:scale>
				<h3 class="mb-4 text-center text-xl font-bold text-white">Share Options</h3>

				<div class="mb-4 flex items-center justify-between rounded-xl bg-black/30 p-3">
					<div>
						<p class="text-sm font-bold text-white">Make Public</p>
						<p class="text-[10px] text-gray-400">Allow anyone to view with your IGN</p>
					</div>
					<button
						class="relative h-5 w-10 rounded-full transition-colors {isPublic
							? 'bg-green-500'
							: 'bg-gray-600'}"
						onclick={() => (isPublic = !isPublic)}
					>
						<div
							class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform {isPublic
								? 'translate-x-5'
								: ''}"
						></div>
					</button>
				</div>

				<div class="space-y-2">
					<button
						onclick={() => copyLink(false)}
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200"
					>
						{#if copied}<span>Copied!</span>{:else}<span>Copy Public Link</span>{/if}
					</button>

					<button
						onclick={() => copyLink(true)}
						class="w-full rounded-xl border border-gray-600 bg-gray-800 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
					>
						Copy Private Link (with Key)
					</button>
				</div>

				<button
					onclick={toggleShareModal}
					class="mt-4 w-full text-center text-sm text-gray-400 hover:text-white"
				>
					Close
				</button>
			</div>
		</div>
	{/if}
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
		animation: fade-in 0.8s ease-out forwards;
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
		animation: scale-in 0.6s ease-out forwards;
		opacity: 0;
	}
	.delay-200 {
		animation-delay: 0.2s;
	}
	.delay-500 {
		animation-delay: 0.5s;
	}
</style>
