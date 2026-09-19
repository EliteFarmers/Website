import { readNumber, readChoice } from '$lib/tools/query-params';
import { upgradeSettings } from './composter-content';
import { COMPOSTER_ORGANIC_MATTER_ITEMS, COMPOSTER_FUELS, type ComposterUpgrade } from 'farming-weight';

export function readPreviewQuery(params: URLSearchParams) {
	const upgradeLevels = {} as Record<ComposterUpgrade, number>;

	for (const { key } of upgradeSettings) upgradeLevels[key] = readNumber(params, key, 0, 0, 25, 1);
	const purchaseMode = readChoice(params, 'buy', ['instabuy', 'buyorder'] as const, 'instabuy');
	const sellMode = readChoice(params, 'sell', ['instasell', 'sellorder'] as const, 'instasell');
	const selectedOrganicId = readChoice(
		params,
		'organic',
		COMPOSTER_ORGANIC_MATTER_ITEMS.map((item) => item.itemId),
		''
	);
	const selectedFuelId = readChoice(
		params,
		'fuel',
		COMPOSTER_FUELS.map((item) => item.itemId),
		''
	);

	return { purchaseMode, sellMode, selectedOrganicId, selectedFuelId, upgradeLevels };
}
