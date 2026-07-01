import { CROP_INFO, Crop } from '../constants/crops.js';
import { CROP_FARMING_STATS, PEST_FARMING_STATS, Stat, type StatBreakdown, VACUUM_STATS } from '../constants/stats.js';
import type {
	EffectSummary,
	FortuneSourceProgress,
	FortuneSourceType,
	FortuneUpgrade,
	StatQueryOptions,
	UpgradeTreeNode,
} from '../constants/upgrades.js';
import {
	ArmorLoadout,
	type ArmorSet,
	EquipmentLoadout,
	FarmingArmor,
	selectArmorLoadoutPieces,
} from '../fortune/farmingarmor.js';
import { FarmingEquipment } from '../fortune/farmingequipment.js';
import type { FarmingPet } from '../fortune/farmingpet.js';
import type { EliteItemDto } from '../fortune/item.js';
import { Vacuum } from '../fortune/vacuum.js';
import { GearSlot } from '../items/armor.js';
import { filterAndSortUpgrades } from '../upgrades/upgradeutils.js';
import { createFarmingPlayer, type FarmingPlayer } from './player.js';
import type { PlayerOptions } from './playeroptions.js';

export enum PestFarmingPhase {
	Farm = 'farm',
	Spawn = 'spawn',
	Kill = 'kill',
}

export const PEST_FARMING_PHASES = [PestFarmingPhase.Farm, PestFarmingPhase.Spawn, PestFarmingPhase.Kill] as const;

export const PEST_ARMOR_SLOTS = [GearSlot.Helmet, GearSlot.Chestplate, GearSlot.Leggings, GearSlot.Boots] as const;

export const PEST_EQUIPMENT_SLOTS = [GearSlot.Necklace, GearSlot.Cloak, GearSlot.Belt, GearSlot.Gloves] as const;

export const PEST_KILL_PHASE_STATS: Stat[] = [Stat.PestKillFortune, Stat.FarmingFortune, Stat.Overbloom, Stat.Damage];

export const PEST_FARMING_PHASE_STATS: Record<PestFarmingPhase, Stat[]> = {
	[PestFarmingPhase.Farm]: [...CROP_FARMING_STATS, Stat.PestCooldownReduction],
	[PestFarmingPhase.Spawn]: [Stat.BonusPestChance, Stat.PestCooldownReduction],
	[PestFarmingPhase.Kill]: PEST_KILL_PHASE_STATS,
};

const PEST_KILL_PLAYER_SOURCE_TYPES: FortuneSourceType[] = ['general', 'crop', 'armor', 'equipment', 'pet'];
const PEST_KILL_VACUUM_SOURCE_TYPES: FortuneSourceType[] = ['vacuum'];
const PEST_EQUIPMENT_SELECTION_STATS = [Stat.BonusPestChance, Stat.PestCooldownReduction, Stat.PestKillFortune];
const ALL_CROPS = Object.values(Crop) as Crop[];

export interface PestArmorSetLoadout {
	id: string;
	name: string;
	pieces: Partial<Record<GearSlot, string | null>>;
}

export interface PestPhaseLoadout {
	armorSetId: string;
	petId: string | undefined;
}

export const PEST_MAIN_ARMOR_SET_ID = 'main';
export const PEST_SPAWN_ARMOR_SET_ID = 'spawn';

export interface PestFarmingPlayerOptions extends PlayerOptions {
	vacuums?: (EliteItemDto | Vacuum)[];
	selectedVacuum?: Vacuum;
	selectedVacuumId?: string;
	armorSets?: PestArmorSetLoadout[];
	phaseLoadouts?: Partial<Record<PestFarmingPhase, Partial<PestPhaseLoadout>>>;
	sharedEquipment?: Partial<Record<GearSlot, string>>;
}

export interface PestStatView {
	totals: Partial<Record<Stat, number>>;
	breakdowns: Partial<Record<Stat, StatBreakdown>>;
	effects: EffectSummary[];
	upgrades: FortuneUpgrade[];
}

export function createPestFarmingPlayer(options: PestFarmingPlayerOptions) {
	return new PestFarmingPlayer(options);
}

function cloneItem(item: EliteItemDto): EliteItemDto {
	return {
		...item,
		enchantments: { ...item.enchantments },
		attributes: { ...item.attributes },
		gems: { ...item.gems },
		lore: [...(item.lore ?? [])],
	};
}

function cloneItems<T extends { item: EliteItemDto }>(items: T[]): EliteItemDto[] {
	return items.map((entry) => cloneItem(entry.item));
}

