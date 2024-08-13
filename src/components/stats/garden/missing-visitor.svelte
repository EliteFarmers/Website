<script lang="ts">
	import { MINECRAFT_COLORS } from '$lib/constants/colors';
	import { getRarityColor, type GardenVisitor } from 'farming-weight';
	import * as Popover from '$ui/popover';

	export let visitor: GardenVisitor;

	$: color = MINECRAFT_COLORS[getRarityColor(visitor.rarity) as keyof typeof MINECRAFT_COLORS];
</script>

<Popover.Mobile>
	<div
		slot="trigger"
		class="flex basis-32 flex-row gap-1 p-1 rounded-md border-l-4 bg-primary-foreground overflow-ellipsis"
		style="border-color:{color};"
	>
		<p>{visitor.short ?? visitor.name}</p>
	</div>
	<div class="flex flex-col gap-1">
		<p class="font-semibold">{visitor.name}</p>
		<a href={visitor.wiki} class="text-blue-400 hover:underline">Hypixel Wiki</a>
	</div>
</Popover.Mobile>
