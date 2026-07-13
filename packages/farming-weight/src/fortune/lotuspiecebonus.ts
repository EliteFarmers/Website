import type { EliteItemDto } from './item.js';

const LOTUS_TO_BLOSSOM_PIECE_BONUS_MULTIPLIER = 1.5;

/**
 * Temporary hack as we don't have a clean way to get bonus values for lotus pieces.
 */
export function getLotusToBlossomPieceBonus(
	currentSkyblockId: string | null | undefined,
	nextSkyblockId: string | null | undefined,
	currentBonus: number
): number | undefined {
	if (currentBonus <= 0 || !currentSkyblockId?.startsWith('LOTUS_') || !nextSkyblockId?.startsWith('BLOSSOM_')) {
		return undefined;
	}

	return currentBonus * LOTUS_TO_BLOSSOM_PIECE_BONUS_MULTIPLIER;
}

export function setLotusPieceBonusLore(item: EliteItemDto, pieceBonus: number): void {
	item.lore = [
		...(item.lore ?? []).filter((line) => !/Piece Bonus: §6\+\d+.?\d*☘/.test(line)),
		`§7Piece Bonus: §6+${formatLotusPieceBonus(pieceBonus)}☘`,
	];
}

function formatLotusPieceBonus(value: number): string {
	return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}
