export interface PageStyleDataDto {
	properties: Record<string, string>;
	background?: {
		imageUrl: string;
		opacity: number;
		fit: string;
		position: string;
	} | null;
}

export interface FrameStyleLayerDto {
	imageUrl: string;
	opacity: number;
	scale: number;
}

export interface FrameStyleDataDto {
	leaderboard?: FrameStyleLayerDto | null;
	nameCard?: FrameStyleLayerDto | null;
}

export interface CosmeticCapabilitiesDto {
	weight: boolean;
	leaderboard: boolean;
	nameCard: boolean;
	page: boolean;
	frame: boolean;
}

export interface CosmeticSelectionDto {
	mode: 0 | 1 | 2;
	id?: number | null;
}

export interface LeaderboardAppearanceOverrideDto {
	style: CosmeticSelectionDto;
	frame: CosmeticSelectionDto;
}
