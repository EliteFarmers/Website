<script lang="ts">
	import { compact, fullDate, type StatsInterval, type TrendPoint } from '$lib/tools/global-stats';
	import * as Card from '$ui/card';
	import { scaleLinear } from 'd3-scale';
	import { Axis, BarChart, Tooltip } from 'layerchart/svg';

	let {
		title,
		data,
		color = 'var(--progress)',
		unit,
		tall = false,
		npc = false,
		interval = 'day',
	}: {
		title: string;
		data: TrendPoint[];
		color?: string;
		unit: string;
		tall?: boolean;
		npc?: boolean;
		interval?: StatsInterval;
	} = $props();
	const labels = { class: 'fill-muted-foreground! stroke-0! font-normal! text-xs' };
	const yearFormatter = new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit', timeZone: 'UTC' });
	let periodName = $derived(interval === 'week' ? 'weeks' : interval === 'hour' ? 'hours' : 'days');
	const pointDate = (point: TrendPoint) =>
		interval === 'hour'
			? `${fullDate(point.timestamp)} ${point.label}`
			: interval === 'week'
				? `Week of ${fullDate(point.timestamp)}`
				: fullDate(point.timestamp);
	let ticks = $derived(
		data.filter((_, index) => index % Math.max(1, Math.ceil(data.length / 5)) === 0).map((point) => point.timestamp)
	);
	let observed = $derived(data.filter((point) => point.available));
	let hasContributors = $derived(data.some((point) => point.contributors !== null));
	let contributorLabel = $derived(interval === 'week' ? 'Avg Daily Contributors' : 'Contributors');
	let contributorDomain = $derived(
		scaleLinear()
			.domain([0, Math.max(1, ...data.map((point) => point.contributors ?? 0))])
			.nice(4)
			.domain()
	);
	const contributorColor = 'var(--color-wheat)';
	const npcSeries = [
		{ key: 'pestNpcCoins', label: 'Pest coin rewards', value: 'pestNpcCoins', props: { fill: 'var(--progress)' } },
		{ key: 'cropNpcValue', label: 'Crop NPC value', value: 'cropNpcValue', props: { fill: 'var(--color-wheat)' } },
	];
	const contributorValue = (value: number) => value.toLocaleString('en', { maximumFractionDigits: 1 });
	function contributorPath(x: (timestamp: number) => number, y: (value: number) => number) {
		let connected = false;
		return data
			.map((point) => {
				if (point.contributors === null) {
					connected = false;
					return '';
				}
				const command = connected ? 'L' : 'M';
				connected = true;
				return `${command}${x(point.timestamp)},${y(point.contributors)}`;
			})
			.join(' ');
	}
</script>

<Card.Root class="min-w-0 gap-4 rounded-md border-2 p-4 shadow-none md:p-5">
	<div class="space-y-1">
		<h2 class="text-lg">{title}</h2>
		{#if npc}
			<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
				{#each npcSeries as series (series.key)}
					<span class="flex items-center gap-1.5"
						><span class="size-2 rounded-xs" style:background={series.props.fill} aria-hidden="true"
						></span>{series.label}</span
					>
				{/each}
			</div>
		{/if}
		{#if hasContributors}
			<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
				<span class="flex items-center gap-1.5"
					><span class="size-2 rounded-xs" style:background={color} aria-hidden="true"></span>{unit}</span
				>
				<span class="flex items-center gap-1.5"
					><span class="w-4 border-t-2 border-dashed" style:border-color={contributorColor} aria-hidden="true"
					></span>{contributorLabel}</span
				>
			</div>
		{/if}
	</div>
	{#if observed.length}
		<div
			class="min-w-0"
			role="img"
			aria-label={`${title}. ${observed.length} observed ${periodName}.${npc ? ' Pest coin rewards below crop NPC value in each stacked bar.' : ''}`}
		>
			<BarChart
				{data}
				x="timestamp"
				y="value"
				series={npc ? npcSeries : undefined}
				seriesLayout={npc ? 'stack' : 'auto'}
				height={tall ? 280 : 220}
				yDomain={[0, null]}
				yNice
				padding={{ left: 52, bottom: 24, top: 8, right: hasContributors ? 48 : 8 }}
				tooltipContext={{ mode: 'band' }}
				props={{
					bars: {
						fill: color,
						fillOpacity: (point: TrendPoint) => (point.partial ? 0.5 : 1),
						radius: 2,
						strokeWidth: 0,
					},
					xAxis: {
						ticks,
						format: (value: number) =>
							interval === 'week'
								? yearFormatter.format(value * 1000)
								: (data.find((point) => point.timestamp === value)?.label ?? ''),
						tickLabelProps: labels,
					},
					yAxis: { format: (value: number) => compact(+value), tickLabelProps: labels },
				}}
			>
				{#snippet aboveMarks({ context })}
					{#if hasContributors}
						{@const contributorScale = scaleLinear(contributorDomain, [context.height, 0])}
						<Axis
							placement="right"
							scale={contributorScale}
							ticks={contributorScale.ticks(4)}
							format={(value: number) => compact(value)}
							tickLabelProps={{ class: 'fill-carrot! stroke-0! font-normal! text-xs' }}
						/>
						<path
							d={contributorPath(
								(timestamp) => context.xScale(timestamp) + (context.xScale.bandwidth?.() ?? 0) / 2,
								contributorScale
							)}
							fill="none"
							stroke={contributorColor}
							stroke-width="2"
							stroke-dasharray="5 3"
							stroke-linecap="round"
							class="pointer-events-none"
							aria-hidden="true"
						/>
						{#each data.filter((point) => point.contributors !== null) as point (point.timestamp)}
							<circle
								cx={context.xScale(point.timestamp) + (context.xScale.bandwidth?.() ?? 0) / 2}
								cy={contributorScale(point.contributors!)}
								r="1.75"
								fill={contributorColor}
								class="pointer-events-none"
								aria-hidden="true"
							/>
						{/each}
					{/if}
				{/snippet}
				{#snippet tooltip({ context })}
					<Tooltip.Root {context} class="bg-card">
						{#snippet children({ data: point })}
							<Tooltip.Header
								>{pointDate(point)} (UTC){point.partial ? ' · In progress' : ''}</Tooltip.Header
							>
							<p class="text-sm tabular-nums">
								{point.available
									? `${npc ? 'Total: ' : ''}${point.value.toLocaleString('en')} ${unit}`
									: 'No observations'}
							</p>
							{#if npc && point.available}
								{#each npcSeries as series (series.key)}
									<p class="flex items-center gap-2 text-sm tabular-nums">
										<span
											class="size-2 shrink-0 rounded-xs"
											style:background={series.props.fill}
											aria-hidden="true"
										></span>{series.label}: {point[series.key].toLocaleString('en')} coins
									</p>
								{/each}
							{/if}
							{#if hasContributors}
								<p class="text-sm tabular-nums">
									{contributorLabel}: {point.contributors == null
										? 'Unavailable'
										: contributorValue(point.contributors)}
								</p>
							{/if}
						{/snippet}
					</Tooltip.Root>
				{/snippet}
			</BarChart>
		</div>
	{:else}
		<p class="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
			No observations for this period.
		</p>
	{/if}
</Card.Root>
