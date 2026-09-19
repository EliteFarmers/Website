import { readNumber, readChoice } from '$lib/tools/query-params';

export function readPreviewQuery(params: URLSearchParams) {
	const synthesisLevel = readNumber(params, 'synthesis', 0, 0, 20, 1);
	const rose = readNumber(params, 'rose', 0, 0, 200, 1);
	const roseDragonLevel = rose >= 100 ? rose : 0;
	const selectedType = readChoice(params, 'buy', ['instabuy', 'buyorder'] as const, 'instabuy');

	return { synthesisLevel, roseDragonLevel, selectedType };
}
