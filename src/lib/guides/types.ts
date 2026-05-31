import type { AuthorDto, CommentDto, FullGuideDto, GuideDto, UserGuideDto } from '$lib/api/schemas';

export type GuideAssetType = 'Image' | 'Litematic' | 0 | 1;
export type ContentReportTargetType = 'Guide' | 'Comment';
export type ContentReportStatus = 'Open' | 'Reviewed' | 'Dismissed';

export interface GuideAuthorDto {
	author: AuthorDto;
	isOwner: boolean;
	role: string;
}

export interface ImageSourceDto {
	url: string;
	width: number;
}

export interface ImageAttachmentDto {
	title?: string | null;
	description?: string | null;
	order?: number | null;
	width: number;
	height: number;
	sources: Record<string, ImageSourceDto>;
	url: string;
}

export interface GuideLitematicDto {
	downloadUrl: string;
	name?: string | null;
	author?: string | null;
	width?: number | null;
	height?: number | null;
	length?: number | null;
	regionCount: number;
}

export interface GuideAssetDto {
	id: string;
	type: GuideAssetType;
	fileName: string;
	contentType: string;
	sizeBytes: number;
	createdAt: string;
	image?: ImageAttachmentDto | null;
	litematic?: GuideLitematicDto | null;
}

export interface GuideVersionDto {
	id: number;
	revisionNumber: number;
	title: string;
	description: string;
	content: string;
	createdAt: string;
	createdById?: string | number | null;
	publishedAt?: string | null;
	publishedById?: string | number | null;
	concurrencyVersion: number;
	isPublished: boolean;
}

export interface ContentReportDto {
	id: number;
	targetType: ContentReportTargetType;
	targetId: number;
	status: ContentReportStatus;
	reason: string;
	createdAt: string;
	reviewedAt?: string | null;
	resolutionNote?: string | null;
	reporter: AuthorDto;
	targetLabel: string;
	targetUrl?: string | null;
}

export type FullGuideWithAuthors = FullGuideDto & {
	authors?: GuideAuthorDto[] | null;
	assets?: GuideAssetDto[] | null;
};

export type GuideListWithAuthors = GuideDto & {
	authors?: GuideAuthorDto[] | null;
};

export type UserGuideWithAuthors = UserGuideDto & {
	author?: AuthorDto | null;
	authors?: GuideAuthorDto[] | null;
};

export type CommentWithGuideAuthor = CommentDto & {
	isGuideAuthor?: boolean;
};

export function isImageAsset(asset: GuideAssetDto) {
	return asset.type === 'Image' || asset.type === 0;
}

export function isLitematicAsset(asset: GuideAssetDto) {
	return asset.type === 'Litematic' || asset.type === 1;
}
