import type { LeaderboardDto, LeaderboardEntryDto, WeightStyleListDto } from '$lib/api';
import type { LeaderboardEntry } from '$lib/api/elite';

export type StyledLeaderboard = LeaderboardDto & { entries: LeaderboardEntry[] };

export function applyLeaderboardStyles(
	entries: readonly LeaderboardEntryDto[],
	styles: Record<string, Pick<WeightStyleListDto, 'leaderboard' | 'frame' | 'imageRefs'>>
): LeaderboardEntry[] {
	return entries.map((entry) => {
		const styleId = entry.meta?.leaderboard?.styleId;
		const frameId = entry.meta?.leaderboard?.frameId;
		const style = styleId == null ? undefined : styles[styleId];
		const frame = frameId == null ? undefined : styles[frameId];
		return {
			...entry,
			style: style?.leaderboard ?? undefined,
			imageRefs: style?.imageRefs ?? undefined,
			frame: frame?.frame?.leaderboard ?? undefined,
			frameImageRefs: frame?.imageRefs ?? undefined,
		};
	});
}
