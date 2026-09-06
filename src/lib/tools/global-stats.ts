import type { GlobalProgressPoint, GlobalProgressSummaryPeriod } from '$lib/api/schemas';

export const STATS_RANGES = [
	{ value: 'today', label: 'Today' },
	{ value: '7', label: '7 days' },
	{ value: '30', label: '30 days' },
	{ value: '90', label: '90 days' },
	{ value: 'all', label: 'All time' },
] as const;

export function statsRange(value: string | null, now = Date.now(), start?: string | null) {
	const range = STATS_RANGES.find((option) => option.value === value)?.value ?? '30';
	const today = Math.floor(now / 86_400_000) * 86_400;
	const parsed = start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? Date.parse(`${start}T00:00:00Z`) / 1000 : NaN;
	const selected =
		Number.isFinite(parsed) &&
		parsed >= 0 &&
		parsed <= today &&
		new Date(parsed * 1000).toISOString().slice(0, 10) === start
			? parsed
			: undefined;
	const length = range === 'today' ? 1 : Number(range);
	const from = selected ?? (range === 'all' ? undefined : today - (length - 1) * 86_400);
	const to = range === 'all' ? today : Math.min(today, from! + (length - 1) * 86_400);
	return { range, today, to, from, start: selected === undefined ? null : start };
}

export const sumValues = (values: Record<string, number | bigint>) =>
	Object.values(values).reduce<number>((total, value) => total + Number(value), 0);

const numberFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 });
const shortDateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fullDateFormatter = new Intl.DateTimeFormat('en', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC',
});

export const compact = (value: number) => numberFormatter.format(value);
export const dateLabel = (timestamp: number) => shortDateFormatter.format(timestamp * 1000);
export const fullDate = (timestamp: number) => fullDateFormatter.format(timestamp * 1000);

export type Metric = 'npc' | 'crops' | 'skills' | 'pests';
export type StatsInterval = 'day' | 'hour' | 'week';
export type TrendPoint = {
	timestamp: number;
	label: string;
	value: number;
	available: boolean;
	partial: boolean;
	contributors: number | null;
	pestNpcCoins?: number;
	cropNpcValue?: number;
};

export function metricValue(period: GlobalProgressPoint | GlobalProgressSummaryPeriod, metric: Metric) {
	return metric === 'npc' ? period.totalNpcValue : sumValues(period[metric]);
}

export function trendPoints(
	points: GlobalProgressPoint[],
	metric: Metric,
	from?: number,
	to?: number,
	interval: StatsInterval = 'day'
): TrendPoint[] {
	if (!points.length) return [];
	const step = interval === 'hour' ? 3600 : interval === 'week' ? 604800 : 86400;
	const bucket = (timestamp: number) =>
		interval === 'week'
			? Math.floor((timestamp - 345600) / step) * step + 345600
			: Math.floor(timestamp / step) * step;
	const byDate = new Map(points.map((point) => [Number(point.timestamp), point]));
	const first = bucket(from ?? Math.min(...byDate.keys()));
	const last = bucket(to ?? Math.max(...byDate.keys()));
	const result: TrendPoint[] = [];
	for (let timestamp = first; timestamp <= last; timestamp += step) {
		const point = byDate.get(timestamp);
		const coverage = metric !== 'npc' ? point?.[`${metric}Coverage`] : undefined;
		const contributors =
			interval === 'week'
				? coverage?.averageDailyContributors
				: interval === 'day'
					? coverage?.contributors
					: null;
		const samples = point
			? metric === 'npc'
				? Number(point.cropsCoverage.samplePairs) + Number(point.pestsCoverage.samplePairs)
				: Number(point[`${metric}Coverage`].samplePairs)
			: 0;
		result.push({
			timestamp,
			label:
				interval === 'hour'
					? `${new Date(timestamp * 1000).getUTCHours().toString().padStart(2, '0')}:00`
					: dateLabel(timestamp),
			value: point ? metricValue(point, metric) : 0,
			available: samples > 0,
			partial: point?.isPartial ?? false,
			contributors: contributors == null || samples === 0 ? null : Number(contributors),
			...(metric === 'npc'
				? { pestNpcCoins: point?.totalPestNpcCoins ?? 0, cropNpcValue: point?.totalCropNpcValue ?? 0 }
				: {}),
		});
	}
	return result;
}

const names: Record<string, string> = {
	cocoa: 'Cocoa beans',
	wart: 'Nether wart',
	cane: 'Sugar cane',
	wildrose: 'Wild rose',
	lunarmoth: 'Lunar moth',
	worm: 'Earthworm',
};

export function breakdown(values: Record<string, number | bigint>) {
	const total = sumValues(values);
	return Object.entries(values)
		.map(([key, value]) => ({
			key,
			label: names[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
			value: Number(value),
			share: total > 0 ? (Number(value) / total) * 100 : 0,
		}))
		.sort((a, b) => b.value - a.value);
}

export function comparison(current: number, previous: number | undefined) {
	if (previous === undefined || previous <= 0) return null;
	const change = ((current - previous) / previous) * 100;
	return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
}
