import { REFORGE_SOURCES } from '../items/reforges/index.js';
import { Rarity, type Reforge } from './reforge-types.js';
import { Stat } from './stats.js';

export * from './reforge-types.js';

/**
 * Compatibility registry for existing callers. Reforge definitions now live as
 * class instances under `items/reforges/`; this export keeps the old constants
 * import path stable.
 */
export const REFORGES: Record<string, Reforge> = REFORGE_SOURCES;

export const STAT_ICONS: Record<Stat, string> = {
	[Stat.Damage]: '❁',
	[Stat.FishingSpeed]: '☂',
	[Stat.Strength]: '❁',
	[Stat.Health]: '❤',
	[Stat.Defense]: '❈',
	[Stat.Speed]: '✦',
	[Stat.Intelligence]: '✎',
	[Stat.CritChance]: '☣',
	[Stat.CritDamage]: '☣',
	[Stat.AttackSpeed]: '⚔',
	[Stat.AbilityDamage]: '๑',
	[Stat.MagicFind]: '✯',
	[Stat.PetLuck]: '♣',
	[Stat.TrueDefense]: '❂',
	[Stat.SeaCreatureChance]: 'α',
	[Stat.Ferocity]: '⫽',
	[Stat.MiningSpeed]: '⸕',
	[Stat.MiningFortune]: '☘',
	[Stat.FarmingFortune]: '☘',
	[Stat.ForagingFortune]: '☘',
	[Stat.MiningWisdom]: '☯',
	[Stat.FarmingWisdom]: '☯',
	[Stat.ForagingWisdom]: '☯',
	[Stat.Pristine]: '✧',
	[Stat.BonusPestChance]: 'ൠ',
	[Stat.Overbloom]: '☀',
	[Stat.CactusFortune]: '☘',
	[Stat.CarrotFortune]: '☘',
	[Stat.CocoaBeanFortune]: '☘',
	[Stat.MelonFortune]: '☘',
	[Stat.MushroomFortune]: '☘',
	[Stat.NetherWartFortune]: '☘',
	[Stat.PotatoFortune]: '☘',
	[Stat.PumpkinFortune]: '☘',
	[Stat.SugarCaneFortune]: '☘',
	[Stat.WheatFortune]: '☘',
	[Stat.PestKillFortune]: '☘',
	[Stat.PestCooldownReduction]: 'ൠ',
	[Stat.SunflowerFortune]: '☘',
	[Stat.MoonflowerFortune]: '☘',
	[Stat.WildRoseFortune]: '☘',
};

export const RARITY_COLORS: Record<Rarity, string> = {
	[Rarity.Common]: '§f',
	[Rarity.Uncommon]: '§a',
	[Rarity.Rare]: '§9',
	[Rarity.Epic]: '§5',
	[Rarity.Legendary]: '§6',
	[Rarity.Mythic]: '§d',
	[Rarity.Divine]: '§b',
	[Rarity.Special]: '§c',
	[Rarity.VerySpecial]: '§c',
	[Rarity.Ultimate]: '§4',
	[Rarity.Admin]: '§4',
};
