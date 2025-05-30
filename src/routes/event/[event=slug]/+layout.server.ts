import { GetEventDetails, GetEventMember, GetEventMembers, GetEventTeams, GetPublicGuild } from '$lib/api/elite';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, url, locals, depends }) => {
	const { event } = params;
	depends('event:membership');

	// Remove everything before the last dash
	const eventId = event.slice(event.lastIndexOf('-') + 1);

	const { data: eventData } = await GetEventDetails(eventId).catch(() => ({ data: undefined }));

	if (!eventData?.id || !eventData.name || !eventData.guildId) {
		throw error(404, 'Event not found');
	}

	const properUrl = eventData.name.replaceAll(' ', '-') + '-' + eventData.id;

	if (properUrl !== event && !url.pathname.includes('membership') && !url.pathname.includes('leaderboard')) {
		throw redirect(307, `/event/${properUrl}`);
	}

	const { data: guild } = await GetPublicGuild(eventData.guildId).catch(() => ({ data: undefined }));

	const { data: self } = locals.session?.uuid
		? await GetEventMember(eventData.id, locals.session?.uuid, locals.access_token).catch(() => ({
				data: undefined,
			}))
		: { data: undefined };

	const { data: members } = await GetEventMembers(eventData.id).catch(() => ({ data: undefined }));

	const joined = locals.session?.uuid ? members?.some((m) => m.playerUuid === locals.session?.uuid) : undefined;

	if (eventData.maxTeamMembers !== 0 || eventData.maxTeams !== 0) {
		const { data: teams } = await GetEventTeams(eventData.id).catch(() => ({ data: undefined }));

		return {
			event: eventData,
			teams: teams ?? [],
			members: members ?? [],
			guild,
			joined,
			self,
		};
	}

	return {
		event: eventData,
		members: members ?? [],
		guild,
		joined,
		self,
	};
}) satisfies LayoutServerLoad;
