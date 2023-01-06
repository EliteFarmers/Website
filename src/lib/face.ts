import { UpdateFaceData } from '$db/database';
import { client } from '$db/redis';
import sharp from 'sharp';

// Decode properties from a list of properties
export function DecodeProperties(properties: { name: string; value: string }[]) {
	const decoded: Record<string, unknown> = {};
	for (const property of properties) {
		decoded[property.name] = DecodeBase64(property.value);
	}
	return decoded;
}

// Decode a base64 string into a json object
function DecodeBase64(base64: string) {
	return JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) as unknown;
}

export async function ExtractFace(property: { name: string; value: string }) {
	try {
		const textures = DecodeBase64(property.value) as {
			profileId: string;
			textures?: { SKIN?: { url?: string } };
		};

		const url = textures.textures?.SKIN?.url;
		if (!url || !textures.profileId) return null;

		const buffer = await FetchSkin(url);
		if (!buffer) return null;

		const base = (await sharp(buffer).extract({ width: 8, height: 8, left: 8, top: 8 }).toBuffer()).toString(
			'base64'
		);
		const overlay = (await sharp(buffer).extract({ width: 8, height: 8, left: 40, top: 8 }).toBuffer()).toString(
			'base64'
		);

		void UpdateFaceData(textures.profileId, { base, overlay });
		await client.SET(`face:${textures.profileId}`, `${base}:${overlay}`);
	} catch (e) {
		console.log(e);
	}
}

async function FetchSkin(url: string) {
	const blob = await fetch(url)
		.then((res) => res.arrayBuffer())
		.catch(() => null);
	if (!blob) return null;

	return Buffer.from(blob);
}
