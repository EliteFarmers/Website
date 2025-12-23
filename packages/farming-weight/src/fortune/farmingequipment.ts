import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { type Rarity, type Reforge, ReforgeTarget, type ReforgeTier } from '../constants/reforges.js';
import { Stat } from '../constants/stats.js';
import type { FortuneSourceProgress } from '../constants/upgrades.js';
import type { FarmingArmorInfo } from '../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { type PlayerOptions, ZorroMode } from '../player/playeroptions.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { registerItem } from '../upgrades/itemregistry.js';
import { GEAR_FORTUNE_SOURCES } from '../upgrades/sources/gearsources.js';
import { getFortuneFromEnchant, getStatFromEnchant } from '../util/enchants.js';
import { getGemStat } from '../util/gems.js';
import { extractNumberFromLine } from '../util/lore.js';
import type { FarmingArmor } from './farmingarmor.js';
import type { EliteItemDto } from './item.js';
import type { UpgradeableInfo } from './upgradeable.js';
import { UpgradeableBase } from './upgradeablebase.js';

export class FarmingEquipment extends UpgradeableBase {
	public declare item: EliteItemDto;
	public declare info: FarmingArmorInfo;

	public get type() {
		return ReforgeTarget.Equipment;
	}

	public get slot() {
		return this.info.slot;
	}

	public declare rarity: Rarity;
	public declare reforge: Reforge | undefined;
	public declare reforgeStats: ReforgeTier | undefined;
	public declare recombobulated: boolean;

	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;
	public declare options?: PlayerOptions;

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		super({ item, options, items: FARMING_EQUIPMENT_INFO });
		this.getFortune();
	}

	getProgress(stats?: Stat[], zeroed = false): FortuneSourceProgress[] {
		return getSourceProgress<FarmingArmor | FarmingEquipment>(this, GEAR_FORTUNE_SOURCES, zeroed, stats);
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.getFortune();
	}

	getStat(stat: Stat): number {
		if (stat === Stat.FarmingFortune) {
			return this.getFortune();
		}

		let sum = 0;

		// Base fortune
		sum += this.info.baseStats?.[stat] ?? 0;

		// Reforge
		sum += this.reforgeStats?.stats?.[stat] ?? 0;

		// Gems
		sum += getGemStat(this.item, stat, this.rarity);

		// Enchantments
		for (const [key, level] of Object.entries(this.item.enchantments ?? {})) {
			const enchant = FARMING_ENCHANTS[key];
			if (!enchant || !level || enchant.cropSpecific) continue;

			sum += getStatFromEnchant(level, enchant, stat, this.options);
		}

		return sum;
	}

	getFortune() {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base = this.info.baseStats?.[Stat.FarmingFortune] ?? 0;
		if (base > 0) {
			this.fortuneBreakdown['Base Stats'] = base;
			sum += base;
		}

		// Reforge
		const reforge = this.reforgeStats?.stats?.[Stat.FarmingFortune] ?? 0;
		if (reforge > 0) {
			this.fortuneBreakdown['Reforge'] = reforge;
			sum += reforge;
		}

		// Enchantments
		for (const [key, level] of Object.entries(this.item.enchantments ?? {})) {
			const enchant = FARMING_ENCHANTS[key];
			if (!enchant || !level || enchant.cropSpecific) continue;

			const fortune = getFortuneFromEnchant(level, enchant, this.options);
			if (fortune > 0) {
				this.fortuneBreakdown[enchant.name] = fortune;
				sum += fortune;
			}
		}

		// Lotus Piece Specific
		if (this.info.family === 'LOTUS') {
			// Green thumb from lore as a fallback
			if (!this.options?.uniqueVisitors) {
				const visitors = this.getFortuneFromVisitors(base, reforge);
				if (visitors > 0) {
					this.fortuneBreakdown['Green Thumb'] = visitors;
					sum += visitors;
				}
			}

			// Salesperson lotus piece bonus
			const pieceBonus = this.getPieceBonus();
			if (pieceBonus > 0) {
				this.fortuneBreakdown['Salesperson'] = pieceBonus;
				sum += pieceBonus;
			}
		}

		if (this.item.skyblockId === 'ZORROS_CAPE') {
			// If Zorro is disabled, set fortune to 0
			if (this.options?.zorro?.enabled === false) {
				this.fortune = 0;
				return 0;
			}

			// Zorro's Cape
			const zorro = this.options?.zorro ?? {
				enabled: true,
				mode: ZorroMode.Normal,
			};

			switch (zorro.mode) {
				case ZorroMode.Averaged:
					sum *= 1.3333;
					for (const key in this.fortuneBreakdown) {
						if (this.fortuneBreakdown[key] === undefined) continue;
						this.fortuneBreakdown[key] *= 1.3333;
					}
					break;
				case ZorroMode.Contest:
					sum *= 2;
					for (const key in this.fortuneBreakdown) {
						if (this.fortuneBreakdown[key] === undefined) continue;
						this.fortuneBreakdown[key] *= 2;
					}
					break;
				case ZorroMode.Normal:
				default:
					break;
			}
		}

		this.fortune = sum;
		return sum;
	}

	private getFortuneFromVisitors(base: number, reforge: number): number {
		if (!this.item.enchantments?.green_thumb) return 0;

		const regex = /§7Farming Fortune: §a\+(\d+.?\d+)/g;
		let found = 0;

		for (const line of this.item.lore ?? []) {
			const number = extractNumberFromLine(line, regex) ?? 0;
			if (!number) continue;

			found = +number;
			break;
		}

		if (found === 0) return 0;
		return Math.max(0, found - base - reforge);
	}

	/**
	 * Get the bonus from the Salesperson lotus piece
	 * @returns {number} Fortune from the Salesperson lotus piece
	 */
	getPieceBonus(): number {
		const regex = /§7Piece Bonus: §6\+(\d+)☘/g;
		let found = 0;

		for (const line of (this.item.lore ?? []).reverse()) {
			const number = extractNumberFromLine(line, regex) ?? 0;
			if (!number) continue;

			found = number;
			break;
		}

		return found;
	}

	static isValid(item: EliteItemDto): boolean {
		return FARMING_EQUIPMENT_INFO[item.skyblockId as keyof typeof FARMING_EQUIPMENT_INFO] !== undefined;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): FarmingEquipment[] {
		return items
			.filter((item) => FarmingEquipment.isValid(item))
			.map((item) => new FarmingEquipment(item, options))
			.sort((a, b) => b.fortune - a.fortune);
	}

	static fakeItem(info: UpgradeableInfo, options?: PlayerOptions): FarmingEquipment | undefined {
		const fake: EliteItemDto = {
			name: info.name,
			skyblockId: info.skyblockId,
			uuid: crypto.randomUUID(),
			lore: ['This is a fake item used for upgrade calculations!'],
			attributes: {},
			enchantments: {},
		};

		if (!FarmingEquipment.isValid(fake)) return undefined;

		return new FarmingEquipment(fake, options);
	}
}

// For backwards compatibility
// eslint-disable-next-line @typescript-eslint/naming-convention
export const LotusGear = FarmingEquipment;

for (const item of Object.values(FARMING_EQUIPMENT_INFO)) {
	if (!item) continue;
	registerItem({
		info: item,
		fakeItem: (i, o) => FarmingEquipment.fakeItem(i, o),
	});
}
