import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = ({ cookies }) => {
	cookies.delete('discord_access_token');
	cookies.delete('discord_refresh_token');

	return {
		status: 200,
	};
};
