import { expect, test } from 'vitest';
import { Crop } from '../constants/crops.js';
import { FarmingPets } from '../constants/pets.js';
import { Rarity } from '../constants/reforges.js';
import { FarmingArmor } from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import { FARMING_ARMOR_INFO } from '../items/armor.js';
import { GearSlot } from '../items/definitions.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { PestFarmingPhase, PestFarmingPlayer } from '../player/pestfarmingplayer.js';
import { DEFAULT_PEST_CYCLE_SETTINGS, PestFarmingRateCalculator } from './pest-farming-rate-calculator.js';
import { createPestPhaseLoadoutComparisonTasks } from './pest-rate-comparisons.js';

const priceBook = { version: 'mechanics', items: {}, missingItemMode: 'zero' as const };
const options = { crop: Crop.Wheat, cycle: DEFAULT_PEST_CYCLE_SETTINGS };

function armorItem(uuid: string) {
	const armor = FarmingArmor.fakeItem(FARMING_ARMOR_INFO.FERMENTO_HELMET!)!;
	armor.item.uuid = uuid;
	return armor.item;
}

function equipmentItem(id: keyof typeof FARMING_EQUIPMENT_INFO, uuid: string) {
	const equipment = FarmingEquipment.fakeItem(FARMING_EQUIPMENT_INFO[id]!)!;
	equipment.item.uuid = uuid;
	return equipment.item;
}

test('builds lazy comparisons for alternative phase gear and owned pets', () => {
	const player = new PestFarmingPlayer({
		armor: [armorItem('armor-current'), armorItem('armor-other')],
		equipment: [
			equipmentItem('BLOSSOM_BELT', 'equipment-current'),
			equipmentItem('PESTHUNTERS_BELT', 'equipment-other'),
		],
		pets: [
			{
				uuid: 'pet-current',
				type: FarmingPets.Elephant,
				tier: Rarity.Legendary,
				exp: 25_353_230,
			},
			{
				uuid: 'pet-other',
				type: FarmingPets.MooshroomCow,
				tier: Rarity.Legendary,
				exp: 25_353_230,
			},
		],
		armorSets: [
			{
				id: 'armor-set',
				name: 'Armor',
				pieces: { [GearSlot.Helmet]: 'armor-current' },
			},
		],
		equipmentSets: [
			{
				id: 'equipment-set',
				name: 'Equipment',
				pieces: { [GearSlot.Belt]: 'equipment-current' },
			},
		],
		loadoutPresets: [
			{
				id: 'preset',
				name: 'Preset',
				armorSetId: 'armor-set',
				equipmentSetId: 'equipment-set',
				petId: 'pet-current',
			},
		],
		phasePresetIds: {
			[PestFarmingPhase.Farm]: 'preset',
			[PestFarmingPhase.Spawn]: 'preset',
			[PestFarmingPhase.Kill]: 'preset',
		},
	});
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();
	const tasks = createPestPhaseLoadoutComparisonTasks({
		player,
		phase: PestFarmingPhase.Farm,
		options,
		priceBook,
		before,
	});

	expect(tasks.map((task) => task.key).sort()).toStrictEqual([
		'armor:armor-set:Helmet:armor-other',
		'equipment:equipment-set:Belt:equipment-other',
		'pet:farm:pet-other',
	]);
	for (const task of tasks) {
		const result = task.calculate();
		expect(result.before).toBe(before);
		expect(result.after.mechanicsKey).not.toBe('');
	}
});

test('returns no comparisons when the phase has no preset', () => {
	const player = new PestFarmingPlayer({
		armorSets: [],
		equipmentSets: [],
		loadoutPresets: [],
		phasePresetIds: {},
	});
	const before = new PestFarmingRateCalculator({ player, options, priceBook }).calculate();

	expect(
		createPestPhaseLoadoutComparisonTasks({
			player,
			phase: PestFarmingPhase.Farm,
			options,
			priceBook,
			before,
		})
	).toStrictEqual([]);
});
