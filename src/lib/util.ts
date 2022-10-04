import { PUBLIC_HOST_URL } from '$env/static/public';
import { PROFILE_UPDATE_INTERVAL } from './constants/data';
import type { Profiles } from './skyblock';

/**
 * Returns new profile data or `undefined` if the profile is not found or not updatable yet.
 *
 * @param  {string} uuid
 * @param  {number} last_fetched
 * @param  {} delay=2000
 */
export async function FetchNewProfiles(uuid: string, last_fetched: number, delay = 2000) {
	if (Date.now() - last_fetched < PROFILE_UPDATE_INTERVAL) {
		return undefined;
	}

	// Wait for the delay
	await new Promise((resolve) => setTimeout(resolve, delay));

	const res = await fetch(`${PUBLIC_HOST_URL}/api/profiles/${uuid}`);

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
	if (num === null) return 0;

	const divider = Math.pow(10, fixed);
	return Math.round((num + Number.EPSILON) * divider) / divider;
}
