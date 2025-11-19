import { getPublicGuild, getPublicGuildEvents } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, url }) => {
	const { guild } = params;

	// Remove everything before the last dash
	const guildId = guild.slice(guild.lastIndexOf('-') + 1);

	const { data: guildData } = await getPublicGuild(guildId).catch(() => ({ data: undefined }));

	if (!guildData?.id || !guildData.name) {
		throw error(404, 'Guild not found');
	}

	const properUrl = guildData.name.replaceAll(' ', '-') + '-' + guildData.id;

	if (properUrl !== guild && !url.pathname.endsWith('/join')) {
		throw redirect(307, `/server/${properUrl}`);
	}

	const { data: events } = await getPublicGuildEvents(guildData.id).catch(() => ({ data: undefined }));

	return {
		guild: guildData,
		events: events ?? [],
	};
}) satisfies LayoutServerLoad;
