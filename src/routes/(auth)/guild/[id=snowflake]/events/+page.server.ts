import { error, type NumericRange } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CanManageGuild, EventType } from '$lib/utils';
import { GetAdminGuildEvents, CreateWeightEvent, CreateMedalEvent } from '$lib/api/elite';
import type { components } from '$lib/api/api';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { guild, authGuild, session } = await parent();
	const { access_token: token } = locals;

	const hasPerms = CanManageGuild(authGuild, session);

	if (!hasPerms || !token) {
		throw error(403, 'You do not have permission to edit this guild.');
	}

	if (!guild?.features?.eventsEnabled || !guild?.id) {
		throw error(402, 'This guild does not have the Events feature enabled.');
	}

	const { data: events } = await GetAdminGuildEvents(token, guild.id).catch(() => ({ data: undefined }));

	return {
		...(guild.features.eventSettings ?? {}),
		events: events ?? [],
	};
};

export const actions: Actions = {
	create: async ({ locals, params, request }) => {
		const guildId = params.id;
		const { access_token: token } = locals;

		if (!locals.session || !guildId || !token) {
			throw error(401, 'Unauthorized');
		}

		const data = await request.formData();

		const type = data.get('type') as EventType;
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const rules = data.get('rules') as string;
		const prizes = data.get('prizes') as string;
		const startDate = data.get('startDate') as string;
		const endDate = data.get('endDate') as string;
		const joinDate = data.get('joinDate') as string;
		const maxTeamSize = data.get('maxTeamSize') as string | undefined;

		if (!type) throw error(400, 'Missing required field: type');
		if (!title) throw error(400, 'Missing required field: title');
		if (!description) throw error(400, 'Missing required field: description');
		if (!rules) throw error(400, 'Missing required field: rules');
		if (!prizes) throw error(400, 'Missing required field: prizes');
		if (maxTeamSize && isNaN(parseInt(maxTeamSize))) throw error(400, 'Invalid field: maxTeamSize');

		const startTime = startDate ? (new Date(startDate + '+00:00').getTime() / 1000).toString() : undefined;
		const endTime = endDate ? (new Date(endDate + '+00:00').getTime() / 1000).toString() : undefined;
		const joinUntilTime = joinDate ? (new Date(joinDate + '+00:00').getTime() / 1000).toString() : undefined;

		if (!startTime) throw error(400, 'Missing required field: startDate');
		if (!endTime) throw error(400, 'Missing required field: endDate');

		const body = {
			name: title,
			rules,
			description,
			prizeInfo: prizes,
			startTime: startTime as unknown as number, // These are parsed into numbers in the API
			endTime: endTime as unknown as number,
			joinTime: joinUntilTime as unknown as number,
			guildId: guildId,
			maxTeamMembers: maxTeamSize ? parseInt(maxTeamSize) : -1,
			maxTeams: -1,
		} satisfies components['schemas']['CreateWeightEventDto'] | components['schemas']['CreateMedalEventDto'];

		const method = type === EventType.Medals ? CreateMedalEvent : CreateWeightEvent;

		const { response } = await method(token, guildId, body).catch((e) => {
			console.log(e);
			throw error(500, 'Internal Server Error');
		});

		if (response.status !== 200) {
			const msg = await response.text();
			throw error(response.status as NumericRange<400, 499>, msg);
		}

		return {
			success: true,
		};
	},
};
