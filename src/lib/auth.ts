export enum PermissionFlags {
	None = 0,
	Helper = 16,
	ViewGraphs = 17,
	Moderator = 32,
	Admin = 64,
}

export const PERMISSIONS = {
	[PermissionFlags.None]: {
		name: 'None',
		description: 'No permissions',
	},
	[PermissionFlags.Helper]: {
		name: 'Helper',
		description: 'Currently no permissions',
	},
	[PermissionFlags.ViewGraphs]: {
		name: 'View Stats',
		description: 'View some player stats',
	},
	[PermissionFlags.Moderator]: {
		name: 'Moderator',
		description: 'Moderator permissions',
	},
	[PermissionFlags.Admin]: {
		name: 'Admin',
		description: 'All permissions, super user',
	},
};

export const hasPermission = (user: App.Locals['user'], permission: PermissionFlags) => {
	if (!user?.permissions) return false;

	console.log(user.permissions, permission, PERMISSIONS[permission].name, user.permissions >= permission);

	return user.permissions >= permission;
};
