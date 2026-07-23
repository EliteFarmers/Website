import type { Crop } from '../constants/crops.js';
import { FARMING_ENCHANTS } from '../constants/enchants.js';
import { type Rarity, type Reforge, ReforgeTarget, type ReforgeTier } from '../constants/reforges.js';
import { Stat, type StatBreakdown } from '../constants/stats.js';
import type { FortuneSourceProgress, StatQueryOptions } from '../constants/upgrades.js';
import { buildEffectEnvironmentFromOptions } from '../effects/environment.js';
import { resolveOverbloomBreakdown, resolveStatBreakdown } from '../effects/resolver.js';
import type { Effect, EffectEnvironment } from '../effects/types.js';
import type { FarmingArmorInfo } from '../items/armor.js';
import { FARMING_EQUIPMENT_INFO } from '../items/equipment.js';
import { THORNY_OVERBLOOM_PER_THORNS_LEVEL } from '../items/reforges/thorny.js';
import { statsToEffects } from '../items/sources/effects-util.js';
import { enchantEffects } from '../items/sources/enchants.js';
import { gemEffects } from '../items/sources/gems.js';
import { reforgeEffects } from '../items/sources/reforges.js';
import { type PlayerOptions, ZorroMode } from '../player/playeroptions.js';
import { getSourceProgress } from '../upgrades/getsourceprogress.js';
import { GEAR_FORTUNE_SOURCES } from '../upgrades/sources/gearsources.js';
import { getFortuneFromEnchant, getStatFromEnchant } from '../util/enchants.js';
import { getGemStat } from '../util/gems.js';
import { extractNumberFromLine } from '../util/lore.js';
import type { FarmingArmor } from './farmingarmor.js';
import type { EliteItemDto } from './item.js';
import { getLotusToBlossomPieceBonus, setLotusPieceBonusLore } from './lotuspiecebonus.js';
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

	getProgress(options?: Stat[] | StatQueryOptions, zeroed = false): FortuneSourceProgress[] {
		const query = Array.isArray(options) ? { stats: options } : options;
		return getSourceProgress<FarmingArmor | FarmingEquipment>(this, GEAR_FORTUNE_SOURCES, zeroed, {
			...query,
			defaultSourceType: 'equipment',
		});
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.getFortune();
	}

	private getThornyBonus(): number {
		if (this.item.attributes?.modifier !== 'thorny') return 0;
		return (this.options?.armorThornsLevel ?? 0) * THORNY_OVERBLOOM_PER_THORNS_LEVEL;
	}

	getStat(stat: Stat, crop?: Crop): number {
		if (stat === Stat.FarmingFortune) {
			return this.getFortune();
		}

		let sum = 0;

		// Base fortune
		sum += this.info.baseStats?.[stat] ?? 0;

		// Reforge
		sum += this.reforgeStats?.stats?.[stat] ?? 0;
		if (stat === Stat.Overbloom) sum += this.getThornyBonus();

		// Gems
		sum += getGemStat(this.item, stat, this.rarity);

		// Enchantments
		for (const [key, level] of Object.entries(this.item.enchantments ?? {})) {
			const enchant = FARMING_ENCHANTS[key];
			if (!enchant || !level || enchant.cropSpecific) continue;

			sum += getStatFromEnchant(level, enchant, stat, this.options, crop);
		}

		return sum;
	}

	getStatBreakdown(stat: Stat, crop?: Crop): StatBreakdown {
		if (this.item.skyblockId === 'ZORROS_CAPE' && stat === Stat.FarmingFortune) {
			if (this.options?.zorro?.enabled === false) return {};
			this.getFortune();
			return Object.fromEntries(
				Object.entries(this.fortuneBreakdown).map(([source, value]) => [
					source,
					{
						value,
						stat,
					},
				])
			);
		}

		const env = buildEffectEnvironmentFromOptions(this.options, crop);
		const effects = this.getEffects(env);
		const resolved =
			stat === Stat.Overbloom
				? resolveOverbloomBreakdown(effects, { env, crop }, Stat.Overbloom)
				: resolveStatBreakdown(effects, stat, { env, crop });

		return Object.fromEntries(
			Object.entries(resolved).map(([source, value]) => [
				source,
				{
					value,
					stat,
				},
			])
		);
	}

	/**
	 * Returns the declarative `Effect[]` representation of every contribution
	 * this equipment piece makes: base stats, reforge, gems, enchants. Set
	 * bonuses are emitted at the {@link ArmorSet} level.
	 */
	getEffects(env: EffectEnvironment): Effect[] {
		const sourceName = this.item.name ?? this.info.name;
		const effects: Effect[] = [];

		effects.push(...statsToEffects(this.info.baseStats, sourceName));

		if (this.reforge && this.item.attributes?.modifier) {
			effects.push(
				...reforgeEffects(this.item.attributes.modifier, this.rarity, `${sourceName} (${this.reforge.name})`)
			);
		}

		const thornyBonus = this.getThornyBonus();
		if (thornyBonus) {
			effects.push(...statsToEffects({ [Stat.Overbloom]: thornyBonus }, `${sourceName} (Thorny Bonus)`));
		}

		effects.push(...gemEffects(this.item, this.rarity, `${sourceName} (Gems)`));

		for (const [enchantId, level] of Object.entries(this.item.enchantments ?? {})) {
			if (!level) continue;
			effects.push(...enchantEffects(enchantId, level, env, this.options ?? {}));
		}

		if (this.info.family === 'LOTUS') {
			const pieceBonus = this.getPieceBonus();
			if (pieceBonus > 0) {
				effects.push({
					source: `${sourceName} (Salesperson)`,
					op: 'add-stat',
					stat: Stat.FarmingFortune,
					value: pieceBonus,
				});
			}
		}

		return effects;
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

		// Peony Piece Specific
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
		if (!this.item.lore) return 0;
		const regex = /Piece Bonus: §6\+(\d+.?\d*)/g;
		let found = 0;

		for (let i = (this.item.lore ?? []).length - 1; i >= 0; i--) {
			const line = this.item.lore?.[i];
			if (!line) continue;

			const number = extractNumberFromLine(line, regex) ?? 0;
			if (!number) continue;

			found = number;
			break;
		}

		return found;
	}

	applyTierUpgradeStateTo(newItem: FarmingEquipment): void {
		const upgradedPieceBonus = getLotusToBlossomPieceBonus(
			this.item.skyblockId,
			newItem.item.skyblockId,
			this.getPieceBonus()
		);
		if (upgradedPieceBonus === undefined) return;

		setLotusPieceBonusLore(newItem.item, upgradedPieceBonus);
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
