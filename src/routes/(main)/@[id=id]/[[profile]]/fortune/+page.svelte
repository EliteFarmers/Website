<script lang="ts">
	import Head from '$comp/head.svelte';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Skeleton } from '$ui/skeleton';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';
	import Content from './content.svelte';

	const ctx = getStatsContext();
	const ratesData = getRatesData();

	let { data }: PageProps = $props();

	onMount(async () => {
		if (data.importedSettings) {
			tick().then(() => {
				$ratesData.communityCenter = data.importedSettings.communityCenter ?? $ratesData.communityCenter;
				$ratesData.strength = data.importedSettings.strength ?? $ratesData.strength;
				$ratesData.attributes = data.importedSettings.attributes ?? $ratesData.attributes;
				$ratesData.chips = data.importedSettings.chips ?? $ratesData.chips;

				const from = data.importedSettings.from;
				toast.success(`Successfully imported settings ${from ? 'from ' + from : ''}!`, {
					duration: 5000,
				});
			});
		} else if (data.importedSettingsError) {
			tick().then(() => {
				toast.error(`Error: ${data.importedSettingsError}`, {
					duration: 7000,
				});
			});
		}

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
	canonicalPath="/@{ctx.ign}/{encodeURIComponent(ctx.selectedProfile?.profileName ?? '')}/fortune"
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
	<div class="flex flex-col items-center gap-4 md:flex-row">
		<Skeleton class="h-8xl w-full" />
		<Skeleton class="h-8xl w-full" />
	</div>
{/if}
