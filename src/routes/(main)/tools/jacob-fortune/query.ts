import { readNumber, readChoice, readBoolean } from '$lib/tools/query-params';
import { MONTHS_OPTIONS, MEDAL_BRACKETS } from './jacob-fortune-content';

export function readPreviewQuery(params: URLSearchParams) {
	const bps = readNumber(params, 'bps', 20, 10, 20, 0.5);
	const useMooshroom = readBoolean(params, 'mooshroom', true);
	const months = readChoice(
		params,
		'months',
		MONTHS_OPTIONS.map((option) => option.value),
		4
	);
	const monthsIndex = MONTHS_OPTIONS.findIndex((option) => option.value === months);
	const activeMedal = readChoice(
		params,
		'medal',
		MEDAL_BRACKETS.map((medal) => medal.key),
		'diamond'
	);

	return { bps, useMooshroom, monthsIndex, activeMedal };
}
