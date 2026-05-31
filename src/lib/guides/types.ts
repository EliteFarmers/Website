import { GuideAssetType } from '$lib/api/schemas';
import type { CommentDto, FullGuideDto, GuideAssetDto, GuideDto, UserGuideDto } from '$lib/api/schemas';

export { ContentReportStatus, ContentReportTargetType, GuideAssetType } from '$lib/api/schemas';
export type {
	ContentReportDto,
	GuideAssetDto,
	GuideAuthorDto,
	GuideLitematicDto,
	GuideVersionDto,
	ImageAttachmentDto,
} from '$lib/api/schemas';

export type FullGuideWithAuthors = FullGuideDto;

export type GuideListWithAuthors = GuideDto;

export type UserGuideWithAuthors = UserGuideDto;

export type CommentWithGuideAuthor = CommentDto;

export function isImageAsset(asset: GuideAssetDto) {
	return asset.type === GuideAssetType.image;
}

export function isLitematicAsset(asset: GuideAssetDto) {
	return asset.type === GuideAssetType.litematic;
}
