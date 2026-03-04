<script lang="ts">
	import { goto } from '$app/navigation';
	import Head from '$comp/head.svelte';
	import PlayerSearch from '$comp/player-search.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { Button } from '$ui/button';
	import * as Card from '$ui/card';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Search from '@lucide/svelte/icons/search';

	let open = $state(false);
	const gbl = getGlobalContext();
</script>

<Head
	title="Fortune Stats"
	description="View your fortune progress, profit calculations, and cheapest fortune upgrades for any Hypixel Skyblock player!"
/>

<div class="flex min-h-screen flex-col items-center">
	<div class="mb-16 flex flex-col items-center gap-12 pt-8">
		<div class="flex flex-col items-center gap-4">
			<h1 class="mt-16 text-center text-4xl">Fortune Stats</h1>
			<p class="text-muted-foreground text-center text-lg">
				Check your farming fortune progress and view cheapest fortune upgrades!
			</p>
		</div>

		<Button
			onclick={() => (open = true)}
			class="bg-card mx-auto flex w-full max-w-lg flex-row gap-2 rounded-lg border-[3px] p-4 lg:flex-1"
			variant="outline"
			size="lg"
		>
			<Search class="-ml-0.5" />
			<span class="text-muted-foreground flex-1">Search for your fortune...</span>
		</Button>
		<PlayerSearch
			bind:open
			useButton={false}
			class="mx-auto w-full max-w-lg min-w-48"
			cmd={(player) => goto(`/@${player}/fortune#fortune`)}
		/>

		{#if gbl.session?.uuid}
			<a class="group flex flex-row items-center gap-10 rounded-md border p-6" href="/me/fortune">
				<div class="flex flex-row items-center gap-3">
					<PlayerHead class="size-10" uuid={gbl.session.uuid} />

					<div class="flex flex-col">
						<div class="font-medium">My Fortune Stats</div>
						<div class="text-muted-foreground text-sm">{gbl.session.fIgn}</div>
					</div>
				</div>
				<ArrowRight class="group-hover:animate-bounce-horizontal mr-2 size-6" />
			</a>
		{/if}
	</div>

	<div class="mb-16 flex max-w-4xl flex-col items-center justify-center gap-6">
		<Card.Root class="flex w-full items-start gap-6 p-4 not-first-of-type:flex-row md:p-6">
			<div class="flex flex-col gap-2">
				<Card.Title class="text-xl">Fortune Progress</Card.Title>
				<Card.Description class="text-base">
					Get a comprehensive view of your farming fortune across all crops and equipment. Track your progress
					towards max farming fortune!
				</Card.Description>
			</div>
		</Card.Root>

		<Card.Root class="flex w-full items-start gap-6 p-4 not-first-of-type:flex-row md:p-6">
			<div class="flex flex-col gap-2">
				<Card.Title class="text-xl">Cheapest Upgrades</Card.Title>
				<Card.Description class="text-base">
					View a list of your personal cheapest fortune upgrades based on your current gear to help you
					maximize your farming fortune per coins spent!
				</Card.Description>
			</div>
		</Card.Root>

		<Card.Root class="flex w-full items-start gap-6 p-4 not-first-of-type:flex-row md:p-6">
			<div class="flex flex-col gap-2">
				<Card.Title class="text-xl">Rates Calculator</Card.Title>
				<Card.Description class="text-base">
					Calculate your estimated profit rates based on your current farming fortune! Make sure you customize
					the settings on your page to get the most accurate estimates!
				</Card.Description>
			</div>
		</Card.Root>
	</div>

	<Button
		onclick={() => (open = true)}
		class="bg-card mx-auto flex w-full max-w-lg flex-row gap-2 rounded-lg border-[3px] p-4 lg:flex-1"
		variant="outline"
		size="lg"
	>
		<Search class="-ml-0.5" />
		<span class="text-muted-foreground flex-1">Search for your fortune...</span>
	</Button>
</div>
