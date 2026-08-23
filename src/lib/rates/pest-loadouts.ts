import type { ItemDto, PetDto, ProfileMemberLoadoutDataDto } from '$lib/api';
import {
	createPestFarmingPlayer,
	GearSlot,
	PEST_FARMING_PHASES,
	PestFarmingPhase,
	type EliteItemDto,
	type PestArmorSetLoadout,
	type PestEquipmentSetLoadout,
	type PestLoadoutPreset,
} from 'farming-weight';

export const PEST_LOADOUT_PROFILE_VERSION = 1;

export type PestLoadoutSourceKind = 'hypixel' | 'local' | 'optimizer';

export interface PestLoadoutSource {
	kind: PestLoadoutSourceKind;
	sourceId?: string;
	fingerprint?: string;
}

export interface StoredPestArmorSet extends PestArmorSetLoadout {
	source: PestLoadoutSource;
}

export interface StoredPestEquipmentSet extends PestEquipmentSetLoadout {
	source: PestLoadoutSource;
}

export interface StoredPestLoadoutPreset extends PestLoadoutPreset {
	source: PestLoadoutSource;
}

export interface PestLoadoutProfileState {
	v: number;
	armorSets: StoredPestArmorSet[];
	equipmentSets: StoredPestEquipmentSet[];
	presets: StoredPestLoadoutPreset[];
	phasePresetIds: Record<PestFarmingPhase, string>;
}

export interface PestLoadoutImportInput {
	armor: ItemDto[];
	equipment: ItemDto[];
	pets: PetDto[];
	loadouts: ProfileMemberLoadoutDataDto[];
}

const ARMOR_SLOT_BY_NAME = {
	HELMET: GearSlot.Helmet,
	CHESTPLATE: GearSlot.Chestplate,
	LEGGINGS: GearSlot.Leggings,
	BOOTS: GearSlot.Boots,
} as const;

const EQUIPMENT_SLOT_BY_NAME = {
	EQUIPMENT_SLOT_1: GearSlot.Necklace,
	EQUIPMENT_SLOT_2: GearSlot.Cloak,
	EQUIPMENT_SLOT_3: GearSlot.Belt,
	EQUIPMENT_SLOT_4: GearSlot.Gloves,
} as const;

const ACTIVE_ARMOR_SLOTS = [GearSlot.Boots, GearSlot.Leggings, GearSlot.Chestplate, GearSlot.Helmet] as const;
const ACTIVE_EQUIPMENT_SLOTS = [GearSlot.Necklace, GearSlot.Cloak, GearSlot.Belt, GearSlot.Gloves] as const;

function fingerprint(value: unknown): string {
	const text = stableSerialize(value);
	let hash = 2166136261;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36);
}

function stableSerialize(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
	if (value && typeof value === 'object') {
		return `{${Object.entries(value)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, child]) => `${JSON.stringify(key)}:${stableSerialize(child)}`)
			.join(',')}}`;
	}
	return JSON.stringify(value) ?? 'undefined';
}

function petStableId(pet: PetDto | undefined): string | undefined {
	return pet?.uuid || pet?.localId || undefined;
}

function createSetSource(sourceId: string, pieces: Partial<Record<GearSlot, string | null>>): PestLoadoutSource {
	return { kind: 'hypixel', sourceId, fingerprint: fingerprint(pieces) };
}

function groupSetItems(
	items: ItemDto[],
	prefix: 'wardrobe' | 'equipment_wardrobe',
	slots: Record<string, GearSlot>
): Map<number, Partial<Record<GearSlot, string | null>>> {
	const result = new Map<number, Partial<Record<GearSlot, string | null>>>();
	const pattern = new RegExp(`^${prefix}:(\\d+):([^:]+)$`);
	for (const item of items) {
		const match = item.slot?.match(pattern);
		const setId = Number(match?.[1]);
		const slot = match?.[2] ? slots[match[2]] : undefined;
		if (!match || !Number.isFinite(setId) || !slot || !item.uuid) continue;
		const pieces = result.get(setId) ?? {};
		if (!Object.values(pieces).includes(item.uuid)) pieces[slot] = item.uuid;
		result.set(setId, pieces);
	}
	return result;
}

