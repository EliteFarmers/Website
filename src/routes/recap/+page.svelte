<script lang="ts">
	import Head from '$comp/head.svelte';
	import { Button } from '$ui/button';
	import Info from '@lucide/svelte/icons/info';
	import X from '@lucide/svelte/icons/x';
</script>

<Head title="Elite Farmers Recap" description="Check out your recap for the past year!" />

<div
	class="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-zinc-900 to-black p-8 text-white"
>
	<!-- Navigation Buttons -->
	<div class="absolute top-4 right-4 z-10 md:top-8 md:right-8">
		<Button
			href="/"
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
	<div class="flex flex-col items-center gap-8 md:gap-12">
		<div class="text-center">
			<h1
				class="bg-linear-to-r from-yellow-200 to-yellow-500 bg-clip-text text-5xl font-black text-transparent md:text-7xl"
			>
				Recap
			</h1>
			<p class="mt-2 text-lg font-medium text-white/60 md:text-2xl">Relive your farming journey</p>
		</div>

		<div class="grid w-full max-w-4xl gap-6">
			<a
				href="/recap/2025"
				class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-yellow-500/20 md:p-12"
			>
				<div
					class="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl transition-all group-hover:bg-yellow-500/30"
				></div>
				<div
					class="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl transition-all group-hover:bg-orange-500/30"
				></div>

				<div class="relative z-10 flex flex-col items-center text-center">
					<h2 class="mb-2 text-3xl font-bold text-white md:text-5xl">2025</h2>
					<p class="max-w-md text-sm text-zinc-300 md:text-lg">
						Discover your top crops, pest exterminations, and community impact from the past year.
					</p>
					<span
						class="mt-6 rounded-full bg-white px-6 py-2 text-sm font-bold text-black transition-transform group-hover:scale-105 md:px-8 md:py-3 md:text-base"
					>
						View Recap
					</span>
				</div>
			</a>
		</div>
	</div>

	<!-- Footer -->
	<div class="absolute bottom-4 w-full text-center text-xs text-white/20 md:bottom-8">Elite Farmers &copy; 2025</div>
</div>
