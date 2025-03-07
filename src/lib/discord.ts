import type { components } from './api/api';

export function CanEditGuild(guild: Guild | components['schemas']['GuildMemberDto']) {
	if ('owner' in guild && guild.owner) return true;

	const perms = BigInt(guild.permissions);

	const manageGuild = BigInt(0x20);
	const administrator = BigInt(0x08);

	return (perms & manageGuild) === manageGuild || (perms & administrator) === administrator;
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
