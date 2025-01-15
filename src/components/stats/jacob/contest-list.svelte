<script lang="ts">
	import Contest from '$comp/stats/jacob/contest.svelte';
	import { ScrollArea } from '$ui/scroll-area';
	import type { components } from '$lib/api/api';
	import { Button } from '$ui/button';
	import { page } from '$app/state';

	interface Props {
		contests: NonNullable<components['schemas']['JacobDataDto']['contests']>;
		remaining?: number;
	}

	let { contests, remaining = 0 }: Props = $props();
</script>

<ScrollArea orientation="vertical" class="h-96">
	<div class="flex flex-wrap items-center justify-center gap-2 px-3">
		{#each contests as contest (`${contest.crop}${contest.timestamp}`)}
			<Contest {contest} class="" />
		{/each}
	</div>
	{#if remaining > 0}
		<div class="mt-4 flex flex-col items-center justify-center gap-2">
			<p>
				<span class="text-lg font-semibold">{remaining.toLocaleString()}</span>
				<span>not shown</span>
			</p>
			<Button href={page.url.pathname + '/contests'} variant="outline">View All</Button>
		</div>
	{/if}
</ScrollArea>