function clonePets(pets: FarmingPet[]): EliteItemDto[] {
	return pets.map((pet) => ({ ...pet.pet }));
}

function mergeBreakdown(left: StatBreakdown, right: StatBreakdown, prefix?: string): StatBreakdown {
	const result: StatBreakdown = { ...left };
	for (const [name, entry] of Object.entries(right)) {
		const key = prefix ? `${prefix}: ${name}` : name;
		if (result[key]) {
			result[key] = {
				...result[key],
				value: result[key].value + entry.value,
			};
		} else {
			result[key] = { ...entry };
		}
	}
	return result;
}

function sumStatBreakdown(breakdown: StatBreakdown): number {
	return Object.values(breakdown).reduce((sum, entry) => sum + entry.value, 0);
}

function getUpgradeIdentity(upgrade: FortuneUpgrade): string {
	return (
		upgrade.conflictKey ??
		[
			upgrade.title,
			upgrade.action,
			upgrade.meta?.type ?? '',
			upgrade.meta?.id ?? '',
			upgrade.meta?.key ?? '',
			upgrade.meta?.itemUuid ?? '',
			upgrade.onto?.slot ?? '',
		].join(':')
	);
}

function getPhaseSourceTypes(phase: PestFarmingPhase, options?: StatQueryOptions): FortuneSourceType[] | undefined {
	return options?.sourceTypes ?? (phase === PestFarmingPhase.Kill ? PEST_KILL_PLAYER_SOURCE_TYPES : undefined);
}

function getPhaseQueryOptions(phase: PestFarmingPhase, stats: Stat[], options?: StatQueryOptions): StatQueryOptions {
	return {
		...options,
		stats,
		sourceTypes: getPhaseSourceTypes(phase, options),
	};
}

function getVacuumQueryOptions(options?: StatQueryOptions): StatQueryOptions {
	return {
		...options,
		stats: VACUUM_STATS,
		sourceTypes: PEST_KILL_VACUUM_SOURCE_TYPES,
	};
}

function getSelectedCropKillStats(stats: Stat[], crop?: Crop): Stat[] {
	const cropStat = crop ? CROP_INFO[crop]?.fortuneType : undefined;
	if (!cropStat || stats.includes(cropStat)) return stats;
	return [...stats, cropStat];
}

function getUpgradeCrop(upgrade: FortuneUpgrade): Crop | undefined {
	const key = upgrade.meta?.key;
	return ALL_CROPS.includes(key as Crop) ? (key as Crop) : undefined;
}

function hasArmorPieces(loadout: PestArmorSetLoadout | undefined): boolean {
	return Object.values(loadout?.pieces ?? {}).some(Boolean);
}

export class PestFarmingPlayer {
	declare options: PestFarmingPlayerOptions;
	declare phases: Record<PestFarmingPhase, FarmingPlayer>;
	declare crop: FarmingPlayer;
	declare spawn: FarmingPlayer;
	declare kill: FarmingPlayer;
	declare armorSetLoadouts: PestArmorSetLoadout[];
	declare armorSetModels: Record<string, ArmorLoadout>;
	declare phaseLoadouts: Record<PestFarmingPhase, PestPhaseLoadout>;
	declare sharedEquipment: Partial<Record<GearSlot, string>>;
	declare sharedEquipmentSet: EquipmentLoadout;
	declare vacuums: Vacuum[];
	declare selectedVacuum?: Vacuum;

	private declare inventory: FarmingPlayer;

	constructor(options: PestFarmingPlayerOptions) {
		this.setOptions(options);
	}

	setOptions(options: PestFarmingPlayerOptions): void {
		this.options = options;
		this.inventory = createFarmingPlayer(options);
		this.vacuums = this.createVacuums(options);
		this.selectedVacuum =
			options.selectedVacuum ??
			this.vacuums.find((vacuum) => vacuum.item.uuid === options.selectedVacuumId) ??
			this.vacuums[0];

		this.armorSetLoadouts = this.createArmorSetLoadouts(options.armorSets);
		this.sharedEquipment = this.createSharedEquipment(options.sharedEquipment);
		this.phaseLoadouts = this.createPhaseLoadouts(options.phaseLoadouts);
		this.armorSetModels = Object.fromEntries(
			this.armorSetLoadouts.map((loadout) => [loadout.id, this.createArmorSetModel(loadout)])
		);
		this.sharedEquipmentSet = this.createSharedEquipmentSet();
		this.phases = Object.fromEntries(
			PEST_FARMING_PHASES.map((phase) => [phase, this.createPhasePlayer(phase)])
		) as Record<PestFarmingPhase, FarmingPlayer>;
		this.refreshPhaseAliases();
	}

