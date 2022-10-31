import { PROFILE_UPDATE_INTERVAL } from './constants/data';
import type { Profiles } from './skyblock';

/**
 * Returns new profile data or `undefined` if the profile is not found or not updatable yet.
 */
export async function FetchNewProfiles(uuid: string, last_fetched: number, delay = 2000) {
	if (Date.now() - last_fetched < PROFILE_UPDATE_INTERVAL) {
		return undefined;
	}

	// Wait for the delay
	await new Promise((resolve) => setTimeout(resolve, delay));

	const res = await fetch(`/api/profiles/${uuid}`);

	if (res.status !== 200) {
		return undefined;
	}

	try {
		const data = (await res.json()) as Profiles;

		if (data.success) {
			return data;
		}
	} catch (e) {
		return undefined;
	}
}

export function RoundToFixed(num: number | null, fixed = 2) {
	if (num === null || !isFinite(num)) return 0;

	const divider = Math.pow(10, fixed);
	const rounded = Math.round((num + Number.EPSILON) * divider) / divider;

	return isNaN(rounded) ? 0 : rounded;
}
