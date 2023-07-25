export function CanEditGuild(guild: Guild) {
	if (guild.owner) return true;

	const perms = BigInt(guild.permissions);

	const manageGuild = BigInt(0x20);
	const administrator = BigInt(0x08);

	return (perms & manageGuild) === manageGuild || (perms & administrator) === administrator;
}

// export async function FetchPremiumStatus(memberId: string): Promise<PremiumStatus> {
// 	if (!IsSnowflake(memberId)) {
// 		return PremiumStatus.None;
// 	}

// 	const cached = await client.get(`premium:${memberId}`);
// 	if (cached) {
// 		return cached as PremiumStatus;
// 	}

// 	// Get guild member
// 	const url = `https://discord.com/api/v10/guilds/${KOFI_ROLES_SERVER}/members/${memberId}`;

// 	const response = await fetch(url, {
// 		headers: {
// 			Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
// 		},
// 	});

// 	const member = (await response.json()) as unknown;

// 	if (response.status !== 200) {
// 		return PremiumStatus.None;
// 	}

// 	const roles = (member as { roles: string[] | undefined }).roles;

// 	if (!roles?.length || roles.length <= 0 || !Array.isArray(roles)) {
// 		return PremiumStatus.None;
// 	}

// 	let status;
// 	if (roles.includes(KOFI_GOLD_ROLE)) {
// 		status = PremiumStatus.Gold;
// 	} else if (roles.includes(KOFI_SILVER_ROLE)) {
// 		status = PremiumStatus.Silver;
// 	} else if (roles.includes(KOFI_BRONZE_ROLE)) {
// 		status = PremiumStatus.Bronze;
// 	} else if (roles.includes(KOFI_DONATOR_ROLE)) {
// 		status = PremiumStatus.Donator;
// 	} else {
// 		status = PremiumStatus.None;
// 	}

// 	await client.SETEX(`premium:${memberId}`, MEMBER_FETCH_INTERVAL, status);

// 	return status;
// }

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