	private createVacuums(options: PestFarmingPlayerOptions): Vacuum[] {
		const items = options.vacuums ?? options.tools ?? [];
		if (items[0] instanceof Vacuum) {
			const vacuums = items as Vacuum[];
			for (const vacuum of vacuums) vacuum.setOptions(options);
			return [...vacuums].sort((a, b) => b.fortune - a.fortune);
		}
		return Vacuum.fromArray(items as EliteItemDto[], options);
	}

	private createArmorSetLoadouts(saved?: PestArmorSetLoadout[]): PestArmorSetLoadout[] {
		const defaultMain = this.pickArmorPieces();
		const defaultSpawn = this.pickArmorPieces(
			new Set(Object.values(defaultMain).filter((uuid): uuid is string => typeof uuid === 'string'))
		);
		const defaults: PestArmorSetLoadout[] = [
			{ id: PEST_MAIN_ARMOR_SET_ID, name: 'Farm/Kill Armor', pieces: defaultMain },
			{ id: PEST_SPAWN_ARMOR_SET_ID, name: 'Spawn Armor', pieces: defaultSpawn },
		];
		const savedById = new Map((saved ?? []).map((set) => [set.id, set]));
		const source = defaults.map((fallback, index) => {
			const matching = savedById.get(fallback.id) ?? saved?.[index];
			return {
				id: fallback.id,
				name: matching?.name ?? fallback.name,
				pieces: matching?.pieces ?? fallback.pieces,
			};
		});

		const used = new Set<string>();
		return source.map((set, index) => {
			const id = index === 0 ? PEST_MAIN_ARMOR_SET_ID : PEST_SPAWN_ARMOR_SET_ID;
			const pieces: Partial<Record<GearSlot, string | null>> = {};
			for (const slot of PEST_ARMOR_SLOTS) {
				const uuid = set.pieces?.[slot];
				if (uuid === null) {
					pieces[slot] = null;
					continue;
				}
				if (!uuid || used.has(uuid) || !this.findArmor(slot, uuid)) continue;
				pieces[slot] = uuid;
				used.add(uuid);
			}

			const filled = this.pickArmorPieces(used, pieces);
			for (const uuid of Object.values(filled)) {
				if (uuid) used.add(uuid);
			}

			return {
				id,
				name: set.name || defaults[index]?.name || `Armor Set ${index + 1}`,
				pieces: filled,
			};
		});
	}

	private createSharedEquipment(saved?: Partial<Record<GearSlot, string>>): Partial<Record<GearSlot, string>> {
		const selected: Partial<Record<GearSlot, string>> = {};
		for (const slot of PEST_EQUIPMENT_SLOTS) {
			const uuid = saved?.[slot];
			if (uuid && this.findEquipment(slot, uuid)) selected[slot] = uuid;
		}

		return this.pickEquipmentPieces(selected);
	}

	private createPhaseLoadouts(
		saved?: Partial<Record<PestFarmingPhase, Partial<PestPhaseLoadout>>>
	): Record<PestFarmingPhase, PestPhaseLoadout> {
		const mainId = this.armorSetLoadouts[0]?.id ?? PEST_MAIN_ARMOR_SET_ID;
		const spawnSet = this.armorSetLoadouts.find((set) => set.id === PEST_SPAWN_ARMOR_SET_ID);
		const defaultSpawnId = spawnSet && hasArmorPieces(spawnSet) ? spawnSet.id : mainId;

		return Object.fromEntries(
			PEST_FARMING_PHASES.map((phase) => {
				const fallbackSetId = phase === PestFarmingPhase.Spawn ? defaultSpawnId : mainId;
				const savedSetId = saved?.[phase]?.armorSetId;
				const armorSetId = this.armorSetLoadouts.some((set) => set.id === savedSetId)
					? savedSetId!
					: fallbackSetId;
				const fallbackPet = this.pickBestPetId(phase);
				const savedPet = saved?.[phase]?.petId;
				const petId = this.inventory.pets.some((pet) => pet.pet.uuid === savedPet) ? savedPet : fallbackPet;

				return [
					phase,
					{
						armorSetId,
						petId,
					},
				];
			})
		) as Record<PestFarmingPhase, PestPhaseLoadout>;
	}

