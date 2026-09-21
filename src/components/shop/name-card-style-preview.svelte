<script lang="ts">
	import type { WeightStyleWithDataDto } from '$lib/api';
	import ResponsiveNameCard from '$comp/name-card/responsive-name-card.svelte';
	import NameCardFramePreview from './name-card-frame-preview.svelte';
	let {
		style,
		ign,
		uuid,
		weight = 12345,
		rank = 3113,
		prefix = '',
	}: {
		style: WeightStyleWithDataDto;
		ign: string;
		uuid: string;
		weight?: number;
		rank?: number;
		prefix?: string;
	} = $props();
</script>

{#if style.nameCard}
	<ResponsiveNameCard
		card={style.nameCard}
		{ign}
		{uuid}
		{prefix}
		{weight}
		{rank}
		imageRefs={style.imageRefs}
		frame={style.frame?.nameCard}
	/>
{:else}
	<NameCardFramePreview {style} {ign} {uuid} {weight} {rank} />
{/if}
