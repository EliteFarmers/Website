<script lang="ts">
	import { page } from '$app/state';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { PUBLIC_HOST_URL } from '$env/static/public';
	import { type YearlyRecapDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { toggleRecapVisibilityCommand } from '$lib/remote';
	import { Button } from '$ui/button/index.js';
	import * as Item from '$ui/item/index.js';
	import Bug from '@lucide/svelte/icons/bug';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Globe from '@lucide/svelte/icons/globe';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Scale from '@lucide/svelte/icons/scale';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Wheat from '@lucide/svelte/icons/wheat';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		data: YearlyRecapDto;
		profileUuid: string;
	}

	let { data, profileUuid }: Props = $props();
	const gbl = getGlobalContext();

	let showShareModal = $state(false);
	let isPublic = $derived(data.public);
	let isLoading = $state(false);
	let copied = $state(false);

	let recap = $derived(data.data);
	let isOwner = $derived(gbl.session?.id === data.discord.id);

	function toggleShareModal() {
		if (isOwner) {
			showShareModal = !showShareModal;
			return;
		}

		if (navigator.share) {
			navigator
				.share({
					title: `${recap.player.ign}'s ${recap.year} Farming Recap`,
					url: page.url.href,
				})
				.catch((error) => console.error('Error sharing', error));
		} else {
			copyLink();
		}
	}

	async function toggleVisibility() {
		if (isLoading) return;
		isLoading = true;
		const newValue = !isPublic;
		try {
			const { problem } = await toggleRecapVisibilityCommand({
				year: +recap.year,
				playerUuid: data.playerUuid,
				profileUuid,
				makePublic: newValue,
			});
			if (!problem) {
				isPublic = newValue;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isLoading = false;
		}
	}

	function copyLink() {
		let url = page.url.href;

		navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	const formatCompact = (num: number) =>
		new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

	let title = $derived.by(() => {
		if (recap.player.farmingWeight.gained >= 10000) {
			return 'Legendary Farmer';
		}
		if (recap.player.farmingWeight.gained >= 5000) {
			return 'Master Farmer';
		}
		if (recap.player.farmingWeight.gained >= 1000) {
			return 'Pro Farmer';
		}
		return 'Farmer';
	});
</script>

<div
	class="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-linear-to-b from-zinc-900 to-black p-4 text-zinc-100"
>
	<div class="animate-scale-in w-full max-w-md space-y-6 delay-200">
		<!-- User Profile -->
		<Item.Root variant="outline" class="relative border-white/10 bg-white/5 backdrop-blur-md">
			<Item.Media>
				<PlayerHead uuid={recap.player.uuid} class="size-16" />
			</Item.Media>
			<Item.Content>
				<Item.Title class="text-xl font-bold text-white">{recap.player.ign}</Item.Title>
				<Item.Description class="text-zinc-400">{recap.year} {title}</Item.Description>
			</Item.Content>
			<div class="absolute right-1 bottom-1">
				<p class="text-xs text-zinc-600">
					{PUBLIC_HOST_URL.replace('https://', '')}/recap
				</p>
			</div>
		</Item.Root>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 gap-4">
			<Item.Root variant="muted" class="bg-white/5">
				<Item.Media variant="icon" class="text-yellow-400">
					<Scale class="size-5" />
				</Item.Media>
				<Item.Content>
					<Item.Description>Weight Gained</Item.Description>
					<Item.Title class="text-lg">+{formatCompact(recap.player.farmingWeight.gained)}</Item.Title>
				</Item.Content>
			</Item.Root>

			<Item.Root variant="muted" class="bg-white/5">
				<Item.Media variant="icon" class="text-green-400">
					<Wheat class="size-5" />
				</Item.Media>
				<Item.Content>
					<Item.Description>Top Crop</Item.Description>
					<Item.Title class="truncate text-lg">
						{Object.entries(recap.collections.increases).sort(
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
					<Item.Title class="text-lg">{recap.contests.total.toLocaleString()}</Item.Title>
				</Item.Content>
			</Item.Root>

			<Item.Root variant="muted" class="bg-white/5">
				<Item.Media variant="icon" class="text-red-400">
					<Bug class="size-5" />
				</Item.Media>
				<Item.Content>
					<Item.Description>Pest Kills</Item.Description>
					<Item.Title class="text-lg">{recap.pests.kills.toLocaleString()}</Item.Title>
				</Item.Content>
			</Item.Root>
		</div>

		<!-- All Profiles Summary -->
		<Item.Root variant="outline" class="border-white/10 bg-white/5">
			<Item.Content>
				<Item.Title class="text-sm font-medium tracking-wider text-zinc-400 uppercase"
					>Combined Profiles Stats</Item.Title
				>
				<div class="mt-2 flex justify-between text-sm">
					<span
						>Weight Gained: <span class="font-bold text-white"
							>{formatCompact(recap.allProfilesSummary.totalWeightGained)}</span
						></span
					>
					<span
						>Networth: <span class="font-bold text-white"
							>{formatCompact(recap.allProfilesSummary.totalCoinsGained)}</span
						></span
					>
				</div>
			</Item.Content>
		</Item.Root>

		<!-- Profile Switcher -->
		{#if isOwner}
			<div class="animate-fade-in flex flex-wrap justify-center gap-2 delay-500">
				{#each recap.profiles as profile, i (i)}
					{#if !profile.wiped}
						<a
							href="/replay/{recap.year}/{recap.player.ign}/{profile.name}"
							data-sveltekit-reload
							class="rounded-full border px-3 py-1 text-xs font-bold transition-colors {profile.name ===
							recap.currentProfile
								? 'border-yellow-500 bg-yellow-500 text-black'
								: 'border-white/20 bg-black/40 text-zinc-300 hover:bg-white/10'}"
						>
							{profile.cuteName}
						</a>
					{/if}
				{/each}
			</div>
		{/if}

		<!-- Share Button -->
		<div class="animate-fade-in flex justify-center delay-500">
			<Button
				onclick={toggleShareModal}
				size="lg"
				class="rounded-full bg-white text-black shadow-lg shadow-white/10 hover:bg-zinc-200"
			>
				{#if copied}
					<Check class="mr-2 size-4" /> Link Copied!
				{:else}
					<Share2 class="mr-2 size-4" /> Share This Recap
				{/if}
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
							onclick={toggleVisibility}
							aria-label="Toggle Public"
							disabled={isLoading}
						>
							{#if isLoading}
								<div class="flex h-full w-full items-center justify-center">
									<Loader2 class="size-4 animate-spin text-white" />
								</div>
							{:else}
								<div
									class="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform {isPublic
										? 'translate-x-5'
										: ''}"
								></div>
							{/if}
						</button>
					</Item.Actions>
				</Item.Root>

				<div class="space-y-3">
					<Button onclick={copyLink} variant="secondary" class="w-full justify-center font-bold">
						{#if copied}<Check class="mr-2 size-4" /> Copied!{:else}<Copy class="mr-2 size-4" /> Copy Public
							Link{/if}
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
