<script lang="ts">
	import type { LeaderboardStyle } from '$lib/styles/style';
	import { ScrollArea } from '$ui/scroll-area';
	import { ColorField, EnumField, ImageRefField, NumberField, StringField } from './fields';
	import OptionalSection from './optional-section.svelte';

	interface Props {
		value: LeaderboardStyle;
		imageRefs?: Record<string, { url?: string }>;
	}

	let { value = $bindable(), imageRefs = {} }: Props = $props();

	const alignOptions = [
		{ value: 'flex-start', label: 'flex-start' },
		{ value: 'center', label: 'center' },
		{ value: 'flex-end', label: 'flex-end' },
	];

	const layerNames = ['background', 'overlay'] as const;
	const textNames = ['name', 'score', 'rank', 'subtitle'] as const;
</script>

<ScrollArea class="flex max-h-100 w-full flex-col rounded-md border p-2">
	<div class="flex flex-col gap-0.5">
		<!-- Layers -->
		{#each layerNames as name (name)}
			<OptionalSection
				title={name}
				present={value[name] != null}
				onadd={() => (value[name] = {})}
				onremove={() => (value[name] = undefined)}
			>
				{#if value[name]}
					{@const layer = value[name]}
					<ImageRefField label="imageUrl" bind:value={layer.imageUrl} {imageRefs} />
					<StringField label="imageOpacity" bind:value={layer.imageOpacity} placeholder="0-1" />
					<ColorField label="fillColor" bind:value={layer.fillColor} />
					<NumberField
						label="fillOpacity"
						bind:value={layer.fillOpacity}
						min={0}
						max={1}
						step={0.01}
						slider
					/>
					<ColorField label="borderColor" bind:value={layer.borderColor} />
					<NumberField
						label="borderOpacity"
						bind:value={layer.borderOpacity}
						min={0}
						max={1}
						step={0.01}
						slider
					/>
					<EnumField label="align" bind:value={layer.align} options={alignOptions} />
				{/if}
			</OptionalSection>
		{/each}

		<!-- Global properties -->
		<NumberField label="gradientOpacity" bind:value={value.gradientOpacity} min={0} max={1} step={0.01} slider />
		<ColorField label="gradientColor" bind:value={value.gradientColor} />
		<StringField label="font" bind:value={value.font} placeholder="Font name" />

		<!-- Text styles -->
		{#each textNames as name (name)}
			<OptionalSection
				title={name}
				present={value[name] != null}
				onadd={() => (value[name] = {})}
				onremove={() => (value[name] = undefined)}
			>
				{#if value[name]}
					{@const text = value[name]}
					<ColorField label="color" bind:value={text.color} />
					<ColorField label="shadowColor" bind:value={text.shadowColor} />
					<NumberField
						label="shadowOpacity"
						bind:value={text.shadowOpacity}
						min={0}
						max={1}
						step={0.01}
						slider
					/>
					<NumberField label="fontWeight" bind:value={text.fontWeight} min={100} max={900} step={100} />
				{/if}
			</OptionalSection>
		{/each}
	</div>
</ScrollArea>