	private createPhasePlayer(phase: PestFarmingPhase): FarmingPlayer {
		const player = createFarmingPlayer({
			...this.options,
			armor: cloneItems(this.inventory.armor),
			equipment: cloneItems(this.inventory.equipment),
			tools: cloneItems(this.inventory.tools),
			accessories: cloneItems(this.inventory.accessories),
			pets: clonePets(this.inventory.pets),
			selectedPet: undefined,
		});

		this.applyArmorLoadout(player, this.getArmorSetLoadout(this.phaseLoadouts[phase].armorSetId));
		this.applySharedEquipment(player);
		const petId = this.phaseLoadouts[phase].petId;
		const pet = player.pets.find((candidate) => candidate.pet.uuid === petId);
		if (pet) player.selectPet(pet);
		player.permFortune = player.getGeneralFortune();
		player.tempFortune = player.getTempFortune();
		return player;
	}

	private refreshPhaseAliases(): void {
		this.crop = this.phases[PestFarmingPhase.Farm];
		this.spawn = this.phases[PestFarmingPhase.Spawn];
		this.kill = this.phases[PestFarmingPhase.Kill];
	}

	private setPhaseLoadout(phase: PestFarmingPhase, loadout: PestPhaseLoadout): void {
		this.phaseLoadouts = {
			...this.phaseLoadouts,
			[phase]: loadout,
		};
		this.options.phaseLoadouts = {
			...(this.options.phaseLoadouts ?? {}),
			[phase]: { ...loadout },
		};
	}

	private refreshPhaseFortune(phase: PestFarmingPhase): void {
		const player = this.phases[phase];
		player.permFortune = player.getGeneralFortune();
		player.tempFortune = player.getTempFortune();
		this.refreshPhaseAliases();
	}

	setPhaseArmorSet(phase: PestFarmingPhase, armorSetId: string): boolean {
		if (!this.getArmorSetLoadout(armorSetId)) return false;

		const current = this.phaseLoadouts[phase];
		if (current.armorSetId === armorSetId) return false;

		this.setPhaseLoadout(phase, {
			...current,
			armorSetId,
		});
		this.applyArmorLoadout(this.phases[phase], this.getArmorSetLoadout(armorSetId));
		this.refreshPhaseFortune(phase);
		return true;
	}

	setPhasePet(phase: PestFarmingPhase, petId: string): boolean {
		if (!this.inventory.pets.some((pet) => pet.pet.uuid === petId)) return false;

		const current = this.phaseLoadouts[phase];
		if (current.petId === petId) return false;

		this.setPhaseLoadout(phase, {
			...current,
			petId,
		});
		const pet = this.phases[phase].pets.find((candidate) => candidate.pet.uuid === petId);
		if (pet) this.phases[phase].selectPet(pet);
		this.refreshPhaseAliases();
		return true;
	}

	private applyArmorLoadout(player: FarmingPlayer, loadout?: PestArmorSetLoadout): void {
		for (const slot of PEST_ARMOR_SLOTS) {
			player.armorSet.clearSlot(slot);
			const uuid = loadout?.pieces[slot];
			if (!uuid) continue;
			const piece = player.armorSet.slotOptions[slot]?.find((option) => option.item.uuid === uuid);
			if (piece instanceof FarmingArmor) player.armorSet.setPiece(piece);
		}
	}

	private applySharedEquipment(player: FarmingPlayer): void {
		for (const slot of PEST_EQUIPMENT_SLOTS) {
			player.armorSet.clearSlot(slot);
			const uuid = this.sharedEquipment[slot];
			if (!uuid) continue;
			const piece = player.armorSet.slotOptions[slot]?.find((option) => option.item.uuid === uuid);
			if (piece instanceof FarmingEquipment) player.armorSet.setPiece(piece);
		}
	}

	private createArmorSetModel(loadout: PestArmorSetLoadout): ArmorLoadout {
		const armor = FarmingArmor.fromArray(cloneItems(this.inventory.armor), this.options);
		const model = new ArmorLoadout(armor, this.options);
		for (const slot of PEST_ARMOR_SLOTS) {
			model.clearSlot(slot);
			const uuid = loadout.pieces[slot];
			if (!uuid) continue;
			const piece = model.slotOptions[slot]?.find((option) => option.item.uuid === uuid);
			if (piece instanceof FarmingArmor) model.setPiece(piece);
		}
		return model;
	}

