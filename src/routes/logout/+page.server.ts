import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = ({ cookies }) => {
	cookies.delete('discord_access_token');
	cookies.delete('discord_refresh_token');
	cookies.delete('user_info');
	cookies.delete('auth_state');

	return {
		status: 200,
	};
};
