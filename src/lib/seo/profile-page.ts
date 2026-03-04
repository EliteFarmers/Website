export type ProfilePagePropertyValue = {
	'@type': 'PropertyValue';
	name: string;
	value: string;
};

export type ProfilePagePropertyInput = {
	name: string;
	value: string | number | boolean | null | undefined;
};

export interface ProfilePageOptions {
	title: string;
	description: string;
	url: string;
	ign?: string | null;
	ignMeta?: string | null;
	uuid?: string | null;
	profileName?: string | null;
	profileId?: string | null;
	gameMode?: string | null;
	additionalProperties?: ProfilePagePropertyInput[];
}

const toPropertyValue = (input: ProfilePagePropertyInput | undefined): ProfilePagePropertyValue | null => {
	if (!input?.name) return null;
	if (input.value === null || input.value === undefined) return null;
	const value = String(input.value).trim();
	if (!value) return null;
	return {
		'@type': 'PropertyValue',
		name: input.name,
		value,
	};
};

export const buildProfilePageLdJson = (options: ProfilePageOptions) => {
	const properties: ProfilePagePropertyValue[] = [];

	const baseProps = [
		{ name: 'Profile', value: options.profileName },
		{ name: 'Profile ID', value: options.profileId },
		{ name: 'Game Mode', value: options.gameMode },
		...(options.additionalProperties ?? []),
	];

	for (const input of baseProps) {
		const value = toPropertyValue(input);
		if (value) properties.push(value);
	}

	const name = options.ignMeta || options.ign || 'Minecraft Player';
	const mainEntity: Record<string, unknown> = {
		'@type': 'Person',
		name,
	};

	if (options.ign && options.ignMeta && options.ignMeta !== options.ign) {
		mainEntity.alternateName = options.ign;
	}

	if (options.uuid) {
		mainEntity.identifier = {
			'@type': 'PropertyValue',
			name: 'Minecraft UUID',
			value: options.uuid,
		};
		mainEntity.image = `https://api.elitebot.dev/account/${options.uuid}/face.png`;
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		name: options.title,
		description: options.description,
		url: options.url,
		mainEntity,
		additionalProperty: properties.length ? properties : undefined,
	};
};
