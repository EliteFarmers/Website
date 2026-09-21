<script lang="ts">
	import type { ImageAttachmentDto, WeightStyleWithDataDto } from '$lib/api';

	interface Props {
		style: WeightStyleWithDataDto;
		ign: string;
		uuid: string;
		weight?: number;
		rank?: number;
	}

	let { style, ign, uuid, weight = 12345, rank = 3113 }: Props = $props();

	const frame = $derived(style.frame?.nameCard);
	const frameImage = $derived(frame?.imageUrl ? style.imageRefs?.[frame.imageUrl] : undefined);
	const rankText = $derived(`#${rank.toLocaleString()}`);
	const weightText = $derived(weight.toLocaleString(undefined, { maximumFractionDigits: 2 }));

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
</script>

<div class="@container relative aspect-[4.8/1] w-full overflow-visible">
	<div class="absolute inset-0 overflow-clip rounded-xl border-2 bg-background bg-no-repeat">
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
				<div class="mt-[0.5cqw] text-[2cqw] text-muted-foreground">Farming Weight</div>
			</div>
		</div>
	</div>

	{#if frame?.imageUrl}
		<!-- Match the frame editor's positioning inside the card's 2px border. -->
		<picture
			class="pointer-events-none absolute inset-0.5 z-20 origin-center"
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
