import type { ProfileData } from './skyblock.d';
import { keyStore } from '$stores/apiKey';
import { parse } from 'prismarine-nbt';

export async function validateKey(key: string) {
	const response = await fetch(`https://api.hypixel.net/key?key=${key}`);

	keyStore.update(value => { 
		return {
			key: value.key,
			validated: response.status === 200
		}
	})

	return response.status === 200;
}

export async function accountFromIGN(ign: string) {
	const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`).catch(() => undefined);

	if (!response) return undefined;

	if (response.status !== 200) {
		return response;
	}

	const data = await response.json();

	return accountFromUUID(data.id);
}

export async function accountFromUUID(ign: string) {
	const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${ign}`).catch(() => undefined);

	if (!response) return undefined;

	if (response.status !== 200) {
		return response;
	}

	return response.json();
}

export async function fetchProfiles(uuid: string, key: string) {
	const response = await fetch(`https://api.hypixel.net/skyblock/profiles?uuid=${uuid}&key=${key}`);
	console.log(key);

	if (!response) return undefined;

	if (response.status !== 200) {
		return response;
	}

	return new Promise((resolve,) => {
		response.json().then(async (data) => {

			await formatProfiles(data.profiles);

			resolve(data);
		})
	})
}

export async function fetchPlayer(uuid: string, key: string) {
	const response = await fetch(`https://api.hypixel.net/player?uuid=${uuid}&key=${key}`);

	if (!response) return undefined;

	if (response.status !== 200) {
		return response;
	}

	return response.json();
}

export async function formatProfiles(profiles: ProfileData[]) {
	const parseQueue = [];

	for (const profile of profiles) {
		for (const uuid in profile.members) {
			const member = profile.members[uuid];

			for (const key in member) {
				const element = member[key];

				if (element.type === 0 && element.data !== undefined) {
					parseQueue.push(hydrateNBT(element));
				}
			}

		}
	}

	Promise.all(parseQueue);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateNBT(element: { type: 0, data: any }) {
	const result = await parse(Buffer.from(element.data, 'base64'));
	element.data = result.parsed.value.i?.value;
}

