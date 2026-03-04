<script lang="ts">
	import Head from '$comp/head.svelte';
	import PlayerHead from '$comp/sidebar/player-head.svelte';
	import { Button } from '$ui/button';
	import Info from '@lucide/svelte/icons/info';
	import X from '@lucide/svelte/icons/x';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Head
	title="{data.year} Recap - Select Account"
	description="Select an account to view your {data.year} highlights on Elite."
/>

<div
	class="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-zinc-900 to-black p-8 text-white"
>
	<!-- Navigation Buttons -->
	<div class="absolute top-4 right-4 z-10 md:top-8 md:right-8">
		<Button
			href="/recap"
			variant="ghost"
			size="icon"
			class="rounded-full text-white/50 hover:bg-white/10 hover:text-white"
		>
			<X class="size-6 md:size-8" />
		</Button>
	</div>

	<div class="absolute top-4 left-4 z-10 md:top-8 md:left-8">
		<Button
			href="/info/recap"
			variant="ghost"
			class="gap-2 rounded-full text-white/50 hover:bg-white/10 hover:text-white"
		>
			<Info class="size-5 md:size-6" />
			<span class="hidden md:inline">Learn More</span>
		</Button>
	</div>

	<!-- Main Content -->
	<div class="flex w-full max-w-4xl flex-col items-center gap-8 md:gap-12">
		<div class="text-center">
			<h1
				class="bg-linear-to-r from-yellow-200 to-yellow-500 bg-clip-text text-4xl font-black text-transparent md:text-6xl"
			>
				Select Account
			</h1>
			<p class="mt-2 text-lg font-medium text-white/60 md:text-2xl">
				Choose an account to view {data.year} highlights
			</p>
		</div>

		<div class="flex w-full max-w-2xl flex-wrap justify-center gap-4">
			{#each data.accounts ?? [] as account (account.id)}
				<a
					href="/recap/{data.year}/{account.name}"
					class="group relative flex flex-row items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 hover:shadow-xl hover:shadow-yellow-500/20 sm:min-w-64 md:flex-col"
				>
					<div class="relative">
						<div
							class="absolute -inset-4 rounded-full bg-yellow-500/20 blur-xl transition-all group-hover:bg-yellow-500/40"
						></div>
						<PlayerHead uuid={account.id} class="relative size-10 shadow-lg sm:size-16 md:size-20" />
					</div>
					<div class="flex flex-col items-center justify-center">
						<span class="text-xl font-bold text-white group-hover:text-yellow-200 md:text-2xl"
							>{account.name}</span
						>
						<span class="mt-1 text-xs tracking-widest text-white/40 uppercase">View Stats</span>
					</div>
				</a>
			{:else}
				<a
					href="/profile"
					class="group relative flex flex-row items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 hover:shadow-xl hover:shadow-yellow-500/20 sm:min-w-64 md:flex-col"
				>
					<div class="flex flex-col items-center justify-center">
						<span class="text-xl font-bold text-white group-hover:text-yellow-200 md:text-2xl"
							>No Linked Accounts!</span
						>
						<span class="mt-1 text-sm text-white/40">Click here to link one</span>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
