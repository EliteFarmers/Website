
export async function FetchGuilds(accessToken: string) {
	const url = 'https://discord.com/api/users/@me/guilds';

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const json = await response.json();

	if (response.status !== 200) {
		return undefined;
	}

	if (!Array.isArray(json)) {
		return undefined;
	}

	// Filter out guilds that the user doesn't have MANAGE_GUILD permissions in
	// Sort so that the guilds are in alphabetical order but the user's guild is first
	const guilds = json.filter((guild: Guild) => guild.permissions & 0x20 || guild.owner).sort((a: Guild, b: Guild) => {
		if (a.owner && !b.owner) return -1;
		if (b.owner && !a.owner) return 1;
		return a.name.localeCompare(b.name);
	});

	return guilds;
}

export function (guild: Guild, permission: number) {
	return guild.permissions & permission || guild.owner;
}

export interface Guild {
	id: string,
    name: string,
    icon: string,
    owner: boolean,
    permissions: number,
    features: string[],
    permissions_new: string,
}