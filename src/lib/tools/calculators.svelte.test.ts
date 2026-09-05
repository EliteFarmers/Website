import type { RatesItemPriceData } from '$lib/api/elite';
import { DEFAULT_SELECTED_CROPS } from '$lib/stores/selectedCrops';
import { ComposterUpgrade, Crop, GREENHOUSE_MUTATIONS } from 'farming-weight';
import { writable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RatesCalculator } from '../../routes/(main)/tools/rates/rates-calculator.svelte';
import { MutationCalculator } from '../../routes/(main)/tools/mutations/mutation-calculator.svelte';
import { ComposterCalculator } from '../../routes/(main)/tools/composter/composter-calculator.svelte';
import { JacobCalculator } from '../../routes/(main)/tools/jacob-fortune/jacob-calculator.svelte';
import { withToolQuery } from './query-params';

const requests = vi.hoisted(() => ({ items: vi.fn(), brackets: vi.fn() }));
vi.mock('$lib/remote/items.remote', () => ({ getItems: requests.items }));
vi.mock('$lib/remote/jacob.remote', () => ({ getJacobMedalBrackets: requests.brackets }));
vi.mock('$lib/tools/query-state.svelte', () => ({ syncToolQuery: vi.fn() }));

const rates = () => new RatesCalculator(writable<Record<string, boolean>>({ ...DEFAULT_SELECTED_CROPS }));
const prices = {
	ENCHANTED_SEEDS: { bazaar: { averageBuy: 100, averageBuyOrder: 90 } },
	ENCHANTED_WHEAT: { bazaar: { averageBuy: 200, averageBuyOrder: 180 } },
	OIL_BARREL: { bazaar: { averageBuy: 10000, averageBuyOrder: 9000 } },
	COMPOST: { bazaar: { averageSell: 30000, averageSellOrder: 32000 } },
} as unknown as RatesItemPriceData;

beforeEach(() => {
	requests.items.mockReset().mockResolvedValue(prices);
	requests.brackets
		.mockReset()
		.mockResolvedValue({ data: { brackets: { Wheat: { gold: 200000 } }, contestCount: 10, monthsLoaded: 4 } });
});

