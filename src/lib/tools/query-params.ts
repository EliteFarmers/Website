export type ToolQueryValues = Record<string, string | number | boolean | undefined>;

export function readNumber(
	params: URLSearchParams,
	key: string,
	fallback: number,
	min: number,
	max: number,
	step?: number
): number {
	const raw = params.get(key);
	if (!raw?.trim()) return fallback;
	const value = Number(raw);
	if (!Number.isFinite(value) || value < min || value > max) return fallback;
	return step ? Math.min(max, Math.max(min, Math.round(value / step) * step)) : value;
}

export function readChoice<T extends string | number>(
	params: URLSearchParams,
	key: string,
	choices: readonly T[],
	fallback: T
): T {
	return choices.find((value) => String(value) === params.get(key)) ?? fallback;
}

export function readBoolean(params: URLSearchParams, key: string, fallback: boolean): boolean {
	const value = params.get(key);
	if (value === 'true' || value === '1') return true;
	if (value === 'false' || value === '0') return false;
	return fallback;
}

export function readText(params: URLSearchParams, key: string): string {
	return (params.get(key) ?? '').trim().slice(0, 128);
}

export function nonDefault<T extends string | number | boolean>(value: T, fallback: T): T | undefined {
	return value === fallback ? undefined : value;
}

/** Only replace parameters owned by this tool. Preserve attribution, other parameters, and the hash. */
export function withToolQuery(url: URL, values: ToolQueryValues): URL {
	const next = new URL(url);
	for (const [key, value] of Object.entries(values)) {
		if (value === undefined || value === '') next.searchParams.delete(key);
		else next.searchParams.set(key, String(value));
	}
	return next;
}
