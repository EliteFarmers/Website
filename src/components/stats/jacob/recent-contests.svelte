<script lang="ts">
	import { page } from '$app/state';
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import ContestList from './contest-list.svelte';

	interface Props {
		contests: components['schemas']['JacobDataDto']['contests'];
	}

	let { contests }: Props = $props();

	let recentContests = $derived(
		contests
			?.slice()
			?.sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0))
			.slice(0, 30) ?? []
	);
</script>

<div class="flex flex-col items-center md:items-start">
	<h1 class="my-2 text-2xl">Recent Contests</h1>

	{#if recentContests.length > 0}
		<div class="flex flex-col items-center gap-2">
			<ContestList contests={recentContests} />
			<Button
				href={page.url.pathname + '/contests'}
				data-sveltekit-preload-data="off"
				class="w-48"
				variant="outline"
			>
				View All
			</Button>
		</div>
	{:else}
		<p class="text-lg">No contests found.</p>
	{/if}
</div>
