<script lang="ts">
	import { getProfilesAccount } from '$lib/remote';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import Content from './content.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const stats = $derived(
		getProfilesAccount({
			id: data.paramsId,
			profile: data.paramsProfile,
		})
	);
</script>

{#await stats}
	<div
		class="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4"
		in:fade={{ delay: 300 }}
	>
		<LoaderCircle class="text-muted-foreground size-32 animate-spin" />
		<p class="font-semibold">Loading data...</p>
	</div>
{:then data}
	{#if data.code || data.error}
		<h1 class="m-16 p-16 text-center font-mono text-6xl font-bold">{data.code}</h1>
		<h4 class="font-lighter text-center text-2xl">{data.error}</h4>
		<div class="item m-12 mb-32 flex flex-row justify-center gap-4 text-center">
			<a href="/" class="shadow-gray 0 bg-muted hover:bg-card rounded-md p-4 shadow-md">Return Home</a>
			<button
				onclick={() => location.reload()}
				class="shadow-gray bg-muted hover:bg-card rounded-md p-4 shadow-md">Reload</button
			>
		</div>
	{:else}
		<Content data={data as Exclude<typeof data, { code: number; error: string }>}>
			{@render children?.()}
		</Content>
	{/if}
{/await}
