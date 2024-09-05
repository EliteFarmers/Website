import { expect, test } from "vitest";
import { SkyBlockTime } from "./skyblocktime";

test('SkyBlock Time Conversion', () => {
	expect(SkyBlockTime.from(1, 1, 1).unixSeconds).toBe(SkyBlockTime.fromZeroIndexed(0, 0, 0).unixSeconds);
	expect(SkyBlockTime.fromZeroIndexed(0, 0, 0).unixSeconds).toBe(SkyBlockTime.SkyBlockEpochSeconds);

	const date = new Date(2021, 0, 1); // Check that it rounds down to the nearest day
	expect(new SkyBlockTime(date.getTime()).unixSeconds).toBe(1609476900);
});

test('SkyBlock Time Months', () => {
	expect(SkyBlockTime.MonthNames).toHaveLength(12);
	expect(SkyBlockTime.from(1, 1, 1).monthName).toBe('Early Spring');
	expect(SkyBlockTime.from(1, 12, 1).monthName).toBe('Late Winter');
});

test('SkyBlock Time Day of Year', () => {
	expect(SkyBlockTime.from(1, 1, 1).dayOfYear).toBe(1);
	expect(SkyBlockTime.from(1, 1, 31).dayOfYear).toBe(31);
	expect(SkyBlockTime.from(1, 2, 1).dayOfYear).toBe(32);
	expect(SkyBlockTime.from(1, 12, 31).dayOfYear).toBe(372);
});

test('SkyBlock Time Contest Key Conversion', () => {
	const time = SkyBlockTime.fromContestKey('99:9_12:NETHER_STALK');
	expect(time.day).toBe(12);
	expect(time.month).toBe(9);
	expect(time.year).toBe(100); // Contest key year is 0-based
	expect(time.hasJacobContest()).toBe(true);

	const time2 = SkyBlockTime.fromContestKey('130:5_4:NETHER_STALK');
	expect(time2.day).toBe(4);
	expect(time2.month).toBe(5);
	expect(time2.year).toBe(131); // Contest key year is 0-based
	expect(time2.hasJacobContest()).toBe(true);
});

test('SkyBlock Time Nearest Contest', () => {
	const contestTime = SkyBlockTime.fromContestKey('99:9_12:NETHER_STALK');
	expect(contestTime.hasJacobContest()).toBe(true);
	expect(contestTime.unixSeconds).toBe(SkyBlockTime.from(100, 9, 12).unixSeconds);

	const nextDay = SkyBlockTime.from(contestTime.year, contestTime.month, contestTime.day + 1);
	expect(nextDay.hasJacobContest()).toBe(false);

	const nextNextDay = SkyBlockTime.from(contestTime.year, contestTime.month, contestTime.day + 2);
	expect(nextNextDay.hasJacobContest()).toBe(false);

	expect(nextDay.getLastContest().unixSeconds).toBe(contestTime.unixSeconds);
	expect(nextNextDay.getLastContest().unixSeconds).toBe(contestTime.unixSeconds);

	const firstContestOfYear = SkyBlockTime.from(100, 1, 2);
	expect(firstContestOfYear.hasJacobContest()).toBe(true);
	expect(firstContestOfYear.getLastContest().unixSeconds).toBe(firstContestOfYear.unixSeconds);
	
	const beforeFirstContestOfYear = SkyBlockTime.from(100, 1, 1);
	expect(beforeFirstContestOfYear.hasJacobContest()).toBe(false);
	const expected = SkyBlockTime.from(99, 12, 30);
	expect(beforeFirstContestOfYear.getLastContest().unixSeconds).toBe(expected.unixSeconds);
});