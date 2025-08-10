import { getEvent, getEventMember, getEventMembers, getEventTeams, getPublicGuild } from '$lib/api';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, url, locals, depends }) => {
	const { event } = params;
	depends('event:membership');

	// Remove everything before the last dash
	const eventId = event.slice(event.lastIndexOf('-') + 1);

	const { data: eventData } = await getEvent(eventId as unknown as number).catch(() => ({ data: undefined }));

	if (!eventData?.id || !eventData.name || !eventData.guildId) {
		throw error(404, 'Event not found');
	}

	const properUrl = eventData.name.replaceAll(' ', '-') + '-' + eventData.id;

	if (properUrl !== event && !url.pathname.includes('membership') && !url.pathname.includes('leaderboard')) {
		throw redirect(307, `/event/${properUrl}`);
	}

	const { data: guild } = await getPublicGuild(BigInt(eventData.guildId)).catch(() => ({ data: undefined }));

	const { data: self } = locals.session?.uuid
		? await getEventMember(eventData.id as unknown as number, locals.session?.uuid).catch(() => ({
				data: undefined,
			}))
		: { data: undefined };

	const { data: members } = await getEventMembers(eventData.id as unknown as number).catch(() => ({
		data: undefined,
	}));

	const joined = locals.session?.uuid ? members?.some((m) => m.playerUuid === locals.session?.uuid) : undefined;

	if (eventData.maxTeamMembers !== 0 || eventData.maxTeams !== 0) {
		const { data: teams } = await getEventTeams(eventData.id as unknown as number).catch(() => ({
			data: undefined,
		}));

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
