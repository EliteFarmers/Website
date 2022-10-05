import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = ({ cookies }) => {
	cookies.set('discord_access_token', 'deleted;', {
		path: '/',
		maxAge: -1,
	});

	cookies.set('discord_refresh_token', 'deleted;', {
		path: '/',
		maxAge: -1,
	});

	return {
		status: 200,
	};
};
