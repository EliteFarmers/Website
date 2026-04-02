<script lang="ts">
	import type { WeightStyle } from '$lib/styles/style';
	import ScrollArea from '$ui/scroll-area/scroll-area.svelte';
	import ArrayEditor from './array-editor.svelte';
	import EditorSection from './editor-section.svelte';
	import ElementPositionEditor from './element-position-editor.svelte';
	import { BooleanField, ColorField, EnumField, ImageRefField, NumberField, PositionField } from './fields';
	import OptionalSection from './optional-section.svelte';

	interface Props {
		value: WeightStyle;
		imageRefs?: Record<string, { url?: string }>;
	}

	let { value = $bindable(), imageRefs = {} }: Props = $props();

	const alignOptions = [
		{ value: 'flex-start', label: 'flex-start' },
		{ value: 'center', label: 'center' },
		{ value: 'flex-end', label: 'flex-end' },
	];

	const elementNames = ['weight', 'label', 'name', 'head', 'badge', 'rank', 'rankWithBadge'] as const;
</script>

<ScrollArea class="flex max-h-100 w-full flex-col rounded-md border p-2">
	<div class="flex flex-col gap-0.5">
		<!-- Decal -->
		<OptionalSection
			title="decal"
			present={value.decal != null}
			onadd={() => (value.decal = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })}
			onremove={() => (value.decal = undefined)}
		>
			{#if value.decal}
				<PositionField label="start" bind:value={value.decal.start} />
				<PositionField label="end" bind:value={value.decal.end} />
				<ColorField label="fill" bind:value={value.decal.fill} />
				<ImageRefField label="imageUrl" bind:value={value.decal.imageUrl} {imageRefs} />
			{/if}
		</OptionalSection>

		<!-- Elements -->
		<EditorSection title="elements">
			<!-- Background (required) -->
			<EditorSection title="background">
				<OptionalSection
					title="size"
					present={value.elements.background.size != null}
					onadd={() => (value.elements.background.size = { x: 800, y: 300 })}
					onremove={() => (value.elements.background.size = undefined)}
				>
					{#if value.elements.background.size}
						<PositionField label="size" bind:value={value.elements.background.size} />
					{/if}
				</OptionalSection>
				<ColorField label="fill" bind:value={value.elements.background.fill} />
				<NumberField
					label="opacity"
					bind:value={value.elements.background.opacity}
					min={0}
					max={1}
					step={0.01}
					slider
				/>
				<NumberField label="radius" bind:value={value.elements.background.radius} min={0} />
				<ImageRefField label="imageUrl" bind:value={value.elements.background.imageUrl} {imageRefs} />
				<EnumField label="align" bind:value={value.elements.background.align} options={alignOptions} />

				<!-- Background Rectangles -->
				<OptionalSection
					title="rects"
					present={value.elements.background.rects != null}
					onadd={() => (value.elements.background.rects = [])}
					onremove={() => (value.elements.background.rects = undefined)}
				>
					{#if value.elements.background.rects}
						<ArrayEditor
							title="rectangles"
							items={value.elements.background.rects}
							onadd={() => {
								value.elements.background.rects = [
									...(value.elements.background.rects ?? []),
									{ start: { x: 0, y: 0 }, end: { x: 100, y: 100 }, fill: '#000000' },
								];
							}}
							onremove={(i) => {
								value.elements.background.rects = value.elements.background.rects?.filter(
									(_, idx) => idx !== i
								);
							}}
						>
							{#snippet children(i)}
								{@const rect = value.elements.background.rects?.[i]}
								{#if rect}
									<PositionField label="start" bind:value={rect.start} />
									<PositionField label="end" bind:value={rect.end} />
									<ColorField label="fill" bind:value={rect.fill} />
									<BooleanField label="useEmbedColor" bind:value={rect.useEmbedColor} />
									<NumberField
										label="opacity"
										bind:value={rect.opacity}
										min={0}
										max={1}
										step={0.01}
										slider
									/>
								{/if}
							{/snippet}
						</ArrayEditor>
					{/if}
				</OptionalSection>
			</EditorSection>

			<!-- Gradients -->
			<OptionalSection
				title="gradients"
				present={value.elements.gradients != null}
				onadd={() => (value.elements.gradients = [])}
				onremove={() => (value.elements.gradients = undefined)}
			>
				{#if value.elements.gradients}
					<ArrayEditor
						title="gradients"
						items={value.elements.gradients}
						onadd={() => {
							value.elements.gradients = [
								...(value.elements.gradients ?? []),
								{
									direction: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
									stops: [
										{ position: 0, fill: '#000000' },
										{ position: 1, fill: '#ffffff' },
									],
								},
							];
						}}
						onremove={(i) => {
							value.elements.gradients = value.elements.gradients?.filter((_, idx) => idx !== i);
						}}
					>
						{#snippet children(i)}
							{@const grad = value.elements.gradients?.[i]}
							{#if grad}
								<EditorSection title="direction">
									<PositionField label="start" bind:value={grad.direction.start} />
									<PositionField label="end" bind:value={grad.direction.end} />
								</EditorSection>

								<OptionalSection
									title="bounds"
									present={grad.bounds != null}
									onadd={() => {
										if (grad) grad.bounds = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
									}}
									onremove={() => {
										if (grad) grad.bounds = undefined;
									}}
								>
									{#if grad.bounds}
										<PositionField label="start" bind:value={grad.bounds.start} />
										<PositionField label="end" bind:value={grad.bounds.end} />
									{/if}
								</OptionalSection>

								<NumberField
									label="opacity"
									bind:value={grad.opacity}
									min={0}
									max={1}
									step={0.01}
									slider
								/>

								<ArrayEditor
									title="stops"
									items={grad.stops}
									onadd={() => {
										if (grad) grad.stops = [...grad.stops, { position: 0.5, fill: '#888888' }];
									}}
									onremove={(idx) => {
										if (grad) grad.stops = grad.stops.filter((_, j) => j !== idx);
									}}
								>
									{#snippet children(si)}
										{@const stop = grad.stops[si]}
										{#if stop}
											<NumberField
												label="position"
												bind:value={stop.position}
												min={0}
												max={1}
												step={0.01}
												slider
											/>
											<ColorField label="fill" bind:value={stop.fill} />
										{/if}
									{/snippet}
								</ArrayEditor>
							{/if}
						{/snippet}
					</ArrayEditor>
				{/if}
			</OptionalSection>

			<!-- Element positions -->
			{#each elementNames as name (name)}
				<OptionalSection
					title={name}
					present={value.elements[name] != null}
					onadd={() => (value.elements[name] = { position: { x: 0, y: 0 } })}
					onremove={() => (value.elements[name] = undefined)}
				>
					{#if value.elements[name]}
						<ElementPositionEditor bind:value={value.elements[name]} />
					{/if}
				</OptionalSection>
			{/each}
		</EditorSection>
	</div>
</ScrollArea>