function activeSetItems(
	items: ItemDto[],
	prefix: 'armor' | 'equipment',
	slots: readonly GearSlot[]
): Partial<Record<GearSlot, string | null>> {
	const pieces: Partial<Record<GearSlot, string | null>> = {};
	const pattern = new RegExp(`^${prefix}:(\\d+)$`);
	for (const item of items) {
		const match = item.slot?.match(pattern);
		const slotIndex = Number(match?.[1]);
		const slot = Number.isInteger(slotIndex) ? slots[slotIndex] : undefined;
		if (!slot || !item.uuid || Object.values(pieces).includes(item.uuid)) continue;
		pieces[slot] = item.uuid;
	}
	return pieces;
}

function markUsed(pieces: Partial<Record<GearSlot, string | null>>, used: Set<string>): void {
	for (const uuid of Object.values(pieces)) {
		if (uuid) used.add(uuid);
	}
}

function referencedIds(loadouts: ProfileMemberLoadoutDataDto[], key: 'armorSetId' | 'equipmentSetId'): number[] {
	return [
		...new Set(
			loadouts
				.map((loadout) => loadout[key])
				.filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
		),
	];
}

function orderedSetIds(groups: Map<number, unknown>, referenced: number[]): number[] {
	return [...new Set([...referenced, ...[...groups.keys()].sort((a, b) => a - b)])];
}

function uniquePieces(
	pieces: Partial<Record<GearSlot, string | null>>,
	used: Set<string>
): Partial<Record<GearSlot, string | null>> {
	const result: Partial<Record<GearSlot, string | null>> = {};
	for (const [slot, uuid] of Object.entries(pieces) as [GearSlot, string | null][]) {
		if (!uuid || used.has(uuid)) continue;
		result[slot] = uuid;
		used.add(uuid);
	}
	return result;
}

function fallbackCatalogs(input: PestLoadoutImportInput): {
	armor?: StoredPestArmorSet;
	equipment?: StoredPestEquipmentSet;
} {
	const player = createPestFarmingPlayer({
		armor: input.armor as EliteItemDto[],
		equipment: input.equipment as EliteItemDto[],
	});
	const armor = player.armorSetLoadouts[0];
	const equipment = player.equipmentSetLoadouts[0];
	return {
		armor: armor
			? {
					id: 'local:fallback-armor',
					name: 'Recommended Armor',
					pieces: { ...armor.pieces },
					source: { kind: 'local' },
				}
			: undefined,
		equipment: equipment
			? {
					id: 'local:fallback-equipment',
					name: 'Recommended Equipment',
					pieces: { ...equipment.pieces },
					source: { kind: 'local' },
				}
			: undefined,
	};
}

