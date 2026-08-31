import type { FortuneSourceProgress } from 'farming-weight';

const COMPLETION_EPSILON = 1e-9;

export interface ProgressCompletion {
	percentage: number;
	maxed: boolean;
	label: string;
}

export function getProgressCompletion(
	progress: readonly FortuneSourceProgress[],
	configured: boolean
): ProgressCompletion {
	const ratios: number[] = [];
	const collect = (entry: FortuneSourceProgress) => {
		const statRatios = Object.values(entry.stats ?? {})
			.filter((stat) => stat.max > 0)
			.map((stat) => stat.ratio);
		if (statRatios.length) ratios.push(...statRatios);
		else if (entry.progress?.length) entry.progress.forEach(collect);
		else if (entry.max > 0) ratios.push(entry.ratio);
	};
	progress.forEach(collect);

	if (!configured) return { percentage: 0, maxed: false, label: 'Not configured' };
	if (!ratios.length) return { percentage: 0, maxed: false, label: 'No tracked progress' };

	const normalized = ratios.map((ratio) => Math.min(Math.max(ratio, 0), 1));
	const maxed = normalized.every((ratio) => ratio >= 1 - COMPLETION_EPSILON);
	const roundedPercentage = Math.round(
		(normalized.reduce((total, ratio) => total + ratio, 0) / normalized.length) * 100
	);
	const percentage = maxed ? 100 : Math.min(roundedPercentage, 99);
	return { percentage, maxed, label: maxed ? 'Maxed' : `${percentage}% complete` };
}
