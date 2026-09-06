import { getGlobalProgress, getGlobalProgressSummary, GlobalProgressInterval } from '$lib/api';
import { statsRange, type StatsInterval } from '$lib/tools/global-stats';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, depends }) => {
	depends('global-stats:data');
	const range = statsRange(url.searchParams.get('range'), Date.now(), url.searchParams.get('start'));
	const interval: StatsInterval = range.range === 'today' ? 'hour' : range.range === 'all' ? 'week' : 'day';
	const chartTo =
		interval === 'hour' ? Math.min(range.to + 23 * 3600, Math.floor(Date.now() / 3_600_000) * 3600) : range.to;
	const params = { from: range.from === undefined ? undefined : BigInt(range.from), to: BigInt(range.to) };
	const [history, summary] = await Promise.allSettled([
		getGlobalProgress(
			{
				...params,
				to: BigInt(chartTo),
				interval:
					interval === 'hour'
						? GlobalProgressInterval.Hour
						: interval === 'week'
							? GlobalProgressInterval.Week
							: GlobalProgressInterval.Day,
			},
			{ signal: AbortSignal.timeout(15_000) }
		),
		getGlobalProgressSummary(params, { signal: AbortSignal.timeout(15_000) }),
	]);
	const historyResult = history.status === 'fulfilled' && history.value.ok ? history.value.data : null;
	const summaryResult = summary.status === 'fulfilled' && summary.value.ok ? summary.value.data : null;
	return { ...range, interval, chartTo, points: historyResult, summary: summaryResult };
}) satisfies PageServerLoad;
