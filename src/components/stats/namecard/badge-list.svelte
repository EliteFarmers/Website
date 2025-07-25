<script lang="ts">
	import Badge from '$comp/stats/badge.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();

	const badgeList = $derived(
		ctx.account.badges?.filter((b) => b.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? []
	);
</script>

<div class="mx-4 mt-6 flex w-full flex-wrap justify-center gap-2 align-middle">
	{#each badgeList as badge (badge.id)}
		<Badge {badge} />
	{/each}
</div>
