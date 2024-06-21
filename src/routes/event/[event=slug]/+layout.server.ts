import { GetEventDetails, GetEventMembers, GetEventTeams, GetPublicGuild } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, setHeaders, url, locals }) => {
	const { event } = params;

	// Remove everything before the last dash
	const eventId = event.slice(event.lastIndexOf('-') + 1);

	const { data: eventData } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

	if (!eventData?.id || !eventData.name || !eventData.guildId) {
		throw error(404, 'Event not found');
	}

	const properUrl = eventData.name.replaceAll(' ', '-') + '-' + eventData.id;

	if (properUrl !== event && !url.pathname.includes('join') && !url.pathname.includes('leaderboard')) {
		throw redirect(302, `/event/${properUrl}`);
	}

	const { data: guild } = await GetPublicGuild(eventData.guildId).catch(() => ({ data: undefined }));

	setHeaders({
		'Cache-Control': 'public, max-age=300',
	});

	if (eventData.maxTeamMembers !== 0 || eventData.maxTeams !== 0) {
		const { data: teams } = await GetEventTeams(eventData.id).catch(() => ({ data: undefined }));

		const joined = locals.session?.uuid
			? teams?.some((t) => t.members?.some((m) => m.playerUuid === locals.session?.uuid))
			: undefined;

		return {
			event: eventData,
			teams: teams ?? [],
			guild,
			joined,
		};
	}

	const { data: members } = await GetEventMembers(eventData.id).catch(() => ({ data: undefined }));

	const joined = locals.session?.uuid ? members?.some((m) => m.playerUuid === locals.session?.uuid) : undefined;

	return {
		event: eventData,
		members: members ?? [],
		guild,
		joined,
	};
}) satisfies LayoutServerLoad;
