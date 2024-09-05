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

	/**
	 * The year of the SkyBlock time, 1-indexed.
	 */
	declare readonly year: number;
	/**
	 * The month of the SkyBlock time, 1-indexed.
	 */
	declare readonly month: number;
	/**
	 * The day of the SkyBlock time, 1-indexed.
	 */
	declare readonly day: number;
	/**
	 * The Unix timestamp in seconds.
	 */
	declare readonly unixSeconds: number;
	/**
	 * The Unix timestamp in seconds at the start of the day.
	 */
	declare readonly dayUnixSeconds: number;

	/** 
	 * The day of the SkyBlock year, 1-indexed.
	 */
	get dayOfYear() {
		return (this.month - 1) * 31 + this.day;
	}

	/**
	 * Get the name of the month.
	 */
	get monthName() {
		return SkyBlockTime.MonthNames[this.month - 1];
	}

	/**
	 * Get a new SkyBlock time object representing the current time.
	 */
	static get now() {
		return new SkyBlockTime(Date.now());
	}

	/**
	 * Create a SkyBlockTime object from a Unix timestamp in milliseconds.
	 * @param unixMs Unix timestamp in milliseconds
	 */
	constructor(unixMs: number) {
		this.unixSeconds = Math.floor(unixMs / 1000);

		const elapsedSeconds = this.unixSeconds - SkyBlockTime.SkyBlockEpochSeconds;
		const elapsedDays = Math.floor(elapsedSeconds / 1200);

		this.year = Math.floor(elapsedDays / 372) + 1;
		this.month = Math.floor((elapsedDays % 372) / 31) + 1;
		this.day = Math.floor((elapsedDays % 372) % 31) + 1;

		// Round down to the nearest skyblock day
		this.dayUnixSeconds = (elapsedSeconds - (elapsedSeconds % 1200)) + SkyBlockTime.SkyBlockEpochSeconds;
	}
	
	/**
	 * Create a SkyBlockTime object from a skyblock year, month, and day.
	 * These dates shouldbe be 1-indexed. For example, Early Spring the 1st of Year 1 is 1, 1, 1.
	 * @param {number} sbYear SkyBlock year
	 * @param {number} sbMonth SkyBlock month
	 * @param {number} sbDay SkyBlock day
	 * @returns {SkyBlockTime}
	 */
	static from(sbYear: number, sbMonth = 1, sbDay = 1): SkyBlockTime {
		return this.fromZeroIndexed(sbYear - 1, sbMonth - 1, sbDay - 1);
	}

	/**
	 * Create a SkyBlockTime object from a zero indexed skyblock year, month, and day.
	 * These dates shouldbe be 1-indexed. For example, Early Spring the 1st of Year 1 is 0, 0, 0.
	 * @param {number} sbYear SkyBlock year
	 * @param {number} sbMonth SkyBlock month
	 * @param {number} sbDay SkyBlock day
	 * @returns {SkyBlockTime}
	 */
	static fromZeroIndexed(sbYear: number, sbMonth = 0, sbDay = 0): SkyBlockTime {
		const elapsedDays = sbYear * 372 + sbMonth * 31 + sbDay;
		const elapsedSeconds = elapsedDays * 1200;

		return new SkyBlockTime((elapsedSeconds + SkyBlockTime.SkyBlockEpochSeconds) * 1000);
	}

	/**
	 * Convert a contest key from a raw Hypixel API response into a SkyBlockTime object.
	 * @param contestKey A contest key in the format '160:6_30:CROP_ID'
	 * @returns {SkyBlockTime}
	 */
	static fromContestKey(contestKey: string): SkyBlockTime {
		// Contest keys are in this format: '160:6_30:CROP_ID'
		// Year counts from zero, month and day start at 1 (for some reason)
		const [year, monthDay] = contestKey.split(':') ?? [];
		const [month, day] = monthDay?.split('_').map(Number) ?? [];

		return this.fromZeroIndexed(+(year ?? 0), (month ?? 0) - 1, (day ?? 0) - 1);
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

	/**
	 * Check if this SkyBlockTime object has a Jacob Contest event.
	 */
	hasJacobContest() {
		// Contest happens every 3 days, starting on Early Spring 2nd
		return (this.dayOfYear + 1) % 3 === 0;
	}

	/**
	 * Get a new Date object representing this SkyBlockTime object.
	 */
	toDate() {
		return new Date(this.unixSeconds * 1000);
	}

	/**
	 * Get the nearest SkyBlockTime date where a Jacob Contest Event happened.
	 * Always rounds down.
	 * @returns {SkyBlockTime}
	 */
	getLastContest(): SkyBlockTime {
		if (this.hasJacobContest()) {
			return this;
		}

		let time = SkyBlockTime.from(this.year, this.month, this.day);
		while (!time.hasJacobContest()) {
			time = SkyBlockTime.from(time.year, time.month, time.day - 1);
		}

		return time;
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