describe('reactive tool calculators', () => {
	it('restores rates, derived calculations, crop detail, and profit sort', () => {
		const model = rates();
		model.readQuery(
			new URLSearchParams(
				'fortune=1000&duration=20&pet=elephant&bps=15&reforge=blessed&maxTool=false&rarefinder=false&mechamind=false&cropeetle=false&wartyBug=true&sell=insta&crop=wheat&sort=npc&direction=asc'
			)
		);
		expect(model.blocksBroken).toBe(18000);
		expect(model.selectedCrop).toBe(Crop.Wheat);
		expect(model.selectedCropDetail?.fortune).toBe(1000);
		expect(model.sortedCrops[0].npcProfit).toBeLessThanOrEqual(model.sortedCrops.at(-1)!.npcProfit);
		model.bps = 20;
		expect(model.blocksBroken).toBe(24000);
		model.clearSelectedCrop();
		expect(model.selectedCropDetail).toBeNull();
		expect(model.writeQuery().crop).toBeUndefined();
	});
	it('round-trips all rates configuration and keeps separate instances isolated', () => {
		const first = rates();
		first.readQuery(
			new URLSearchParams(
				'fortune=0&duration=240&pet=mooshroom&bps=17.5&reforge=blessed&maxTool=false&rarefinder=false&mechamind=false&cropeetle=false&wartyBug=true&sell=insta&crop=carrot&sort=npc&direction=asc'
			)
		);
		const second = rates();
		expect(second.bps).toBe(20);
		second.readQuery(withToolQuery(new URL('https://example.com'), first.writeQuery()).searchParams);
		expect(second.writeQuery()).toEqual(first.writeQuery());
		second.readQuery(new URLSearchParams('fortune=-10&bps=0&pet=nope&crop=seeds'));
		expect(second.fortuneInput).toBeUndefined();
		expect(second.bps).toBe(20);
		expect(second.selectedCrop).toBeNull();
	});
	it('restores mutation boosts and changes the ranking purchase side reactively', async () => {
		const mutation = Object.values(GREENHOUSE_MUTATIONS)[0];
		requests.items.mockResolvedValue({ [mutation.id]: { bazaar: { averageBuy: 1000, averageBuyOrder: 500 } } });
		const model = new MutationCalculator();
		model.readQuery(new URLSearchParams('synthesis=12&rose=150&buy=buyorder'));
		await model.fetchPrices();
		expect(model.totalCopperBonus).toBe(33);
		const entry = model.calculatedRatios.find((item) => item.id === mutation.id)!;
		expect(model.getCoinPerCopper(entry)).toBe(entry.buyOrderCoinPerCopper);
		model.selectedType = 'instabuy';
		expect(model.getCoinPerCopper(entry)).toBe(entry.buyCoinPerCopper);
		model.readQuery(new URLSearchParams('rose=50&synthesis=200'));
		expect(model.totalCopperBonus).toBe(0);
	});
	it('preserves explicit composter inputs across price refreshes and round-trips upgrades', async () => {
		const model = new ComposterCalculator();
		model.readQuery(
			new URLSearchParams(
				'speed=25&multi_drop=20&fuel_cap=10&organic_matter_cap=15&cost_reduction=12&organic=ENCHANTED_WHEAT&fuel=OIL_BARREL&buy=buyorder&sell=sellorder'
			)
		);
		await model.fetchPrices();
		expect(model.selectedOrganic.itemId).toBe('ENCHANTED_WHEAT');
		expect(model.selectedFuel.itemId).toBe('OIL_BARREL');
		expect(model.calculation.profitPerDay).toBeDefined();
		const other = new ComposterCalculator();
		other.readQuery(withToolQuery(new URL('https://example.com'), model.writeQuery()).searchParams);
		expect(other.writeQuery()).toEqual(model.writeQuery());
		const reset = model.resetUpgrades;
		reset();
		expect(model.upgradeLevels[ComposterUpgrade.Speed]).toBe(0);
		expect(other.upgradeLevels[ComposterUpgrade.Speed]).toBe(25);
	});
	it('falls back safely for invalid composter materials and upgrades', () => {
		const model = new ComposterCalculator();
		model.readQuery(new URLSearchParams('speed=26&cost_reduction=-1&organic=CACTUS&fuel=nope&sell=invalid'));
		expect(model.selectedOrganicId).toBe('');
		expect(model.selectedFuelId).toBe('');
		expect(model.upgradeLevels[ComposterUpgrade.Speed]).toBe(0);
		expect(model.sellMode).toBe('instasell');
	});
	it('loads the requested Jacob range and recalculates fortune without another fetch', async () => {
		const model = new JacobCalculator();
		model.readQuery(new URLSearchParams('months=8&bps=15&mooshroom=false&medal=gold'));
		await model.fetchBrackets();
		expect(requests.brackets).toHaveBeenCalledWith({ months: 8 });
		expect(model.activeMedal).toBe('gold');
		const fortune = model.bracketRows[0].entries.find((entry) => entry.key === 'gold')!.fortune;
		model.bps = 20;
		expect(model.bracketRows[0].entries.find((entry) => entry.key === 'gold')!.fortune).toBeLessThan(fortune);
		expect(requests.brackets).toHaveBeenCalledTimes(1);
	});
	it.each([MutationCalculator, ComposterCalculator])('ignores stale prices for %s', async (Calculator) => {
		let finish!: (data: RatesItemPriceData) => void;
		requests.items.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const model = new Calculator();
		const pending = model.fetchPrices();
		await model.fetchPrices();
		finish({});
		await pending;
		expect(model.prices).toEqual(prices);
	});
});
