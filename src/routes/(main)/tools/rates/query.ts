import { readNumber, readChoice, readBoolean } from '$lib/tools/query-params';
import { TIME_OPTIONS } from './rates-content';
import { Crop, getCropFromName } from 'farming-weight';

export function readPreviewQuery(params: URLSearchParams) {
	const fortune = readNumber(params, 'fortune', -1, 0, 5000);
	const fortuneInput = fortune < 0 ? undefined : fortune;
	const timeBlocks =
		readChoice(
			params,
			'duration',
			TIME_OPTIONS.map((option) => option.value / 1200),
			60
		) * 1200;
	const reforge = readChoice(params, 'reforge', ['bountiful', 'blessed'], 'bountiful');
	const pet = readChoice(params, 'pet', ['rose_dragon', 'mooshroom', 'elephant'], 'rose_dragon');
	const bps = readNumber(params, 'bps', 20, 10, 20, 0.5);
	const useMaxTool = readBoolean(params, 'maxTool', true);
	const useRarefinder = readBoolean(params, 'rarefinder', true);
	const useMechamind = readBoolean(params, 'mechamind', true);
	const useCropeetle = readBoolean(params, 'cropeetle', true);
	const useWartyBug = readBoolean(params, 'wartyBug', false);
	const bzMode = readChoice(params, 'sell', ['order', 'insta'] as const, 'order');
	const profitColumn =
		readChoice(params, 'sort', ['npc', 'bazaar'], 'bazaar') === 'npc' ? 'npcProfit' : 'bazaarProfit';
	const profitDirection =
		readChoice(params, 'direction', ['asc', 'desc'], 'desc') === 'asc' ? 'ascending' : 'descending';
	const crop = getCropFromName(params.get('crop') ?? '');
	const selectedCrop = crop && crop !== Crop.Seeds ? crop : undefined;

	return {
		fortuneInput,
		timeBlocks,
		reforge,
		pet,
		bps,
		useMaxTool,
		useRarefinder,
		useMechamind,
		useCropeetle,
		useWartyBug,
		bzMode,
		profitColumn,
		profitDirection,
		selectedCrop,
	};
}
