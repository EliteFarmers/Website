import type { ManagedResourcePackDto, ManagedResourcePackVersionDto, ResourcePackDto } from '$lib/api';

export interface LocalTexturePackOverride extends ResourcePackDto {
	source: 'managed-preview';
	managedPackId: number;
	managedPackName: string;
	managedVersionId: string;
}

export function mergeTexturePackCatalog(
	cachedPacks: ResourcePackDto[] | null | undefined,
	overrides: LocalTexturePackOverride[] | null | undefined
) {
	const merged = new Map<string, ResourcePackDto>();
	const cachedPackList = Array.isArray(cachedPacks) ? cachedPacks : [];
	const overrideList = Array.isArray(overrides) ? overrides : [];

	for (const pack of cachedPackList) {
		merged.set(pack.id, pack);
	}

	for (const override of overrideList) {
		if (!merged.has(override.id)) {
			merged.set(override.id, override);
		}
	}

	return [...merged.values()];
}

export function buildManagedPreviewTexturePack(
	pack: Pick<ManagedResourcePackDto, 'id' | 'displayName' | 'modrinthProjectUrl'>,
	version: Pick<
		ManagedResourcePackVersionDto,
		| 'previewPackId'
		| 'versionId'
		| 'versionName'
		| 'versionNumber'
		| 'packVersion'
		| 'packDescription'
		| 'packAuthors'
		| 'supportsCit'
		| 'packFormat'
		| 'primaryFileUrl'
	>
): LocalTexturePackOverride | null {
	const previewPackId = version.previewPackId?.trim();
	if (!previewPackId) {
		return null;
	}

	return {
		id: previewPackId,
		name: `${pack.displayName} Preview`,
		version: version.packVersion?.trim() || version.versionNumber || 'preview',
		description: version.packDescription?.trim() || `Preview build for ${pack.displayName}.`,
		authors: version.packAuthors.length ? version.packAuthors : ['Elite Website Preview'],
		downloadUrl: version.primaryFileUrl || pack.modrinthProjectUrl,
		supportsCit: version.supportsCit,
		packFormat: version.packFormat,
		source: 'managed-preview',
		managedPackId: pack.id,
		managedPackName: pack.displayName,
		managedVersionId: version.versionId,
	};
}
