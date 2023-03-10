
export async function FetchGuilds(accessToken: string) {
	const url = 'https://discord.com/api/v10/users/@me/guilds';

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const json = await response.json() as unknown;

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

	return guilds as Guild[];
}

export function CanEditGuild(guild: Guild) {
	if (guild.owner) return true;

	const perms = BigInt(guild.permissions);

	const manageGuild = BigInt(0x20);
	const manageEvents = BigInt(0x200000000);

	return (perms & manageGuild) === manageGuild || (perms & manageEvents) === manageEvents;
}

export interface Guild {
	id: string,
    name: string,
    icon: string,
    owner: boolean,
    permissions: string,
    features: string[],
}