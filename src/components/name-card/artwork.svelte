<script lang="ts">
	import type { ImageAttachmentDto } from '$lib/api';
	import { boundsStyle, coordinate, type Card } from './layout';
	let { card, imageRefs = {} }: { card: Card; imageRefs?: Record<string, ImageAttachmentDto> } = $props();
	const gradientId = $props.id();
</script>

<div class="artwork" aria-hidden="true">
	<div
		class="layer"
		style:background={card.background.fill ?? 'transparent'}
		style:opacity={card.background.opacity ?? 1}
	></div>
	{#if card.background.imageUrl}
		<div class="layer" style:opacity={card.background.opacity ?? 1}>
			{@render picture(
				card.background.imageUrl,
				'cover',
				card.background.align === 'flex-start'
					? 'left'
					: card.background.align === 'flex-end'
						? 'right'
						: 'center'
			)}
		</div>
	{/if}
	{#each card.background.rects ?? [] as rect, i (i)}
		<div
			class="shape"
			style="{boundsStyle(rect.start, rect.end)}background:{rect.fill};opacity:{rect.opacity ?? 1}"
		></div>
	{/each}
	{#if card.decal}
		<div
			class="shape"
			style="{boundsStyle(card.decal.start, card.decal.end)}background:{card.decal.fill ?? 'transparent'};"
		>
			{#if card.decal.imageUrl}{@render picture(card.decal.imageUrl, 'fill')}{/if}
		</div>
	{/if}
	{#each card.gradients ?? [] as gradient, i (i)}
		{@const start = gradient.bounds?.start ?? { x: 0, y: 0 }}
		{@const end = gradient.bounds?.end ?? { x: 1920, y: 400 }}
		{@const x1 = coordinate(start.x, 1920)}
		{@const y1 = coordinate(start.y, 400)}
		{@const x2 = coordinate(end.x, 1920)}
		{@const y2 = coordinate(end.y, 400)}
		<svg class="layer" viewBox="0 0 1920 400" preserveAspectRatio="none" style:opacity={gradient.opacity ?? 0.6}>
			<defs>
				<linearGradient
					id={`${gradientId}-${i}`}
					gradientUnits="userSpaceOnUse"
					x1={coordinate(gradient.direction.start.x, 1920)}
					y1={coordinate(gradient.direction.start.y, 400)}
					x2={coordinate(gradient.direction.end.x, 1920)}
					y2={coordinate(gradient.direction.end.y, 400)}
				>
					{#each gradient.stops ?? [] as stop, j (j)}<stop
							offset={stop.position}
							stop-color={stop.fill}
						/>{/each}
				</linearGradient>
			</defs>
			<rect
				x={Math.min(x1, x2)}
				y={Math.min(y1, y2)}
				width={Math.abs(x2 - x1)}
				height={Math.abs(y2 - y1)}
				fill={`url(#${gradientId}-${i})`}
			/>
		</svg>
	{/each}
</div>

{#snippet picture(reference: string, fit: 'cover' | 'fill', position = 'center')}
	{@const attachment = imageRefs[reference]}
	<picture>
		{#if attachment?.posterUrl}<source
				media="(prefers-reduced-motion: reduce)"
				srcset={attachment.posterUrl}
			/>{/if}
		<img
			src={attachment?.url ?? reference}
			srcset={attachment?.sources
				? Object.values(attachment.sources)
						.map((s) => `${s.url} ${s.width}w`)
						.join(',')
				: undefined}
			sizes="(max-width: 1024px) 100vw, 1024px"
			alt=""
			style:object-fit={fit}
			style:object-position={position}
		/>
	</picture>
{/snippet}

<style>
	.artwork {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: inherit;
		pointer-events: none;
	}
	.layer {
		position: absolute;
		inset: 0;
	}
	.shape {
		position: absolute;
	}
	svg,
	picture,
	img {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
