import createClient from "openapi-fetch";
import type { paths } from "./api";
import { ELITE_API_URL, NODE_ENV } from "$env/static/private";

if (NODE_ENV === "development") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const { get } = createClient<paths>({
	baseUrl: ELITE_API_URL,
});

export const GetPlayer = async (playerUuidOrIgn: string) => await get('/api/Player/{playerUuidOrIgn}', {
	params: {
		path: {
			playerUuidOrIgn,
		}
	}
});


export const GetPlayerByDiscordId = async (id: string) => await get('/api/Player/{discordId}', {
	params: {
		path: {
			discordId: id as unknown as number,
		}
	}
});

export const GetProfiles = async (playerUuid: string) => await get('/api/Profiles/{playerUuid}', {
	params: {
		path: {
			playerUuid
		}
	}
});

export const GetProfile = async (profileUuid: string) => await get('/api/Profile/{profileUuid}', {
	params: {
		path: {
			profileUuid
		}
	}
});

export const GetProfileMember = async (playerUuid: string, profileUuid: string) => await get('/api/Profile/{playerUuid}/{profileUuid}', {
	params: {
		path: {
			playerUuid,
			profileUuid
		}
	}
});

export const GetSelectedProfileMember = async (playerUuid: string) => await get('/api/Profile/{uuid}/Selected', {
	params: {
		path: {
			uuid: playerUuid
		}
	}
});

export const GetPlayerRanks = async (playerUuid: string, profileUuid: string) => await get('/api/Leaderboard/ranks/{playerUuid}/{profileUuid}', {
	params: {
		path: {
			playerUuid,
			profileUuid
		}
	}
});