<script lang="ts">
	import ProfileEventMember from '$comp/events/profile-event-member.svelte';
	import Farmingtools from '$comp/items/tools/farmingtools.svelte';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();
</script>

{#if ctx.tools.length || ctx.member.current?.events?.length || ctx.member.loading || ctx.farmingInventory.loading}
	<div class="flex flex-1 flex-col gap-2">
		{#each ctx.member.current?.events ?? [] as event (event.eventId)}
			<ProfileEventMember member={event} />
		{/each}
		<Farmingtools />
	</div>
{/if}
