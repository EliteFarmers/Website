<script lang="ts">
	import Contest from '$comp/stats/jacob/contest.svelte';
	import { ScrollArea } from '$ui/scroll-area';
	import type { components } from '$lib/api/api';

	interface Props {
		contests: NonNullable<components['schemas']['JacobDataDto']['contests']>;
	}

	let { contests }: Props = $props();
</script>

<ScrollArea orientation="vertical" class="h-96">
	<div class="grid grid-cols-1 items-center justify-center gap-2 px-3 md:grid-cols-2">
		{#each contests as contest (`${contest.crop}${contest.timestamp}`)}
			<Contest {contest} class="w-full" />
		{/each}
	</div>
</ScrollArea>
