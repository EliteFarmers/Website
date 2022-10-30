import { HYPIXEL_API_KEY } from '$env/static/private';
import type { PlayerData, RawProfileResponse } from '$lib/skyblock';
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({ tokensPerInterval: 119, interval: 'minute' });

interface NoSuccess {
	success: false;
}

type ProfileResponse = Promise<RawProfileResponse | NoSuccess>;
export async function FetchSkyblockProfiles(uuid: string): ProfileResponse {
	await limiter.removeTokens(1);

	const response = await fetch(`https://api.hypixel.net/skyblock/profiles?key=${HYPIXEL_API_KEY}&uuid=${uuid}`);

	if (!response.ok) {
		return {
			success: false,
		};
	}

	return jsonParse(response) as ProfileResponse;
}

type PlayerResponse = Promise<{ success: boolean; player: PlayerData } | NoSuccess>;
export async function FetchHypixelPlayer(uuid: string): PlayerResponse {
	await limiter.removeTokens(1);

	const response = await fetch(`https://api.hypixel.net/player?key=${HYPIXEL_API_KEY}&uuid=${uuid}`);

	if (!response.ok) {
		return {
			success: false,
		};
	}

	return jsonParse(response) as PlayerResponse;
}

async function jsonParse(response: Response): Promise<unknown | NoSuccess> {
	try {
		return (await response.json()) as RawProfileResponse;
	} catch (e) {
		return {
			success: false,
		};
	}
}
