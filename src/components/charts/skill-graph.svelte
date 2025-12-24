<script lang="ts">
	import { toReadable } from '$lib/format';
	import { Area, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';

	interface Props {
		data: { date: string; value: number }[];
		ratio?: number;
		skill: string;
		metricLabel?: string;
	}

	let { data, ratio = 0, skill, metricLabel }: Props = $props();

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

	const color = 'var(--color-primary)';
</script>

<div class="m-2 h-[200px] rounded dark:scheme-dark">
	<Chart
		{data}
		x="date"
		y="value"
		{yDomain}
		yNice
		padding={{ left: 48, bottom: 16, top: 5, right: 48 }}
		tooltip={{ mode: 'bisect-x' }}
	>
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
				fill={color}
				fillOpacity={0.35}
				line={{ class: 'stroke-3 fill-transparent', stroke: color }}
			/>
			<Highlight y={(d) => d.value} points={{ fill: color }} />
		</Layer>
		<Tooltip.Root class="bg-card">
			{#snippet children({ data })}
				<Tooltip.Header>
					{tooltipFormatter.format(new Date(data.date * 1000))}
				</Tooltip.Header>
				<div>
					<p>{metricLabel ?? `${skill} XP`}</p>
					<p class="font-mono">{(+data.value).toLocaleString()}</p>
				</div>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>
