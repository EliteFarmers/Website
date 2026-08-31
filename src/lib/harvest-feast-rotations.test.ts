import type { HarvestFeastRotationDto, HarvestFeastRotationsDto } from '$lib/api';
import { SkyBlockTime } from 'farming-weight';
import { describe, expect, it } from 'vitest';
import { getNextHarvestFeastWindow, selectHarvestFeastRotations } from './harvest-feast-rotations';

function rotation(start: number, end: number): HarvestFeastRotationDto {
	return {
		month: 8,
		start: start.toString(),
		end: end.toString(),
		crops: ['Wheat'],
	};
}

function feast(
	current: HarvestFeastRotationDto | null,
	rotations: HarvestFeastRotationDto[]
): HarvestFeastRotationsDto {
	return {
		year: 500,
		complete: false,
		isGrandFeast: false,
		current,
		rotations: Object.fromEntries(rotations.map((entry) => [entry.start, entry])),
	};
}

describe('selectHarvestFeastRotations', () => {
	it('uses an active reported current rotation', () => {
		const current = rotation(100, 200);

		expect(selectHarvestFeastRotations(feast(current, [current]), 150).current).toBe(current);
	});

	it('falls back to an active authoritative rotation window when reported current is stale', () => {
		const stale = rotation(10, 20);
		const active = rotation(100, 200);

		expect(selectHarvestFeastRotations(feast(stale, [stale, active]), 150).current).toBe(active);
	});

	it('does not return an expired rotation as current', () => {
		const stale = rotation(10, 20);

		expect(selectHarvestFeastRotations(feast(stale, [stale]), 150).current).toBeNull();
	});
});

describe('getNextHarvestFeastWindow', () => {
	it('returns the first Feast wave later in the current SkyBlock year', () => {
		const now = SkyBlockTime.from(500, 6, 1).unixSeconds;

		expect(getNextHarvestFeastWindow(now)).toEqual({
			start: SkyBlockTime.from(500, 7, 1).unixSeconds,
			end: SkyBlockTime.from(500, 8, 1).unixSeconds,
		});
	});

	it('advances to the next Feast wave while a prior wave is underway', () => {
		const now = SkyBlockTime.from(500, 7, 2).unixSeconds;

		expect(getNextHarvestFeastWindow(now)).toEqual({
			start: SkyBlockTime.from(500, 8, 1).unixSeconds,
			end: SkyBlockTime.from(500, 9, 1).unixSeconds,
		});
	});

	it('advances to the next SkyBlock year after the final Feast wave', () => {
		const now = SkyBlockTime.from(500, 10, 1).unixSeconds;

		expect(getNextHarvestFeastWindow(now)).toEqual({
			start: SkyBlockTime.from(501, 7, 1).unixSeconds,
			end: SkyBlockTime.from(501, 8, 1).unixSeconds,
		});
	});
});
