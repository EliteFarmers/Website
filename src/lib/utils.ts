export function CanManageGuild(permissions?: string) {
	if (!permissions) return false;
	
	const perms = BigInt(permissions);

	const admin = BigInt(0x8);
	const manageGuild = BigInt(0x20);

	// Check if the user has the manage guild or manage events permission
	return (perms & admin) === admin || (perms & manageGuild) === manageGuild;
}

export enum ChannelType {
    GuildText = 0,
    DirectMessage = 1,
    GuildVoice = 2,
    GroupDirectMessage = 3,
    GuildCategory = 4,
    GuildAnnouncement = 5,
    AnnouncementThread = 10,
    PublicThread = 11,
    PrivateThread = 12,
    GuildStage = 13,
    GuildDirectory = 14,
    GuildForum = 15
}