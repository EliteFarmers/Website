<script lang="ts">
	import type { ImageAttachmentDto, WeightStyleElementDto, WeightStyleWithDataDto } from '$lib/api';
	import { drawBackgroundCanvas } from '$lib/styles/maker';

	interface Props {
		style: WeightStyleWithDataDto;
		ign: string;
		uuid: string;
		weight?: number;
		rank?: number;
	}

	let { style, ign, uuid, weight = 12345, rank = 3113 }: Props = $props();

	const nameCard = $derived(style.nameCard);
	const frame = $derived(style.frame?.nameCard);
	const frameImage = $derived(frame?.imageUrl ? style.imageRefs?.[frame.imageUrl] : undefined);
	const avatar = $derived(nameCard?.elements.avatar);
	const rankText = $derived(`#${rank.toLocaleString()}`);
	const weightText = $derived(weight.toLocaleString(undefined, { maximumFractionDigits: 2 }));

	function coordinate(value: number, size: number) {
		if (value >= -1 && value <= 1) return value < 0 ? size + value * size : value * size;
		return value < -1 ? size + value : value;
	}

	function colorWithOpacity(color: string, opacity = 1) {
		return `color-mix(in srgb, ${color} ${Math.round(Math.min(1, Math.max(0, opacity)) * 100)}%, transparent)`;
	}

	function frameTransform(scale: number | undefined) {
		const heightScale = scale ?? 1;
		const widthScale = 1 + (heightScale - 1) / 4.8;
		return `scaleX(${widthScale}) scaleY(${heightScale})`;
	}

	function imageSrcset(image: ImageAttachmentDto | undefined, poster = false) {
		const sources = poster ? image?.posterSources : image?.sources;
		if (!sources) return undefined;
		return Object.values(sources)
			.map((source) => `${source.url} ${source.width}w`)
			.join(', ');
	}

	function positionStyle(element: WeightStyleElementDto | null | undefined) {
		if (!element) return 'display:none';
		return `left:${(coordinate(element.position.x, 1920) / 19.2).toFixed(4)}cqw;top:${(coordinate(element.position.y, 400) / 19.2).toFixed(4)}cqw;`;
	}

	function boxStyle(element: WeightStyleElementDto | null | undefined, positioned = true) {
		if (!element) return 'display:none';
		let result = positioned ? positionStyle(element) : '';
		result += `font-size:${((element.fontSize ?? 48) / 19.2).toFixed(4)}cqw;font-family:${element.font ?? 'inherit'};color:${element.fill ?? 'inherit'};`;
		if (element.maxWidth) {
			result += `max-width:${(coordinate(element.maxWidth, 1920) / 19.2).toFixed(4)}cqw;overflow:hidden;`;
		}
		if (element.maxHeight) {
			result += `max-height:${(coordinate(element.maxHeight, 400) / 19.2).toFixed(4)}cqw;overflow:hidden;`;
		}
		if (element.background) {
			result += `background:${colorWithOpacity(element.background.fill ?? '#000000', element.background.opacity ?? 1)};padding:${((element.background.padding ?? 0) / 19.2).toFixed(4)}cqw;border-radius:${((element.background.radius ?? 0) / 19.2).toFixed(4)}cqw;`;
		}
		if (element.outline?.width) {
			const width = (element.outline.width / 19.2).toFixed(4);
			const color = colorWithOpacity(element.outline.fill ?? '#000000', element.outline.opacity ?? 1);
			result += `-webkit-text-stroke:${width}cqw ${color};paint-order:stroke fill;`;
		}
		if (element.glass) {
			const glass = element.glass;
			const tint = colorWithOpacity(glass.tintColor ?? '#ffffff', glass.tintOpacity ?? 0.2);
			const highlight = colorWithOpacity(glass.highlightColor ?? '#ffffff', glass.highlightOpacity ?? 0.8);
			result += `color:transparent;background-clip:text;-webkit-background-clip:text;background-image:linear-gradient(${glass.highlightAngle ?? -20}deg,${tint} ${Math.round((glass.highlightPosition ?? 0.25) * 100)}%,${highlight} ${Math.round(((glass.highlightPosition ?? 0.25) + (glass.highlightSize ?? 0.35)) * 100)}%,${tint} 100%);-webkit-text-stroke:${glass.rimWidth ?? 0.04}em ${colorWithOpacity(glass.rimColor ?? '#ffffff', glass.rimOpacity ?? 0.55)};filter:drop-shadow(${glass.shadowOffsetX ?? 0}em ${glass.shadowOffsetY ?? 0.06}em ${glass.shadowBlur ?? 0.12}em ${colorWithOpacity(glass.shadowColor ?? '#000000', glass.shadowOpacity ?? 0.35)});`;
		}
		return result;
	}
