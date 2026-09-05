export type CropProfitColumn = 'npcProfit' | 'bazaarProfit';
export type CropProfitSortDirection = 'ascending' | 'descending';

interface CropProfitRow {
	displayName: string;
	npcProfit: number;
	bazaarProfit: number | null;
}

export function sortCropRates<T extends CropProfitRow>(
	rows: readonly T[],
	column: CropProfitColumn,
	direction: CropProfitSortDirection
): T[] {
	return [...rows].sort((a, b) => {
		const left = a[column];
		const right = b[column];

		if (left === null && right === null) {
			return b.npcProfit - a.npcProfit || a.displayName.localeCompare(b.displayName);
		}
		if (left === null) return 1;
		if (right === null) return -1;

		return (direction === 'ascending' ? left - right : right - left) || a.displayName.localeCompare(b.displayName);
	});
}
