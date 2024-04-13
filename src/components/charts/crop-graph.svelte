<script lang="ts">
	import { toReadable } from '$lib/format';
	import { getLocalTimeZone } from '@internationalized/date';
	import { scaleLinear } from 'd3-scale';
	import { Crop, getCropDisplayName, getCropFromName } from 'farming-weight';
	import { Area, Axis, Chart, Highlight, Spline, Svg, Tooltip, TooltipItem } from 'layerchart';

	export let data: { date: string; value: number }[];
	export let crop: string = 'wheat';

	const formatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: '2-digit',
	});

	const colorClasses: Record<string, string[]> = {
		wheat: ['stroke-wheat', 'fill-wheat/70 dark:fill-wheat/90'],
		melon: ['stroke-melon', 'fill-melon/70 dark:fill-melon/90'],
		cactus: ['stroke-cactus', 'fill-cactus/70 dark:fill-cactus/90'],
		pumpkin: ['stroke-pumpkin', 'fill-pumpkin/70 dark:fill-pumpkin/90'],
		carrot: ['stroke-carrot', 'fill-carrot/70 dark:fill-carrot/90'],
		potato: ['stroke-potato', 'fill-potato/70 dark:fill-potato/90'],
		cane: ['stroke-sugarcane', 'fill-sugarcane/70 dark:fill-sugarcane/90'],
		wart: ['stroke-netherwart', 'fill-netherwart/70 dark:fill-netherwart/90'],
		mushroom: ['stroke-mushroom', 'fill-mushroom/70 dark:fill-mushroom/90'],
		cocoa: ['stroke-cocoa', 'fill-cocoa/70 dark:fill-cocoa/90'],
	};
</script>

<div class="h-[200px] border rounded m-2">
	<Chart
		{data}
		x="date"
		xScale={scaleLinear()}
		y="value"
		yNice
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
				format={(d) => formatter.format(new Date(d * 1000))}
				labelProps={{ class: '!stroke-0 !font-normal text-sm' }}
			/>
			<!-- {#key crop} -->
			<Area line={{ class: colorClasses[crop][0] + ' stroke-4' }} class={colorClasses[crop][1]} />
			<Spline class="{colorClasses[crop][0]} stroke-2" />
			<!-- {/key} -->
			<Highlight points lines />
		</Svg>
		<Tooltip header={(d) => new Date(d.date * 1000).toLocaleTimeString()} let:data>
			<div class="min-w-lg">
				<p>{getCropDisplayName(getCropFromName(crop) ?? Crop.Wheat)} Collection</p>
				<p class="font-mono">{(+data.value).toLocaleString()}</p>
			</div>
		</Tooltip>
	</Chart>
</div>