	private createSharedEquipmentSet(): EquipmentLoadout {
		const equipment = FarmingEquipment.fromArray(cloneItems(this.inventory.equipment), this.options);
		const model = new EquipmentLoadout(equipment, this.options);
		for (const slot of PEST_EQUIPMENT_SLOTS) {
			model.clearSlot(slot);
			const uuid = this.sharedEquipment[slot];
			if (!uuid) continue;
			const piece = model.slotOptions[slot]?.find((option) => option.item.uuid === uuid);
			if (piece instanceof FarmingEquipment) model.setPiece(piece);
		}
		return model;
	}

	private pickArmorPieces(
		excluded = new Set<string>(),
		initial: Partial<Record<GearSlot, string | null>> = {}
	): Partial<Record<GearSlot, string | null>> {
		const result: Partial<Record<GearSlot, string | null>> = {};
		const initialPieces: Partial<Record<GearSlot, FarmingArmor | null>> = {};

		for (const slot of PEST_ARMOR_SLOTS) {
			if (!Object.hasOwn(initial, slot)) continue;

			const uuid = initial[slot];
			if (uuid === null) {
				result[slot] = null;
				initialPieces[slot] = null;
				continue;
			}

			const piece = uuid ? this.findArmor(slot, uuid) : undefined;
			if (!piece) continue;

			result[slot] = uuid;
			initialPieces[slot] = piece;
		}

		const selected = selectArmorLoadoutPieces(this.inventory.armor, {
			slots: PEST_ARMOR_SLOTS,
			excluded,
			initial: initialPieces,
		});

		for (const slot of PEST_ARMOR_SLOTS) {
			if (Object.hasOwn(result, slot)) continue;

			const uuid = selected[slot]?.item.uuid;
			if (uuid) result[slot] = uuid;
		}
		return result;
	}

	private pickEquipmentPieces(initial: Partial<Record<GearSlot, string>> = {}): Partial<Record<GearSlot, string>> {
		const result = { ...initial };
		for (const slot of PEST_EQUIPMENT_SLOTS) {
			if (result[slot]) continue;
			const best = this.inventory.equipment
				.filter((piece) => piece.slot === slot)
				.reduce<FarmingEquipment | undefined>((current, candidate) => {
					if (!current) return candidate;
					return comparePestEquipment(candidate, current) > 0 ? candidate : current;
				}, undefined);
			if (best?.item.uuid) result[slot] = best.item.uuid;
		}
		return result;
	}

	private pickBestPetId(_phase: PestFarmingPhase): string | undefined {
		const selectedUuid = this.options.selectedPet?.pet.uuid ?? undefined;
		return selectedUuid ?? this.inventory.selectedPet?.pet.uuid ?? this.inventory.pets[0]?.pet.uuid ?? undefined;
	}

	private findArmor(slot: GearSlot, uuid: string): FarmingArmor | undefined {
		return this.inventory.armor.find((piece) => piece.slot === slot && piece.item.uuid === uuid);
	}

	private findEquipment(slot: GearSlot, uuid: string): FarmingEquipment | undefined {
		return this.inventory.equipment.find((piece) => piece.slot === slot && piece.item.uuid === uuid);
	}

	getArmorSetLoadout(id: string | undefined): PestArmorSetLoadout | undefined {
		return this.armorSetLoadouts.find((set) => set.id === id);
	}

	getArmorSetModel(id: string | undefined): ArmorLoadout | undefined {
		return id ? this.armorSetModels[id] : undefined;
	}

	getArmorSetConflict(uuid: string, armorSetId: string): PestArmorSetLoadout | undefined {
		return this.armorSetLoadouts.find((set) => set.id !== armorSetId && Object.values(set.pieces).includes(uuid));
	}

	getPhasePlayer(phase: PestFarmingPhase): FarmingPlayer {
		return this.phases[phase];
	}

	getPhaseArmorSet(phase: PestFarmingPhase): ArmorSet {
		return this.phases[phase].armorSet;
	}

	selectVacuum(vacuum: Vacuum): void {
		this.selectedVacuum = vacuum;
	}

	selectBestVacuum(stats: Stat[] = VACUUM_STATS): void {
		this.selectedVacuum = this.vacuums.reduce<Vacuum | undefined>((current, candidate) => {
			if (!current) return candidate;
			const candidateScore = stats.reduce((sum, stat) => sum + candidate.getStat(stat), 0);
			const currentScore = stats.reduce((sum, stat) => sum + current.getStat(stat), 0);
			return candidateScore > currentScore ? candidate : current;
		}, undefined);
	}

