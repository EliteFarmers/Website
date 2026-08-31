import type { HarvestFeastRotationDto, HarvestFeastRotationsDto } from '$lib/api';
import { SkyBlockTime } from 'farming-weight';

const HARVEST_FEAST_WAVE_MONTHS = [7, 8, 9] as const;

export function getNextHarvestFeastWindow(nowUnixSeconds: number): { start: number; end: number } {
	const now = new SkyBlockTime(nowUnixSeconds * 1000);
	const nextMonth = HARVEST_FEAST_WAVE_MONTHS.find(
		(month) => SkyBlockTime.from(now.year, month, 1).unixSeconds > nowUnixSeconds
	);
	const year = nextMonth === undefined ? now.year + 1 : now.year;
	const month = nextMonth ?? HARVEST_FEAST_WAVE_MONTHS[0];

	return {
		start: SkyBlockTime.from(year, month, 1).unixSeconds,
		end: SkyBlockTime.from(year, month + 1, 1).unixSeconds,
	};
}

export function selectHarvestFeastRotations(
	feast: HarvestFeastRotationsDto | null | undefined,
	nowUnixSeconds: number
): {
	current: HarvestFeastRotationDto | null;
	upcoming: HarvestFeastRotationDto[];
	isGrandFeast: boolean;
} {
	const rotations = Object.values(feast?.rotations ?? {});
	const reportedCurrent = feast?.current;
	const current =
		reportedCurrent &&
		Number(reportedCurrent.start) < nowUnixSeconds &&
		nowUnixSeconds <= Number(reportedCurrent.end)
			? reportedCurrent
			: (rotations.find(
					(rotation) => Number(rotation.start) < nowUnixSeconds && nowUnixSeconds <= Number(rotation.end)
				) ?? null);

	return {
		current,
		upcoming: rotations
			.filter((rotation) => Number(rotation.start) > nowUnixSeconds)
			.sort((a, b) => Number(a.start) - Number(b.start)),
		isGrandFeast: feast?.isGrandFeast ?? false,
	};
}
