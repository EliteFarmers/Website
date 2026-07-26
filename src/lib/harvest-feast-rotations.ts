import type { HarvestFeastRotationDto, HarvestFeastRotationsDto } from '$lib/api';

export function selectHarvestFeastRotations(
	feast: HarvestFeastRotationsDto | null | undefined,
	nowUnixSeconds: number
): {
	current: HarvestFeastRotationDto | null;
	upcoming: HarvestFeastRotationDto[];
} {
	return {
		current: feast?.current ?? null,
		upcoming: Object.values(feast?.rotations ?? {})
			.filter((rotation) => Number(rotation.start) > nowUnixSeconds)
			.sort((a, b) => Number(a.start) - Number(b.start)),
	};
}
