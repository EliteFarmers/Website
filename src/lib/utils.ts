export function CanManageGuild(permissions?: string) {
	if (!permissions) return false;
	
	const perms = BigInt(permissions);

	console.log(perms, permissions);

	const admin = BigInt(0x8);
	const manageGuild = BigInt(0x20);

	// Check if the user has the manage guild or manage events permission
	return (perms & admin) === admin || (perms & manageGuild) === manageGuild;
}