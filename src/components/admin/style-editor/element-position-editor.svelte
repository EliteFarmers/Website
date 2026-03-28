<script lang="ts">
	import type { ElementPosition } from '$lib/styles/style';
	import { ColorField, NumberField, PositionField, StringField } from './fields';
	import OptionalSection from './optional-section.svelte';

	interface Props {
		value: ElementPosition;
	}

	let { value = $bindable() }: Props = $props();
</script>

<PositionField label="position" bind:value={value.position} />
<StringField label="font" bind:value={value.font} placeholder="Font name" />
<NumberField label="fontSize" bind:value={value.fontSize} min={1} max={200} />
<ColorField label="fill" bind:value={value.fill} />
<NumberField label="maxWidth" bind:value={value.maxWidth} min={0} />
<NumberField label="maxHeight" bind:value={value.maxHeight} min={0} />

<OptionalSection
	title="outline"
	present={value.outline != null}
	onadd={() => (value.outline = {})}
	onremove={() => (value.outline = undefined)}
>
	{#if value.outline}
		<ColorField label="fill" bind:value={value.outline.fill} />
		<NumberField label="opacity" bind:value={value.outline.opacity} min={0} max={1} step={0.01} slider />
		<NumberField label="width" bind:value={value.outline.width} min={0} max={50} />
	{/if}
</OptionalSection>

<OptionalSection
	title="background"
	present={value.background != null}
	onadd={() => (value.background = {})}
	onremove={() => (value.background = undefined)}
>
	{#if value.background}
		<ColorField label="fill" bind:value={value.background.fill} />
		<NumberField label="opacity" bind:value={value.background.opacity} min={0} max={1} step={0.01} slider />
		<NumberField label="padding" bind:value={value.background.padding} min={0} />
		<NumberField label="radius" bind:value={value.background.radius} min={0} />
	{/if}
</OptionalSection>