</script>

<div class="@container relative aspect-[4.8/1] w-full overflow-visible">
	<div
		class="bg-background absolute inset-0 overflow-clip rounded-xl border-2 bg-no-repeat {nameCard
			? 'dark text-primary'
			: ''}"
	>
		<canvas
			{@attach (canvas) => {
				if (canvas && nameCard) {
					void drawBackgroundCanvas(
						canvas,
						{
							decal: nameCard.decal,
							elements: { background: nameCard.background, gradients: nameCard.gradients },
						} as Parameters<typeof drawBackgroundCanvas>[1],
						style.imageRefs
					);
				}
			}}
			width="1920"
			height="400"
			class="absolute inset-0 z-0 h-full w-full"
		></canvas>

		{#if nameCard}
			{#if avatar}
				<img
					class="absolute z-10 object-contain"
					src={avatar.mode === 'head'
						? `https://mc-heads.net/avatar/${uuid || 'MHF_Steve'}/256`
						: `https://skins.mcstats.com/body/front/${uuid || 'MHF_Steve'}`}
					alt=""
					aria-hidden="true"
					style="left:{coordinate(avatar.position.x, 1920) / 19.2}cqw;top:{coordinate(
						avatar.position.y,
						400
					) / 19.2}cqw;width:{(avatar.width ?? 240) / 19.2}cqw;height:{(avatar.height ?? 360) /
						19.2}cqw;opacity:{avatar.opacity ?? 1};"
				/>
			{/if}

			{#if nameCard.rankAnchor && nameCard.elements.name}
				<div
					class="absolute z-10 flex items-start whitespace-nowrap"
					style={positionStyle(nameCard.elements.name)}
				>
					<div style={boxStyle(nameCard.elements.name, false)}>{ign}</div>
					{#if nameCard.elements.rank}
						<div
							style="margin-left:{nameCard.rankAnchor.margin / 19.2}cqw;{boxStyle(
								nameCard.elements.rank,
								false
							)}"
						>
							{rankText}
						</div>
					{/if}
				</div>
			{:else}
				<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.name)}>{ign}</div>
				<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.rank)}>{rankText}</div>
			{/if}

			<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.weight)}>
				{weightText}
			</div>
			<div class="absolute z-10 whitespace-nowrap" style={boxStyle(nameCard.elements.label)}>Farming Weight</div>
		{:else}
			<div class="absolute inset-0 z-10 flex items-center gap-[3cqw] px-[5cqw]">
				<img
					src="https://mc-heads.net/avatar/{uuid || 'MHF_Steve'}/256"
					alt=""
					aria-hidden="true"
					class="h-[15cqw] w-[15cqw] rounded-md object-cover"
				/>
				<div class="min-w-0">
					<div class="flex items-center gap-[1cqw] text-[5cqw] leading-none font-semibold">
						<span class="truncate">{ign}</span>
						<span class="font-mono text-[3.25cqw]">{rankText}</span>
					</div>
					<div class="mt-[1cqw] text-[4cqw] leading-none font-semibold">{weightText}</div>
					<div class="text-muted-foreground mt-[0.5cqw] text-[2cqw]">Farming Weight</div>
				</div>
			</div>
		{/if}
	</div>

	{#if frame?.imageUrl}
		<picture
			class="pointer-events-none absolute inset-0 z-20 origin-center"
			style:transform={frameTransform(frame.scale)}
		>
			{#if frameImage?.posterUrl}
				<source
					media="(prefers-reduced-motion: reduce)"
					srcset={imageSrcset(frameImage, true) ?? frameImage.posterUrl}
					sizes="(max-width: 1024px) 100vw, 1024px"
				/>
			{/if}
			<img
				src={frameImage?.url ?? frame.imageUrl}
				srcset={imageSrcset(frameImage)}
				sizes="(max-width: 1024px) 100vw, 1024px"
				alt=""
				aria-hidden="true"
				class="h-full w-full object-fill"
				style:opacity={frame.opacity ?? 1}
			/>
		</picture>
	{/if}
</div>