	getCropProgress(crop: Crop, options?: Stat[] | StatQueryOptions): FortuneSourceProgress[] {
		return this.crop.getCropProgress(crop, options);
	}

	getPhaseProgress(
		phase: PestFarmingPhase,
		stats: Stat[] = PEST_FARMING_PHASE_STATS[phase]
	): FortuneSourceProgress[] {
		const queryStats =
			phase === PestFarmingPhase.Kill ? getSelectedCropKillStats(stats, this.options.selectedCrop) : stats;
		const options = getPhaseQueryOptions(phase, queryStats);
		const progress = [...this.phases[phase].getProgress(options)];
		if (phase === PestFarmingPhase.Kill && this.options.selectedCrop) {
			const crop = this.options.selectedCrop;
			progress.push(
				...this.phases[phase].getCropProgress(crop, options).map((entry) => ({
					...entry,
					key: `kill-crop:${crop}:${entry.key ?? entry.name}:${entry.item?.uuid ?? ''}`,
				}))
			);
		}
		return progress;
	}

	getPhaseGearProgress(
		phase: PestFarmingPhase,
		stats: Stat[] = PEST_FARMING_PHASE_STATS[phase]
	): FortuneSourceProgress[] {
		const queryStats =
			phase === PestFarmingPhase.Kill ? getSelectedCropKillStats(stats, this.options.selectedCrop) : stats;
		return this.phases[phase].armorSet.getProgress(getPhaseQueryOptions(phase, queryStats));
	}

	getArmorSetProgress(armorSetId: string, stats: Stat[] = PEST_FARMING_STATS): FortuneSourceProgress[] {
		return this.getArmorSetModel(armorSetId)?.getProgress(stats) ?? [];
	}

	getSharedEquipmentProgress(stats: Stat[] = PEST_FARMING_STATS): FortuneSourceProgress[] {
		return this.sharedEquipmentSet.getProgress(stats);
	}

	getVacuumProgress(stats: Stat[] = VACUUM_STATS): FortuneSourceProgress[] {
		return this.selectedVacuum?.getProgress({ stats, sourceTypes: PEST_KILL_VACUUM_SOURCE_TYPES }) ?? [];
	}

	getPhaseStat(phase: PestFarmingPhase, stat: Stat, crop?: Crop): number {
		return Object.values(this.getPhaseStatBreakdown(phase, stat, crop)).reduce(
			(sum, entry) => sum + entry.value,
			0
		);
	}

	getPhaseStatBreakdown(phase: PestFarmingPhase, stat: Stat, crop?: Crop): StatBreakdown {
		const playerBreakdown = this.phases[phase].getStatBreakdown(stat, crop);
		if (phase !== PestFarmingPhase.Kill || !this.selectedVacuum || !VACUUM_STATS.includes(stat)) {
			return playerBreakdown;
		}
		return mergeBreakdown(playerBreakdown, this.selectedVacuum.getStatBreakdown(stat), 'Vacuum');
	}

	getPhaseStatView(
		phase: PestFarmingPhase,
		stats: Stat[] = PEST_FARMING_PHASE_STATS[phase],
		crop?: Crop
	): PestStatView {
		const queryCrop = crop ?? this.options.selectedCrop;
		const queryStats = phase === PestFarmingPhase.Kill ? getSelectedCropKillStats(stats, queryCrop) : stats;
		const phaseOptions = getPhaseQueryOptions(phase, queryStats);
		const playerView = this.phases[phase].getStatView({
			stats: queryStats,
			crop: queryCrop,
			sourceTypes: phaseOptions.sourceTypes,
		});
		const totals: Partial<Record<Stat, number>> = {};
		const breakdowns: Partial<Record<Stat, StatBreakdown>> = {};
		for (const stat of queryStats) {
			const playerBreakdown = playerView.breakdowns[stat] ?? {};
			const breakdown =
				phase === PestFarmingPhase.Kill && this.selectedVacuum && VACUUM_STATS.includes(stat)
					? mergeBreakdown(playerBreakdown, this.selectedVacuum.getStatBreakdown(stat), 'Vacuum')
					: playerBreakdown;
			totals[stat] = sumStatBreakdown(breakdown);
			breakdowns[stat] = breakdown;
		}

		return {
			totals,
			breakdowns,
			effects: playerView.effects,
			upgrades: this.getPhaseUpgrades(phase, phaseOptions),
		};
	}

