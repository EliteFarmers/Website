import { GetEventDetails, GetEventMembers, GetPublicGuild } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, setHeaders }) => {
	const { event } = params;

	// Remove everything before the last dash
	const eventId = event.slice(event.lastIndexOf('-') + 1);

	const { data: eventData } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

	if (!eventData?.id || !eventData.name || !eventData.guildId) {
		console.log(eventData);
		throw error(404, 'Guild not found');
	}

	const properUrl = eventData.name.replaceAll(' ', '-') + '-' + eventData.id;

	if (properUrl !== event) {
		throw redirect(302, `/event/${properUrl}`);
	}

	const { data: members } = await GetEventMembers(eventData.id).catch(() => ({ data: undefined }));
	const { data: guild } = await GetPublicGuild(eventData.guildId).catch(() => ({ data: undefined }));

	setHeaders({
		'Cache-Control': 'public, max-age=300',
	});

	return {
		event: eventData,
		members: members ?? [],
		guild: guild ?? {},
	};
}) satisfies LayoutServerLoad;
