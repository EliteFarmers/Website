export class SkyBlockTime {
	static readonly SkyBlockEpochSeconds = 1560275700;
	static readonly MonthNames = [
		'Early Spring',
		'Spring',
		'Late Spring',
		'Early Summer',
		'Summer',
		'Late Summer',
		'Early Autumn',
		'Autumn',
		'Late Autumn',
		'Early Winter',
		'Winter',
		'Late Winter',
	] as const;

	declare readonly year: number;
	declare readonly month: number;
	declare readonly day: number;
	declare readonly unixSeconds: number;

	static get now() {
		return new SkyBlockTime(Date.now());
	}

	constructor(unixMs: number) {
		this.unixSeconds = Math.floor(unixMs / 1000);

		const elapsedSeconds = this.unixSeconds - SkyBlockTime.SkyBlockEpochSeconds;
		const elapsedDays = Math.floor(elapsedSeconds / 1200);

		this.year = Math.floor(elapsedDays / 372) + 1;
		this.month = Math.floor((elapsedDays % 372) / 31) + 1;
		this.day = Math.floor((elapsedDays % 372) % 31) + 1;
	}

	static from(sbYear: number, sbMonth = 1, sbDay = 1) {
		return this.fromZeroIndexed(sbYear - 1, sbMonth - 1, sbDay - 1);
	}

	static fromZeroIndexed(sbYear: number, sbMonth = 0, sbDay = 0) {
		const elapsedDays = sbYear * 372 + sbMonth * 31 + sbDay;
		const elapsedSeconds = elapsedDays * 1200;

		return new SkyBlockTime((elapsedSeconds + SkyBlockTime.SkyBlockEpochSeconds) * 1000);
	}

	get monthName() {
		return SkyBlockTime.MonthNames[this.month - 1];
	}

	isSpring() {
		return this.month > 0 && this.month < 4;
	}

	isSummer() {
		return this.month > 3 && this.month < 7;
	}

	isAutumn() {
		return this.month > 6 && this.month < 10;
	}

	isWinter() {
		return this.month > 9 && this.month < 13;
	}

	toString() {
		return `${this.monthName} ${appendOrdinalSuffix(this.day)}, Year ${this.year}`;
	}
}

function appendOrdinalSuffix(number: number) {
	const j = number % 10;
	const k = number % 100;

	if (j == 1 && k != 11) return `${number}st`;
	if (j == 2 && k != 12) return `${number}nd`;
	if (j == 3 && k != 13) return `${number}rd`;

	return `${number}th`;
}
