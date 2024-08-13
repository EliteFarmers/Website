<script lang="ts">
	import { MINECRAFT_COLORS } from '$lib/constants/colors';
	import { getRarityColor, type GardenVisitorStatsWithName } from 'farming-weight';
	import * as Popover from '$ui/popover';

	export let visitor: GardenVisitorStatsWithName;

	$: color = MINECRAFT_COLORS[getRarityColor(visitor.rarity) as keyof typeof MINECRAFT_COLORS];
	$: rejected = visitor.visits - visitor.accepted;
	$: rate = ((visitor.accepted / visitor.visits) * 100).toFixed(1);

	$: everAccepted = visitor.accepted > 0;
</script>

<Popover.Mobile>
	<div
		slot="trigger"
		class="flex basis-32 flex-row gap-1 p-1 rounded-md border-l-4 bg-primary-foreground overflow-ellipsis"
		style="border-color:{color};"
	>
		<p class={!everAccepted ? 'text-muted-foreground' : ''}>{visitor.short ?? visitor.name}</p>
	</div>
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
