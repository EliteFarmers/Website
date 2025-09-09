<script lang="ts">
	import Head from '$comp/head.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Skeleton } from '$ui/skeleton';
	import { onMount, tick } from 'svelte';
	import Content from './content.svelte';

	const ctx = getStatsContext();

	onMount(async () => {
		const hash = window.location.hash;
		if (hash) {
			if (!ctx.ready) {
				await ctx.member;
				await tick();
			}

			const element = document.querySelector(hash);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
	});
</script>

<Head
	title="{ctx.ignMeta} | Farming Fortune"
	description="See missing fortune upgrades, overall progress, and your expected farming rates in Hypixel Skyblock!"
/>

{#if ctx.ready}
	<Content />
{:else}
	<div class="my-4 flex h-16 flex-row justify-center gap-4 overflow-x-hidden">
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
		<Skeleton class="aspect-square size-16" />
	</div>
	<div class="flex flex-col items-center gap-8 md:flex-row">
		<Skeleton class="h-8xl w-full" />
		<Skeleton class="h-8xl w-full" />
	</div>
{/if}
