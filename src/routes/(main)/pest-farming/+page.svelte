<script lang="ts">
	import { goto } from '$app/navigation';
	import PlayerSearch from '$comp/player-search.svelte';
	import Head from '$comp/seo/head.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { trackAnalytics } from '$lib/analytics';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Search from '@lucide/svelte/icons/search';

	let open = $state(false);
	const gbl = getGlobalContext();

	function openSearch() {
		open = true;
		trackAnalytics('pest_farming.search_opened');
	}
</script>

<Head
	title="Pest Farming"
	description="View pest farming stats, vacuum progress, and pest-focused upgrades for any Hypixel SkyBlock player."
/>

<div class="flex min-h-screen flex-col items-center">
	<div class="mb-16 flex flex-col items-center gap-12 pt-8">
		<div class="flex flex-col items-center gap-4">
			<h1 class="mt-16 text-center text-4xl">Pest Farming</h1>
			<p class="text-muted-foreground max-w-2xl text-center text-lg">
				Check pest stats, vacuum progress, crop context, and cheapest pest farming upgrades.
			</p>
		</div>

		<Button
			onclick={openSearch}
			class="bg-card mx-auto flex w-full max-w-lg flex-row gap-2 rounded-lg border-[3px] p-4 lg:flex-1"
			variant="outline"
			size="lg"
		>
			<Search class="-ml-0.5" />
			<span class="text-muted-foreground flex-1">Search for pest farming...</span>
		</Button>
		<PlayerSearch
			bind:open
			useButton={false}
			class="mx-auto w-full max-w-lg min-w-48"
			cmd={(player) => goto(`/@${player}/pest-farming`)}
		/>

		{#if gbl.session?.uuid}
			<a class="group flex flex-row items-center gap-10 rounded-md border p-6" href="/me/pest-farming">
				<div class="flex flex-row items-center gap-3">
					<PlayerHead class="size-10" uuid={gbl.session.uuid} />

					<div class="flex flex-col">
						<div class="font-medium">My Pest Farming</div>
						<div class="text-muted-foreground text-sm">{gbl.session.fIgn}</div>
					</div>
				</div>
				<ArrowRight class="group-hover:animate-bounce-horizontal mr-2 size-6" />
			</a>
		{/if}
	</div>

	<div class="mb-16 flex max-w-2xl flex-col items-center justify-center gap-6">
		<Card.Root class="flex w-full items-start gap-6 p-4 not-first-of-type:flex-row md:p-6">
			<div class="flex flex-col gap-2">
				<Card.Title class="text-xl">Pest Stats</Card.Title>
				<Card.Description class="text-base">
					Review Bonus Pest Chance, Pest Kill Fortune, cooldown reduction, Farming Fortune, and Overbloom.
				</Card.Description>
			</div>
		</Card.Root>

		<Card.Root class="flex w-full items-start gap-6 p-4 not-first-of-type:flex-row md:p-6">
			<div class="flex flex-col gap-2">
				<Card.Title class="text-xl">Vacuum Progress</Card.Title>
				<Card.Description class="text-base">
					Track vacuum stats, vacuum upgrades, and crop context separately from the normal fortune page.
				</Card.Description>
			</div>
		</Card.Root>

		<Card.Root class="flex w-full items-start gap-6 p-4 not-first-of-type:flex-row md:p-6">
			<div class="flex flex-col gap-2">
				<Card.Title class="text-xl">Pest Upgrades</Card.Title>
				<Card.Description class="text-base">
					Still a work in progress, but eventually view the cheapest pest farming upgrades and their impact on
					pest stats and vacuum progress.
				</Card.Description>
			</div>
		</Card.Root>
	</div>

	<Button
		onclick={openSearch}
		class="bg-card mx-auto flex max-h-14 w-full max-w-lg flex-row gap-2 rounded-lg border-[3px] p-4 lg:flex-1"
		variant="outline"
		size="lg"
	>
		<Search class="-ml-0.5" />
		<span class="text-muted-foreground flex-1">Search for pest farming...</span>
	</Button>
</div>
