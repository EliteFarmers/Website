import { FarmingArmorInfo } from '../constants/armor';
import { LOTUS_GEAR_INFO } from '../constants/lotus';
import { REFORGES, Rarity, Reforge, ReforgeTier, Stat } from '../constants/reforges';
import { getRarityFromLore } from '../util/itemstats';
import { extractNumberFromLine } from '../util/lore';
import { EliteItemDto } from './item';
import { PlayerOptions } from './player';

export class LotusGear {
	public readonly item: EliteItemDto;
	public readonly info: FarmingArmorInfo;
	public get slot() {
		return this.info.slot;
	}

	public declare readonly rarity: Rarity;
	public declare readonly reforge: Reforge | undefined;
	public declare readonly reforgeStats: ReforgeTier | undefined;
	public declare readonly recombobulated: boolean;

	public declare fortune: number;
	public declare fortuneBreakdown: Record<string, number>;
	private declare options?: PlayerOptions;

	constructor(item: EliteItemDto, options?: PlayerOptions) {
		this.options = options;
		this.item = item;

		const info = LOTUS_GEAR_INFO[item.skyblockId as keyof typeof LOTUS_GEAR_INFO];
		if (!info) {
			throw new Error(`Unknown lotus gear: ${item.name} (${item.skyblockId})`);
		}
		this.info = info;

		if (item.lore) {
			this.rarity = getRarityFromLore(item.lore);
		}

		this.reforge = REFORGES[item.attributes?.modifier ?? ''] ?? undefined;
		this.reforgeStats = this.reforge?.tiers?.[this.rarity];
		this.recombobulated = this.item.attributes?.rarity_upgrades === '1';

		this.getFortune();
	}

	setOptions(options: PlayerOptions) {
		this.options = options;
		this.getFortune();
	}

	getFortune() {
		this.fortuneBreakdown = {};
		let sum = 0;

		// Base fortune
		const base = this.info.stats?.[Stat.FarmingFortune] ?? 0;
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

		// Visitors
		const visitors = this.getFortuneFromVisitors(base, reforge);
		if (visitors > 0) {
			this.fortuneBreakdown['Green Thumb'] = visitors;
			sum += visitors;
		}

		// Piece bonus
		const pieceBonus = this.getPieceBonus();
		if (pieceBonus > 0) {
			this.fortuneBreakdown['Salesperson'] = pieceBonus;
			sum += pieceBonus;
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

	private getPieceBonus(): number {
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
		return LOTUS_GEAR_INFO[item.skyblockId as keyof typeof LOTUS_GEAR_INFO] !== undefined;
	}

	static fromArray(items: EliteItemDto[], options?: PlayerOptions): LotusGear[] {
		const gear = items
			.filter((item) => LotusGear.isValid(item))
			.map((item) => new LotusGear(item, options))
			.sort((a, b) => b.fortune - a.fortune);

		// Get only the best piece of each slot
		const best: Record<string, LotusGear> = {};
		for (const piece of gear) {
			if (!best[piece.slot] || piece.fortune > (best[piece.slot]?.fortune ?? 0)) {
				best[piece.slot] = piece;
			}
		}

		return Object.values(best);
	}
}
