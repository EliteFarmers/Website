import { client } from '$db/redis';
import {
	DISCORD_BOT_TOKEN,
	KOFI_BRONZE_ROLE,
	KOFI_DONATOR_ROLE,
	KOFI_GOLD_ROLE,
	KOFI_ROLES_SERVER,
	KOFI_SILVER_ROLE,
} from '$env/static/private';
import { IsSnowflake } from '$params/snowflake';

const GUILDS_KEY = 'botguilds';
const GUILDS_FETCH_INTERVAL = 1;//60 * 10; // 10 minutes
const MEMBER_FETCH_INTERVAL = 60 * 10; // 10 minutes

export async function FetchBotGuilds() {
	const guilds = await client.exists(GUILDS_KEY);

	if (guilds > 0) {
		return true;
	}

	const url = 'https://discord.com/api/v10/users/@me/guilds';

	const response = await fetch(url, {
		headers: {
			Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
		},
	});

	const json = (await response.json()) as unknown;

	if (response.status !== 200 || !Array.isArray(json)) {
		return false;
	}

	await client.SETEX(GUILDS_KEY, GUILDS_FETCH_INTERVAL, JSON.stringify(json));

	await Promise.allSettled(
		json.map(async (guild: Guild) => {
			await client.SETEX(`guild:${guild.id}`, GUILDS_FETCH_INTERVAL, guild.permissions);
		})
	);

	return true;
}

export async function FetchGuilds(accessToken: string) {
	if (!(await FetchBotGuilds())) {
		return undefined;
	}

	const url = 'https://discord.com/api/v10/users/@me/guilds';

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const json = (await response.json()) as unknown;

	if (response.status !== 200) {
		return undefined;
	}

	if (!Array.isArray(json)) {
		return undefined;
	}

	// Filter out guilds that the user doesn't have MANAGE_GUILD permissions in
	// Sort so that the guilds are in alphabetical order but the user's guild is first
	const guilds = json.filter(CanEditGuild).sort((a: Guild, b: Guild) => {
		if (a.owner && !b.owner) return -1;
		if (b.owner && !a.owner) return 1;
		return a.name.localeCompare(b.name);
	});

	const withBot = await Promise.all(
		guilds.map(async (guild: Guild) => {
			const hasBot = await client.exists(`guild:${guild.id}`);
			return {
				...guild,
				hasBot: hasBot > 0,
			};
		})
	);

	return withBot as Guild[];
}

export async function CanEditFetchedGuild(accessToken: string, guildId: string) {
	// const hasBot = await client.exists(`guild:${guildId}`) > 0;

	if (!IsSnowflake(guildId) /* || !hasBot*/) {
		return false;
	}

	const url = `https://discord.com/api/v10/guilds/${guildId}/members/@me`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const json = (await response.json()) as unknown;

	if (response.status !== 200) {
		return false;
	}

	console.log(json);

	return CanEditGuild(json as Guild);
}

export function CanEditGuild(guild: Guild) {
	if (guild.owner) return true;

	const perms = BigInt(guild.permissions);

	const manageGuild = BigInt(0x20);
	const manageEvents = BigInt(0x200000000);

	return (perms & manageGuild) === manageGuild || (perms & manageEvents) === manageEvents;
}

export async function FetchPremiumStatus(memberId: string): Promise<PremiumStatus> {
	if (!IsSnowflake(memberId)) {
		return PremiumStatus.None;
	}

	const cached = await client.get(`premium:${memberId}`);
	if (cached) {
		return cached as PremiumStatus;
	}

	// Get guild member
	const url = `https://discord.com/api/v10/guilds/${KOFI_ROLES_SERVER}/members/${memberId}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
		},
	});

	const member = (await response.json()) as unknown;

	if (response.status !== 200) {
		return PremiumStatus.None;
	}

	const roles = (member as { roles: string[] | undefined }).roles;

	if (!roles?.length || roles.length <= 0 || !Array.isArray(roles)) {
		return PremiumStatus.None;
	}

	let status;
	if (roles.includes(KOFI_GOLD_ROLE)) {
		status = PremiumStatus.Gold;
	} else if (roles.includes(KOFI_SILVER_ROLE)) {
		status = PremiumStatus.Silver;
	} else if (roles.includes(KOFI_BRONZE_ROLE)) {
		status = PremiumStatus.Bronze;
	} else if (roles.includes(KOFI_DONATOR_ROLE)) {
		status = PremiumStatus.Donator;
	} else {
		status = PremiumStatus.None;
	}

	await client.SETEX(`premium:${memberId}`, MEMBER_FETCH_INTERVAL, status);

	return status;
}

export async function GuildContainsBot(guildId: string) {
	if (!IsSnowflake(guildId)) {
		return false;
	}

	await FetchBotGuilds();

	const hasBot = await client.exists(`guild:${guildId}`);
	return hasBot > 0;
}

export interface Guild {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: string;
	features: string[];
	hasBot: boolean;
}

export enum PremiumStatus {
	None = 'none',
	Donator = 'donator',
	Bronze = 'bronze',
	Silver = 'silver',
	Gold = 'gold',
}