export function importPestLoadouts(input: PestLoadoutImportInput): PestLoadoutProfileState {
	const armorGroups = groupSetItems(input.armor, 'wardrobe', ARMOR_SLOT_BY_NAME);
	const equipmentGroups = groupSetItems(input.equipment, 'equipment_wardrobe', EQUIPMENT_SLOT_BY_NAME);
	const fallback = fallbackCatalogs(input);
	const usedArmor = new Set<string>();
	const armorSets: StoredPestArmorSet[] = orderedSetIds(armorGroups, referencedIds(input.loadouts, 'armorSetId')).map(
		(sourceId) => {
			const pieces = uniquePieces(armorGroups.get(sourceId) ?? {}, usedArmor);
			return {
				id: `hypixel:armor:${sourceId}`,
				name: `Hypixel Armor ${sourceId}`,
				pieces,
				source: createSetSource(String(sourceId), pieces),
			} satisfies StoredPestArmorSet;
		}
	);
	if (!armorSets.some((set) => Object.values(set.pieces).some(Boolean)) && fallback.armor) {
		armorSets.push(fallback.armor);
		markUsed(fallback.armor.pieces, usedArmor);
	}
	const equippedArmor = uniquePieces(activeSetItems(input.armor, 'armor', ACTIVE_ARMOR_SLOTS), usedArmor);
	if (Object.values(equippedArmor).some(Boolean)) {
		armorSets.push({
			id: 'hypixel:armor:equipped',
			name: 'Equipped Armor',
			pieces: equippedArmor,
			source: createSetSource('equipped', equippedArmor),
		});
	}
	const usedEquipment = new Set<string>();
	const equipmentSets: StoredPestEquipmentSet[] = orderedSetIds(
		equipmentGroups,
		referencedIds(input.loadouts, 'equipmentSetId')
	).map((sourceId) => {
		const pieces = uniquePieces(equipmentGroups.get(sourceId) ?? {}, usedEquipment);
		return {
			id: `hypixel:equipment:${sourceId}`,
			name: `Hypixel Equipment ${sourceId}`,
			pieces,
			source: createSetSource(String(sourceId), pieces),
		} satisfies StoredPestEquipmentSet;
	});
	if (!equipmentSets.some((set) => Object.values(set.pieces).some(Boolean)) && fallback.equipment) {
		equipmentSets.push(fallback.equipment);
		markUsed(fallback.equipment.pieces, usedEquipment);
	}
	const equippedEquipment = uniquePieces(
		activeSetItems(input.equipment, 'equipment', ACTIVE_EQUIPMENT_SLOTS),
		usedEquipment
	);
	if (Object.values(equippedEquipment).some(Boolean)) {
		equipmentSets.push({
			id: 'hypixel:equipment:equipped',
			name: 'Equipped Equipment',
			pieces: equippedEquipment,
			source: createSetSource('equipped', equippedEquipment),
		});
	}

	const petsByLocalId = new Map(input.pets.flatMap((pet) => (pet.localId ? [[pet.localId, pet] as const] : [])));
	const presets: StoredPestLoadoutPreset[] = input.loadouts
		.slice()
		.sort((a, b) => a.id - b.id)
		.map((loadout) => {
			const preset = {
				id: `hypixel:loadout:${loadout.id}`,
				name: `Hypixel Loadout ${loadout.id}`,
				armorSetId: typeof loadout.armorSetId === 'number' ? `hypixel:armor:${loadout.armorSetId}` : undefined,
				equipmentSetId:
					typeof loadout.equipmentSetId === 'number'
						? `hypixel:equipment:${loadout.equipmentSetId}`
						: undefined,
				petId: loadout.petLocalId ? petStableId(petsByLocalId.get(loadout.petLocalId)) : undefined,
			};
			return {
				...preset,
				source: {
					kind: 'hypixel',
					sourceId: String(loadout.id),
					fingerprint: fingerprint(preset),
				},
			} satisfies StoredPestLoadoutPreset;
		});

	if (presets.length === 0) {
		presets.push({
			id: 'local:default-loadout',
			name: 'Default Loadout',
			armorSetId: armorSets[0]?.id,
			equipmentSetId: equipmentSets[0]?.id,
			petId: petStableId(input.pets[0]),
			source: { kind: 'local' },
		});
	}

	const defaultPresetId = presets[0]!.id;
	return {
		v: PEST_LOADOUT_PROFILE_VERSION,
		armorSets,
		equipmentSets,
		presets,
		phasePresetIds: Object.fromEntries(PEST_FARMING_PHASES.map((phase) => [phase, defaultPresetId])) as Record<
			PestFarmingPhase,
			string
		>,
	};
}

export function clonePestLoadoutState(state: PestLoadoutProfileState): PestLoadoutProfileState {
	return {
		...state,
		armorSets: state.armorSets.map((set) => ({ ...set, pieces: { ...set.pieces }, source: { ...set.source } })),
		equipmentSets: state.equipmentSets.map((set) => ({
			...set,
			pieces: { ...set.pieces },
			source: { ...set.source },
		})),
		presets: state.presets.map((preset) => ({ ...preset, source: { ...preset.source } })),
		phasePresetIds: { ...state.phasePresetIds },
	};
}
