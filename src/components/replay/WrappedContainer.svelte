<script lang="ts">
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { initRecapContext } from '$lib/stores/recap.svelte';
	import X from '@lucide/svelte/icons/x';
	import { untrack, type Snippet } from 'svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import SlideContainer from './SlideContainer.svelte';

	let {
		children,
		playerUuid,
		profileUuid,
		profileName,
		year,
		noperms,
	}: {
		children: Snippet;
		playerUuid: string;
		profileName: string;
		profileUuid: string;
		year: number;
		noperms: Snippet;
	} = $props();

	const context = initRecapContext((() => ({ playerUuid, profileName, profileUuid, year }))());

	$effect(() => {
		if (playerUuid != context.playerUuid || profileUuid != context.profileUuid || year != context.year) {
			untrack(() => {
				context.setPlayerProfile({ playerUuid, profileUuid, profileName, year });
			});
		}
	});
</script>

{#if !context.authed}
	{#if context.loading || !context.recap.current}
		<LoadingScreen />
	{:else}
		{@render noperms?.()}
	{/if}
{:else}
	<SlideContainer>
		{@render children()}
		{#snippet body()}
			<div class="absolute top-6 left-4 z-100 flex items-center gap-2 sm:top-7">
				<PlayerHead uuid={playerUuid} class="size-5 md:size-6" />
				<div class="flex flex-col items-start">
					<span class="text-sm leading-none font-semibold md:text-base"
						>{context.data.player.ign}'s {year} Recap</span
					>
					<span class="text-xs text-white/50 md:text-sm">{profileName}</span>
				</div>
			</div>
			<a href="/recap" class="absolute top-7 right-7 z-100 flex items-center gap-2">
				<X class="size-6 cursor-pointer hover:text-white/75 md:size-8" />
			</a>
			<div
				class="absolute bottom-2 z-100 flex w-full items-center justify-center gap-2 text-xs text-white/50 sm:text-sm"
			>
				<span>elitebot.dev/recap</span>
				<a href="/info/recap" target="_blank" class="hover:underline">Learn More</a>
			</div>
		{/snippet}
	</SlideContainer>
{/if}