	getPhaseUpgrades(phase: PestFarmingPhase, options?: StatQueryOptions): FortuneUpgrade[] {
		const stats = options?.stats ?? (options?.stat ? [options.stat] : PEST_FARMING_PHASE_STATS[phase]);
		const queryStats =
			phase === PestFarmingPhase.Kill ? getSelectedCropKillStats(stats, this.options.selectedCrop) : stats;
		const phaseOptions = getPhaseQueryOptions(phase, queryStats, options);
		const player = this.phases[phase];
		const upgrades = [...player.getUpgrades(phaseOptions)];

		if (phase === PestFarmingPhase.Farm && this.options.selectedCrop) {
			upgrades.push(...player.getCropUpgrades(this.options.selectedCrop));
		}

		if (phase === PestFarmingPhase.Kill && this.options.selectedCrop) {
			upgrades.push(...player.getCropUpgrades(this.options.selectedCrop, undefined, phaseOptions));
		}

		if (phase === PestFarmingPhase.Kill && this.selectedVacuum) {
			upgrades.push(...this.selectedVacuum.getUpgrades(getVacuumQueryOptions(options)));
		}

		const deduped = new Map<string, FortuneUpgrade>();
		for (const upgrade of upgrades) {
			const key = getUpgradeIdentity(upgrade);
			if (!deduped.has(key)) deduped.set(key, upgrade);
		}

		return filterAndSortUpgrades([...deduped.values()], phaseOptions);
	}

	applyPhaseUpgrade(phase: PestFarmingPhase, upgrade: FortuneUpgrade): void {
		if (upgrade.meta?.type === 'upgrade_group') {
			for (const groupedUpgrade of upgrade.groupedUpgrades ?? []) {
				this.applyPhaseUpgrade(phase, groupedUpgrade);
			}
			return;
		}

		if (phase === PestFarmingPhase.Kill && this.applyVacuumUpgrade(upgrade)) return;

		const itemUuid = upgrade.meta?.itemUuid;
		if (itemUuid && this.isSharedEquipmentUuid(itemUuid)) {
			for (const phasePlayer of Object.values(this.phases)) phasePlayer.applyUpgrade(upgrade);
			this.syncSharedEquipmentSet();
			this.refreshPhaseAliases();
			return;
		}

		const armorSetIds = itemUuid ? this.getArmorSetIdsForUuid(itemUuid) : [];
		if (armorSetIds.length > 0) {
			for (const phaseKey of PEST_FARMING_PHASES) {
				if (
					this.phaseLoadouts[phaseKey].armorSetId &&
					armorSetIds.includes(this.phaseLoadouts[phaseKey].armorSetId)
				) {
					this.phases[phaseKey].applyUpgrade(upgrade);
				}
			}
			this.syncArmorSetModels(armorSetIds);
			this.refreshPhaseAliases();
			return;
		}

		if (!itemUuid) {
			for (const phasePlayer of Object.values(this.phases)) phasePlayer.applyUpgrade(upgrade);
			this.applyGlobalOptionUpgrade(upgrade);
			this.refreshPhaseAliases();
			return;
		}

		this.phases[phase].applyUpgrade(upgrade);
		this.refreshPhaseAliases();
	}

	private applyVacuumUpgrade(upgrade: FortuneUpgrade): boolean {
		const vacuum = upgrade.meta?.itemUuid
			? this.vacuums.find((candidate) => candidate.item.uuid === upgrade.meta?.itemUuid)
			: undefined;
		const vacuumUpgradeTypes = new Set(['buy_item', 'enchant', 'reforge', 'gem', 'item']);
		if (upgrade.meta?.type === 'attribute' && upgrade.meta.key && upgrade.meta.value !== undefined) {
			for (const phasePlayer of Object.values(this.phases)) phasePlayer.applyUpgrade(upgrade);
			this.applyGlobalOptionUpgrade(upgrade);
			this.refreshPhaseAliases();
			if (vacuum) this.selectedVacuum = vacuum;
			return true;
		}

		if (vacuum && upgrade.meta?.type && vacuumUpgradeTypes.has(upgrade.meta.type)) {
			vacuum.applyUpgrade(upgrade);
			this.selectedVacuum = vacuum;
			return true;
		}

		if (
			!upgrade.meta?.itemUuid &&
			this.selectedVacuum &&
			upgrade.meta?.type &&
			vacuumUpgradeTypes.has(upgrade.meta.type)
		) {
			const upgradeKey = getUpgradeIdentity(upgrade);
			const belongsToSelectedVacuum = this.selectedVacuum
				.getUpgrades({ stats: VACUUM_STATS })
				.some((candidate) => getUpgradeIdentity(candidate) === upgradeKey);
			if (belongsToSelectedVacuum) {
				this.selectedVacuum.applyUpgrade(upgrade);
				return true;
			}
		}

		return false;
	}

