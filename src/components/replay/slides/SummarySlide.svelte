<script lang="ts">
	import { page } from '$app/stores';
	import type { YearlyRecapData } from '$lib/api/schemas';
	import { Button } from '$ui/button/index.js';
	import * as Item from '$ui/item/index.js';
	import Bug from '@lucide/svelte/icons/bug';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Globe from '@lucide/svelte/icons/globe';
	import Lock from '@lucide/svelte/icons/lock';
	import Scale from '@lucide/svelte/icons/scale';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Wheat from '@lucide/svelte/icons/wheat';
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
	class="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-zinc-900 to-black p-4 text-zinc-100"
>
	<h2
		class="animate-fade-in mb-8 bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-center text-4xl font-bold text-transparent md:text-5xl"
	>
		That's a Wrap!
	</h2>

	<div class="animate-scale-in w-full max-w-md space-y-6 delay-200">
		<!-- User Profile -->
		<Item.Root variant="outline" class="border-white/10 bg-white/5 backdrop-blur-md">
			<Item.Media>
				<img
					src={data.player.skin}
					alt={data.player.ign}
					class="aspect-square h-full w-full rounded-md object-cover"
				/>
			</Item.Media>
			<Item.Content>
				<Item.Title class="text-xl font-bold text-white">{data.player.ign}</Item.Title>
				<Item.Description class="text-zinc-400">{data.year} Farming Legend</Item.Description>
			</Item.Content>
		</Item.Root>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 gap-4">
			<Item.Root variant="muted" class="bg-white/5">
				<Item.Media variant="icon" class="text-yellow-400">
					<Scale class="size-5" />
				</Item.Media>
				<Item.Content>
					<Item.Description>Weight Gained</Item.Description>
					<Item.Title class="text-lg">+{formatCompact(data.player.farmingWeight.gained)}</Item.Title>
				</Item.Content>
			</Item.Root>

			<Item.Root variant="muted" class="bg-white/5">
				<Item.Media variant="icon" class="text-green-400">
					<Wheat class="size-5" />
				</Item.Media>
				<Item.Content>
					<Item.Description>Top Crop</Item.Description>
					<Item.Title class="truncate text-lg">
						{Object.entries(data.collections.increases).sort(
							([, a], [, b]) => Number(b) - Number(a)
						)?.[0]?.[0]}
					</Item.Title>
				</Item.Content>
			</Item.Root>

			<Item.Root variant="muted" class="bg-white/5">
				<Item.Media variant="icon" class="text-amber-400">
					<Trophy class="size-5" />
				</Item.Media>
				<Item.Content>
					<Item.Description>Contests</Item.Description>
					<Item.Title class="text-lg">{data.contests.total}</Item.Title>
				</Item.Content>
			</Item.Root>

			<Item.Root variant="muted" class="bg-white/5">
				<Item.Media variant="icon" class="text-red-400">
					<Bug class="size-5" />
				</Item.Media>
				<Item.Content>
					<Item.Description>Pests Kills</Item.Description>
					<Item.Title class="text-lg">{data.pests.kills}</Item.Title>
				</Item.Content>
			</Item.Root>
		</div>

		<!-- All Profiles Summary -->
		<Item.Root variant="outline" class="border-white/10 bg-white/5">
			<Item.Content>
				<Item.Title class="text-sm font-medium tracking-wider text-zinc-400 uppercase"
					>All Profiles Stats</Item.Title
				>
				<div class="mt-2 flex justify-between text-sm">
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
					<p class="mt-2 text-xs text-red-400">
						💀 {data.allProfilesSummary.wipedProfiles} Profile(s) Wiped
					</p>
				{/if}
			</Item.Content>
		</Item.Root>

		<!-- Profile Switcher -->
		<div class="animate-fade-in flex flex-wrap justify-center gap-2 delay-500">
			{#each data.profiles as profile}
				<a
					href="/replay/{data.year}/{data.player.ign}/{profile.name}"
					data-sveltekit-reload
					class="rounded-full border px-3 py-1 text-xs font-bold transition-colors {profile.name ===
					data.currentProfile
						? 'border-yellow-500 bg-yellow-500 text-black'
						: 'border-white/20 bg-black/40 text-zinc-300 hover:bg-white/10'}"
				>
					{profile.cuteName}
					{profile.wiped ? '💀' : ''}
				</a>
			{/each}
		</div>

		<!-- Share Button -->
		<div class="animate-fade-in flex justify-center delay-500">
			<Button
				onclick={toggleShareModal}
				size="lg"
				class="rounded-full bg-white text-black shadow-lg shadow-white/10 hover:bg-zinc-200"
			>
				<Share2 class="mr-2 size-4" /> Share Your Replay
			</Button>
		</div>
	</div>

	{#if showShareModal}
		<div
			class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
			transition:fade
		>
			<div class="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl" transition:scale>
				<h3 class="mb-6 text-center text-xl font-bold text-white">Share Options</h3>

				<Item.Root variant="outline" class="mb-4 border-white/10 bg-black/20">
					<Item.Media variant="icon" class={isPublic ? 'text-green-500' : 'text-zinc-500'}>
						<Globe class="size-5" />
					</Item.Media>
					<Item.Content>
						<Item.Title>Make Public</Item.Title>
						<Item.Description>Allow anyone to view with your IGN</Item.Description>
					</Item.Content>
					<Item.Actions>
						<button
							class="relative h-6 w-11 rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none {isPublic
								? 'bg-green-500'
								: 'bg-zinc-700'}"
							onclick={() => (isPublic = !isPublic)}
							aria-label="Toggle Public"
						>
							<div
								class="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform {isPublic
									? 'translate-x-5'
									: ''}"
							></div>
						</button>
					</Item.Actions>
				</Item.Root>

				<div class="space-y-3">
					<Button onclick={() => copyLink(false)} variant="secondary" class="w-full justify-center font-bold">
						{#if copied}<Check class="mr-2 size-4" /> Copied!{:else}<Copy class="mr-2 size-4" /> Copy Public
							Link{/if}
					</Button>

					<Button
						onclick={() => copyLink(true)}
						variant="outline"
						class="w-full justify-center border-zinc-700 font-bold text-zinc-300 hover:bg-zinc-800"
					>
						<Lock class="mr-2 size-4" /> Copy Private Link
					</Button>
				</div>

				<Button onclick={toggleShareModal} variant="ghost" class="mt-4 w-full text-zinc-400 hover:text-white">
					Close
				</Button>
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
			transform: scale(0.95);
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
