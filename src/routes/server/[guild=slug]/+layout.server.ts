import { GetGuildEvents, GetPublicGuild } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, setHeaders, url }) => {
	const { guild } = params;

	// Remove everything before the last dash
	const guildId = guild.slice(guild.lastIndexOf('-') + 1);

	const { data: guildData } = await GetPublicGuild(guildId).catch(() => ({ data: undefined }));

	if (!guildData?.id || !guildData.name) {
		throw error(404, 'Guild not found');
	}

	const properUrl = guildData.name.replaceAll(' ', '-') + '-' + guildData.id;

	if (properUrl !== guild && !url.pathname.endsWith('/join')) {
		throw redirect(302, `/server/${properUrl}`);
	}

	const { data: events } = await GetGuildEvents(guildData.id).catch(() => ({ data: undefined }));

	setHeaders({
		'Cache-Control': 'public, max-age=300',
	});

	return {
		guild: guildData,
		events: events ?? [],
	};
}) satisfies LayoutServerLoad;