	private applyGlobalOptionUpgrade(upgrade: FortuneUpgrade): void {
		const { type, key, value } = upgrade.meta ?? {};
		if (!key || value === undefined) return;

		if (type === 'attribute') {
			this.options.attributes = {
				...this.options.attributes,
				[key]: Number(value),
			};
		} else if (type === 'setting') {
			if (key === 'wrigglingLarva') {
				this.options.wrigglingLarva = Number(value);
			} else if (key === 'filledRosewaterFlask' || key === 'filledRosewaterFlasks') {
				this.options.filledRosewaterFlask = Number(value);
			} else {
				return;
			}
		} else {
			return;
		}

		for (const vacuum of this.vacuums) vacuum.setOptions(this.options);
	}

	expandPhaseUpgrade(
		phase: PestFarmingPhase,
		upgrade: FortuneUpgrade,
		options?: {
			maxDepth?: number;
			stats?: Stat[];
			sourceTypes?: FortuneSourceType[];
			includeAllTierUpgradeChildren?: boolean;
			crop?: Crop;
		}
	): UpgradeTreeNode {
		const vacuum = upgrade.meta?.itemUuid
			? this.vacuums.find((candidate) => candidate.item.uuid === upgrade.meta?.itemUuid)
			: undefined;
		if (phase === PestFarmingPhase.Kill && vacuum) {
			return vacuum.expandUpgrade(upgrade, getVacuumQueryOptions(options));
		}
		const baseStats = options?.stats ?? PEST_FARMING_PHASE_STATS[phase];
		const crop = options?.crop ?? getUpgradeCrop(upgrade) ?? this.options.selectedCrop;
		const stats = phase === PestFarmingPhase.Kill ? getSelectedCropKillStats(baseStats, crop) : baseStats;
		return this.phases[phase].expandUpgrade(upgrade, {
			...options,
			stats,
			sourceTypes: getPhaseSourceTypes(phase, options),
			crop,
		});
	}

	private isSharedEquipmentUuid(uuid: string): boolean {
		return Object.values(this.sharedEquipment).includes(uuid);
	}

	private getArmorSetIdsForUuid(uuid: string): string[] {
		return this.armorSetLoadouts.filter((set) => Object.values(set.pieces).includes(uuid)).map((set) => set.id);
	}

	private syncSharedEquipmentSet(): void {
		this.sharedEquipmentSet = this.createSharedEquipmentSet();
	}

	private syncArmorSetModels(ids: string[]): void {
		for (const id of ids) {
			const loadout = this.getArmorSetLoadout(id);
			if (loadout) this.armorSetModels[id] = this.createArmorSetModel(loadout);
		}
	}

	clone(): PestFarmingPlayer {
		const selectedVacuumId = this.selectedVacuum?.item.uuid ?? undefined;
		return new PestFarmingPlayer({
			...this.options,
			tools: cloneItems(this.inventory.tools),
			armor: cloneItems(this.inventory.armor),
			equipment: cloneItems(this.inventory.equipment),
			accessories: cloneItems(this.inventory.accessories),
			pets: clonePets(this.inventory.pets),
			vacuums: cloneItems(this.vacuums),
			selectedVacuumId,
			armorSets: this.armorSetLoadouts.map((set) => ({ ...set, pieces: { ...set.pieces } })),
			phaseLoadouts: Object.fromEntries(
				Object.entries(this.phaseLoadouts).map(([phase, loadout]) => [phase, { ...loadout }])
			) as Record<PestFarmingPhase, PestPhaseLoadout>,
			sharedEquipment: { ...this.sharedEquipment },
		});
	}
}

function comparePestEquipment(a: FarmingEquipment, b: FarmingEquipment): number {
	const pestDelta = getPestEquipmentScore(a) - getPestEquipmentScore(b);
	if (pestDelta !== 0) return pestDelta;
	return a.fortune - b.fortune;
}

function getPestEquipmentScore(piece: FarmingEquipment): number {
	return PEST_EQUIPMENT_SELECTION_STATS.reduce((score, stat) => score + piece.getStat(stat), 0);
}
