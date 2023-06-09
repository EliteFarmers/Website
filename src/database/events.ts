/*import { Event, Server } from './database';
import type { EventData } from './models/event';
import type { ServerData } from './models/servers';
import { client } from './redis';

export async function CreateEvent(data: EventData) {
	try {
		const event = await Event.create(data);
		return event;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function GetEvent(id: string) {
	try {
		const event = await Event.findOne({ where: { id } });
		return event;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function GetEventsInServer(serverId: string) {
	try {
		const events = await Event.findAll({ where: { serverId } });
		return events;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function UpdateEvent(id: string, data: EventData) {
	try {
		const event = await GetEvent(id);
		if (!event) return null;
		await event.update(data);
		return event;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function GetEnrolledEvents(userId: string) {
	try {
		const events = await Event.findAll({ where: { members: { $contains: [userId] } } });
		return events;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function GetGuild(id: string) {
	try {
		const guild = await Server.findOne({ where: { id } });
		return guild;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function CreateGuild(id: string) {
	try {
		const data = await client.get(`guild:${id}`);
		if (!data) return null;

		const guild = await Server.create(JSON.parse(data) as ServerData);
		return guild;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function GetOrCreateGuild(id: string) {
	try {
		const guild = await GetGuild(id);
		if (guild) return guild;
		return await CreateGuild(id);
	} catch (error) {
		console.log(error);
		return null;
	}
}
*/