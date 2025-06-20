<script lang="ts">
	import { MINECRAFT_COLORS } from '$lib/constants/colors';
	import { getRarityColor, type GardenVisitorStatsWithName } from 'farming-weight';
	import * as Popover from '$ui/popover';

	interface Props {
		visitor: GardenVisitorStatsWithName;
	}

	let { visitor }: Props = $props();

	let color = $derived(MINECRAFT_COLORS[getRarityColor(visitor.rarity) as keyof typeof MINECRAFT_COLORS]);
	let rejected = $derived(visitor.visits - visitor.accepted);
	let rate = $derived(((visitor.accepted / visitor.visits) * 100).toFixed(1));

	let everAccepted = $derived(visitor.accepted > 0);
</script>

<Popover.Mobile>
	{#snippet trigger()}
		<div
			class="flex basis-32 flex-row gap-1 text-ellipsis rounded-md border-l-4 bg-card p-1"
			style="border-color:{color};"
		>
			<p class={!everAccepted ? 'text-muted-foreground' : ''}>{visitor.short ?? visitor.name}</p>
		</div>
	{/snippet}
	<div class="flex flex-col gap-1">
		<p class="font-semibold">{visitor.name}</p>
		<p class="">
			<span class="font-semibold">{visitor.accepted.toLocaleString()}</span> Accepted
		</p>
		<p class="">
			<span class="font-semibold">{rejected.toLocaleString()}</span> Rejected
		</p>
		<p class="">
			<span class="font-semibold">{rate}%</span> Acceptance Rate
		</p>
	</div>
</Popover.Mobile>
