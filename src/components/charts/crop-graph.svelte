<script lang="ts">
	import { toReadable } from '$lib/format';
	import { extent } from 'd3-array';
	import { scaleLinear } from 'd3-scale';
	import { Crop, CROP_TO_PEST, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { Area, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';

	interface Props {
		data: { date: string; value: number; pests: number }[];
		pests?: boolean;
		ratio?: number;
		crop?: string;
	}

	let { data, pests = false, ratio = 0, crop = 'wheat' }: Props = $props();

	let first = $derived(data[0]);
	let last = $derived(data.at(-1));
	let yDomain = $derived.by(() => {
		const domain = last ? [first.value, last.value + (last.value - first.value) * (1 - ratio)] : undefined;
		if (!domain || first.value === last?.value) {
			return undefined;
		}
		return domain;
	});
	let days = $derived(Math.ceil((+(last?.date ?? 0) - +first.date) / 86400));

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
	});

	const tooltipFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		year: 'numeric',
	});

	let pestScale = $derived(scaleLinear(extent(data, (d) => d.pests) as [number, number], yDomain ?? [0, 1]));

	const colorVars: Record<string, string> = {
		wheat: 'var(--color-wheat)',
		melon: 'var(--color-melon)',
		cactus: 'var(--color-cactus)',
		pumpkin: 'var(--color-pumpkin)',
		carrot: 'var(--color-carrot)',
		potato: 'var(--color-potato)',
		cane: 'var(--color-sugarcane)',
		wart: 'var(--color-netherwart)',
		mushroom: 'var(--color-mushroom)',
		cocoa: 'var(--color-cocoa)',
	};
</script>

<div class="m-2 h-[200px] rounded">
	<Chart
		{data}
		x="date"
		y="value"
		{yDomain}
		yNice
		padding={{ left: 48, bottom: 16, top: 5, right: 48 }}
		tooltip={{ mode: 'bisect-x' }}
	>
		{#snippet children({ context })}
			<Layer type="svg" class="fill-primary stroke-muted-foreground">
				<Axis
					placement="left"
					rule
					grid
					format={(d: number) => toReadable(d)}
					tickLabelProps={{ class: 'stroke-0! font-normal! text-sm' }}
				/>
				<Axis
					placement="bottom"
					rule
					format={(d: number) => dateFormatter.format(new Date(d * 1000))}
					tickLabelProps={{
						rotate: 330,
						textAnchor: 'end',
						class: 'stroke-0! font-normal! text-xs md:text-sm',
					}}
					ticks={days > 14 ? 14 : days}
				/>

				<Area
					y1={(d) => d.value}
					fill={colorVars[crop]}
					fillOpacity={0.7}
					line={{ class: 'stroke-3 fill-transparent', stroke: colorVars[crop] }}
				/>
				<Highlight y={(d) => d.value} points={{ fill: colorVars[crop] }} />
				{#if pests}
					<Axis
						placement="right"
						scale={scaleLinear(pestScale.domain(), [context.height, 0])}
						ticks={pestScale.ticks()}
						format={(v: number) => toReadable(v, undefined, 2)}
						rule
						tickLabelProps={{ class: 'stroke-0! font-normal! text-sm', stroke: colorVars[crop] }}
					/>
					<Area
						y1={(d) => pestScale(d.pests)}
						fill={colorVars[crop]}
						fillOpacity={0}
						line={{ class: 'stroke-3 fill-transparent', stroke: colorVars[crop] }}
					/>

					<Highlight y={(d) => pestScale(d.pests)} points={{ fill: colorVars[crop] }} />
				{/if}
			</Layer>
			<Tooltip.Root class="bg-card">
				{#snippet children({ data })}
					<Tooltip.Header>
						{tooltipFormatter.format(new Date(data.date * 1000))}
					</Tooltip.Header>
					<div class="">
						<p>{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)} Collection</p>
						<p class="font-mono">{(+data.value).toLocaleString()}</p>
						{#if pests}
							<p class="first-letter:capitalize">
								{CROP_TO_PEST[getCropFromName(crop) ?? Crop.Wheat]} Kills
							</p>
							<p class="font-mono">{(+data.pests).toLocaleString()}</p>
						{/if}
					</div>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</Chart>
</div>
