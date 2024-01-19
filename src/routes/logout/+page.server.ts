import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = ({ cookies }) => {
	cookies.delete('discord_access_token', { path: '/' });
	cookies.delete('discord_refresh_token', { path: '/' });
	cookies.delete('user_info', { path: '/' });
	cookies.delete('auth_state', { path: '/' });

	return {
		status: 200,
	};
};
