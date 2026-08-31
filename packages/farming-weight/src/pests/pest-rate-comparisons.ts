import { getFarmingPetId } from '../fortune/farmingpet.js';
import type { GearSlot } from '../items/definitions.js';
import {
	createPestFarmingPlayer,
	type PestFarmingPlayer,
	type PestFarmingPlayerOptions,
	type PestFarmingPhase,
} from '../player/pestfarmingplayer.js';
import { PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import type { PestFarmingRateOptions, PestFarmingRateResult, PestRatePriceBook } from './pest-rate-types.js';

export interface PestRateComparison {
	before: PestFarmingRateResult;
	after: PestFarmingRateResult;
}

export interface PestRateComparisonTask {
	key: string;
	type: 'gear' | 'pet';
	calculate: () => PestRateComparison;
}

export interface PestPhaseLoadoutComparisonInput {
	player: PestFarmingPlayer;
	phase: PestFarmingPhase;
	options: PestFarmingRateOptions;
	priceBook: PestRatePriceBook;
	before: PestFarmingRateResult;
}

export function createPestPhaseLoadoutComparisonTasks(
	input: PestPhaseLoadoutComparisonInput
): PestRateComparisonTask[] {
	const source = input.player.clone();
	const preset = source.getPhasePreset(input.phase);
	if (!preset) return [];

	const armorSetId = preset.armorSetId;
	const equipmentSetId = preset.equipmentSetId;
	const armorSets = source.armorSetLoadouts.map((set) => ({ ...set, pieces: { ...set.pieces } }));
	const equipmentSets = source.equipmentSetLoadouts.map((set) => ({ ...set, pieces: { ...set.pieces } }));
	const loadoutPresets = source.loadoutPresets.map((value) => ({ ...value }));
	const baseOptions = source.options;
	const tasks: PestRateComparisonTask[] = [];
	const createComparison = (patch: Partial<PestFarmingPlayerOptions>): PestRateComparison => ({
		before: input.before,
		after: new PestFarmingRateCalculator({
			player: createPestFarmingPlayer({ ...baseOptions, ...patch }),
			options: input.options,
			priceBook: input.priceBook,
		}).calculate(),
	});

	const armorSet = source.getArmorSetLoadout(armorSetId);
	const armorModel = source.getArmorSetModel(armorSetId);
	for (const [slot, options] of getSlotOptions(armorModel?.slotOptions)) {
		for (const piece of options) {
			const uuid = piece.item.uuid;
			if (!armorSetId || !uuid || armorSet?.pieces[slot] === uuid) continue;
			const patchedArmorSets = armorSets.map((set) =>
				set.id === armorSetId ? { ...set, pieces: { ...set.pieces, [slot]: uuid } } : set
			);
			tasks.push({
				key: `armor:${armorSetId}:${slot}:${uuid}`,
				type: 'gear',
				calculate: () => createComparison({ armorSets: patchedArmorSets }),
			});
		}
	}

	const equipmentSet = source.getEquipmentSetLoadout(equipmentSetId);
	const equipmentModel = source.getEquipmentSetModel(equipmentSetId);
	for (const [slot, options] of getSlotOptions(equipmentModel?.slotOptions)) {
		for (const piece of options) {
			const uuid = piece.item.uuid;
			if (!equipmentSetId || !uuid || equipmentSet?.pieces[slot] === uuid) continue;
			const patchedEquipmentSets = equipmentSets.map((set) =>
				set.id === equipmentSetId ? { ...set, pieces: { ...set.pieces, [slot]: uuid } } : set
			);
			tasks.push({
				key: `equipment:${equipmentSetId}:${slot}:${uuid}`,
				type: 'gear',
				calculate: () => createComparison({ equipmentSets: patchedEquipmentSets }),
			});
		}
	}

	for (const pet of source.getOwnedPets()) {
		const petId = getFarmingPetId(pet);
		if (!petId || preset.petId === petId) continue;
		const patchedPresets = loadoutPresets.map((value) => (value.id === preset.id ? { ...value, petId } : value));
		tasks.push({
			key: `pet:${input.phase}:${petId}`,
			type: 'pet',
			calculate: () => createComparison({ loadoutPresets: patchedPresets }),
		});
	}

	return tasks;
}

interface SlottedItem {
	item: { uuid?: string | null };
}

function getSlotOptions(
	slotOptions: Partial<Record<GearSlot, SlottedItem[]>> | undefined
): [GearSlot, SlottedItem[]][] {
	return Object.entries(slotOptions ?? {}) as [GearSlot, SlottedItem[]][];
}
