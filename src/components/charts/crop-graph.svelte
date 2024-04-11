<script lang="ts">
	import { getCropColor } from '$lib/format';
	import { scaleLinear } from 'd3-scale';
	import { Area, Axis, Chart, Highlight, Spline, Svg, Tooltip, TooltipItem } from 'layerchart';

	export let data: { date: string, value: number }[];
	export let crop: string = 'wheat';

	$: stroke = `stroke-${crop}`;
	$: fill = `fill-${crop}/80`;
</script>

<div class="h-[300px] p-4 border rounded mx-8">
	<Chart
		{data}
		x="date"
		xScale={scaleLinear()}
		y="value"
		yNice
		padding={{ left: 16, bottom: 24 }}
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis placement="left" grid rule />
			<Axis
				placement="bottom"
				format={(d) => new Date(d * 1000).toDateString()}
				rule
			/>
			{#key crop}
			<Area
				line={{ class: stroke }}
				class={fill}
			/>
			<Spline class={stroke} />
			{/key}
			<Highlight points lines />
		</Svg>
		<Tooltip header={(d) => new Date(d.date * 1000).toDateString()} let:data>
			<TooltipItem label="value" value={data.value} />
		</Tooltip>
	</Chart>
</div>
