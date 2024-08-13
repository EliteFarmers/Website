<script lang="ts">
	import { toReadable } from '$lib/format';
	import { scaleLinear } from 'd3-scale';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { Area, Axis, Chart, Highlight, Spline, Svg, Tooltip } from 'layerchart';

	export let data: { date: string; value: number }[];
	export let ratio = 0;
	export let crop = 'wheat';

	$: first = data[0];
	$: last = data.at(-1);
	$: yDomain = last ? [first.value, last.value + (last.value - first.value) * (1 - ratio)] : undefined;
	$: days = Math.ceil((+(last?.date ?? 0) - +first.date) / 86400);

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

	const colorClasses: Record<string, string[]> = {
		wheat: ['stroke-wheat', 'fill-wheat/70'],
		melon: ['stroke-melon', 'fill-melon/70'],
		cactus: ['stroke-cactus', 'fill-cactus/70'],
		pumpkin: ['stroke-pumpkin', 'fill-pumpkin/70'],
		carrot: ['stroke-carrot', 'fill-carrot/70'],
		potato: ['stroke-potato', 'fill-potato/70'],
		cane: ['stroke-sugarcane', 'fill-sugarcane/70'],
		wart: ['stroke-netherwart', 'fill-netherwart/70'],
		mushroom: ['stroke-mushroom', 'fill-mushroom/70'],
		cocoa: ['stroke-cocoa', 'fill-cocoa/70'],
	};
</script>

<div class="h-[200px] rounded m-2">
	<Chart
		{data}
		x="date"
		xScale={scaleLinear()}
		y="value"
		{yDomain}
		padding={{ left: 64, bottom: 24, top: 10, right: 10 }}
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis
				placement="left"
				grid
				rule
				format={(v) => toReadable(v)}
				labelProps={{ class: '!stroke-0 !font-normal text-sm' }}
			/>
			<Axis
				placement="bottom"
				rule
				format={(d) => dateFormatter.format(new Date(d * 1000))}
				labelProps={{
					rotate: 330,
					textAnchor: 'end',
					class: '!stroke-0 !font-normal text-xs md:text-sm',
				}}
				ticks={days}
			/>
			<Area line={{ class: colorClasses[crop][0] + ' stroke-4' }} class={colorClasses[crop][1]} />
			<Spline class="{colorClasses[crop][0]} stroke-2" />
			<Highlight points lines />
		</Svg>
		<Tooltip header={(d) => tooltipFormatter.format(new Date(d.date * 1000))} let:data>
			<div class="min-w-lg">
				<p>{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)} Collection</p>
				<p class="font-mono">{(+data.value).toLocaleString()}</p>
			</div>
		</Tooltip>
	</Chart>
</div>
