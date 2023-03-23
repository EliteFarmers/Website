export interface UserRecord {
	id: string;
	username: string;
	email: string;
	emailVisibility: boolean;
	verified: boolean;
	uuid?: string;
	ign?: string;
	avatar: string;
	discriminator: string;
	discordId: string;
	subscribeDate?: string;
	leaderboardTokens: number;
	eventTokens: number;
	created: string;
	updated: string;
	premium: PremiumStatusString;
}

export type PremiumStatusString = 'none' | 'donator' | 'bronze' | 'silver' | 'gold';
