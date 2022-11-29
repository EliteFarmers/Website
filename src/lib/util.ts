export function RoundToFixed(num: number | null, fixed = 2) {
	if (num === null || !isFinite(num)) return 0;

	const divider = Math.pow(10, fixed);
	const rounded = Math.round((num + Number.EPSILON) * divider) / divider;

	return isNaN(rounded) ? 0 : rounded;
}
