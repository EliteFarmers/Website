import type { Crop } from '../constants/crops.js';
import { Stat } from '../constants/stats.js';
import type { FarmingPet } from '../fortune/farmingpet.js';
import type { EliteItemDto } from '../fortune/item.js';
import { GEAR_SLOTS, type GearSlot } from '../items/armor.js';
import type { FarmingPlayer } from './player.js';
import type { PlayerOptions } from './playeroptions.js';

type ItemHolder = {
	item: EliteItemDto;
};

export function getRateCalculationStateKey(player: FarmingPlayer, crop?: Crop): string {
	const selectedCropTool = crop ? player.getSelectedCropTool(crop) : player.selectedTool;
	const bestCropTool = crop ? player.getBestTool(crop) : player.selectedTool;

	return [
		`crop=${crop ?? ''}`,
		`totals=${rateTotalsStateKey(player, crop)}`,
		`selectedCropTool=${itemStateKey(selectedCropTool?.item)}`,
		`bestCropTool=${itemStateKey(bestCropTool?.item)}`,
		`gear=${activeGearStateKey(player)}`,
		`accessories=${itemHolderListStateKey(player.activeAccessories)}`,
		`pet=${petStateKey(player.selectedPet)}`,
		`options=${rateOptionStateKey(player.options)}`,
	].join('||');
}

function rateTotalsStateKey(player: FarmingPlayer, crop?: Crop): string {
	return stableValueKey({
		cropFortune: player.getCropFortune(crop).fortune,
		overbloom: player.getStat(Stat.Overbloom, crop),
		specialDrops: crop ? player.armorSet.specialDropsCount(crop) : 0,
	});
}

function activeGearStateKey(player: FarmingPlayer): string {
	return Object.keys(GEAR_SLOTS)
		.sort()
		.map((slot) => {
			const piece = player.armorSet.getPiece(slot as GearSlot);
			return `${slot}:${itemStateKey(piece?.item)}`;
		})
		.join('|');
}

function itemHolderListStateKey(items: readonly ItemHolder[]): string {
	return items
		.map((item) => itemStateKey(item.item))
		.sort()
		.join('|');
}

function petStateKey(pet?: FarmingPet): string {
	if (!pet) return '';

	return stableValueKey({
		uuid: pet.pet.uuid,
		type: pet.pet.type,
		tier: pet.pet.tier,
		exp: pet.pet.exp,
		level: pet.level,
		heldItem: pet.pet.heldItem,
		active: pet.pet.active,
	});
}

function itemStateKey(item?: EliteItemDto | null): string {
	if (!item) return '';

	return stableValueKey({
		uuid: item.uuid,
		skyblockId: item.skyblockId,
		count: item.count,
		enchantments: item.enchantments,
		attributes: item.attributes,
		gems: item.gems,
	});
}

function rateOptionStateKey(options: PlayerOptions): string {
	return stableValueKey({
		chips: options.chips,
		chipRarities: options.chipRarities,
		harvestFeast: options.harvestFeast,
		jacobContest: options.jacobContest,
		selectedCrop: options.selectedCrop,
	});
}

function stableValueKey(value: unknown, seen = new WeakSet<object>()): string {
	if (value === undefined) return 'undefined';
	if (value === null) return 'null';

	if (typeof value === 'number') {
		return Number.isFinite(value) ? value.toFixed(6) : String(value);
	}

	if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'bigint') {
		return String(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map((entry) => stableValueKey(entry, seen)).join(',')}]`;
	}

	if (typeof value === 'object') {
		if (seen.has(value)) return '[Circular]';
		seen.add(value);

		const result = `{${Object.entries(value)
			.filter(([, entry]) => typeof entry !== 'function' && typeof entry !== 'symbol')
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, entry]) => `${key}:${stableValueKey(entry, seen)}`)
			.join(',')}}`;

		seen.delete(value);
		return result;
	}

	return '';
}
