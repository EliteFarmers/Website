import type { ResourcePackDto } from '$lib/api';

export interface LocalTexturePackOverride extends ResourcePackDto {
	source: 'managed-preview';
}

export function mergeTexturePackCatalog(
	cachedPacks: ResourcePackDto[] | null | undefined,
	overrides: LocalTexturePackOverride[] | null | undefined
) {
	const merged = new Map<string, ResourcePackDto>();

	for (const pack of cachedPacks ?? []) {
		merged.set(pack.id, pack);
	}

	for (const override of overrides ?? []) {
		if (!merged.has(override.id)) {
			merged.set(override.id, override);
		}
	}

	return [...merged.values()];
}
