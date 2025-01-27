<script lang="ts">
	import { MINECRAFT_COLORS } from '$lib/constants/colors';
	import { getRarityColor, type GardenVisitor } from 'farming-weight';
	import * as Popover from '$ui/popover';

	interface Props {
		visitor: GardenVisitor;
	}

	let { visitor }: Props = $props();

	let color = $derived(MINECRAFT_COLORS[getRarityColor(visitor.rarity) as keyof typeof MINECRAFT_COLORS]);
</script>

<Popover.Mobile>
	{#snippet trigger()}
		<div
			class="flex basis-32 flex-row gap-1 overflow-ellipsis rounded-md border-l-4 bg-primary-foreground p-1"
			style="border-color:{color};"
		>
			<p>{visitor.short ?? visitor.name}</p>
		</div>
	{/snippet}
	<div class="flex flex-col gap-1">
		<p class="font-semibold">{visitor.name}</p>
		<a href={visitor.wiki} class="text-link hover:underline">Hypixel Wiki</a>
	</div>
</Popover.Mobile>
