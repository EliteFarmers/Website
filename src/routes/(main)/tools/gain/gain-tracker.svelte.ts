import { PROPER_CROP_TO_IMG } from '$lib/constants/crops';
import { getProfilesAccount } from '$lib/remote/accounts.remote';
import { nonDefault, readChoice, readText, type ToolQueryValues } from '$lib/tools/query-params';
import { syncToolQuery } from '$lib/tools/query-state.svelte';
import { getCollectionSnapshots, getPlayerGuildData, getSkillSnapshots } from '$lib/remote/graphs.remote';
import { utc } from '@date-fns/utc';
import { CalendarDate, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { onDestroy, untrack } from 'svelte';
import { addHours, fromUnixTime, getUnixTime, startOfDay } from 'date-fns';
import { CROP_TO_PEST, getCropDisplayName, getCropFromName, type Crop } from 'farming-weight';

export const GEXP_PER_HOUR = 9_000;
const GAIN_WINDOW_DAYS = 9;

interface ProfileEntry {
	id: string;
	name: string;
	selected: boolean;
}

interface CollectionSnapshot {
	timestamp: number;
	cropWeight: number;
	crops: Record<string, number>;
	pests: Record<string, number>;
}

interface SkillSnapshot {
	timestamp: number;
	skills: Record<string, number>;
}

interface DayProgress {
	date: number;
	dateLabel: string;
	crops: Record<string, number>;
	pests: Record<string, number>;
	weight: number;
}

interface SkillDayProgress {
	date: number;
	dateLabel: string;
	skills: Record<string, number>;
	totalXp: number;
}

interface UptimeDayProgress {
	date: number;
	dateLabel: string;
	gexp: number;
	hours: number;
}

export class GainTracker {
	loading = $state(false);
	error = $state('');
	playerName = $state('');
	profileName = $state('');
	playerUuid = $state('');
	profileUuid = $state('');
	profiles = $state<ProfileEntry[]>([]);
	activeTab = $state<'crops' | 'skills' | 'uptime'>('crops');

	cropDays = $state<DayProgress[]>([]);
	skillDays = $state<SkillDayProgress[]>([]);
	uptimeDays = $state<UptimeDayProgress[]>([]);
	guildName = $state('');
	guildId = $state('');
	loadedRangeLabel = $state('');
	#dataRequest = 0;
	#lookupRequest = 0;
	#queryRevision = $state(0);
	#requestedPlayer = $state('');
	#requestedProfile = $state('');

	#tz = getLocalTimeZone();
	readonly minDate = new CalendarDate(2023, 7, 1);
	readonly maxStartDate = today(this.#tz).subtract({ days: GAIN_WINDOW_DAYS - 1 });

	selectedStart = $state(this.maxStartDate);

	connect(getUrl: () => URL) {
		syncToolQuery(getUrl, this.readQuery, this.writeQuery);
		$effect(() => {
			void this.#queryRevision;
			untrack(() => {
				if (this.#requestedPlayer) void this.lookupPlayer(this.#requestedPlayer, this.#requestedProfile);
			});
		});
		onDestroy(this.dispose);
	}

	readQuery = (params: URLSearchParams) => {
		this.#clearPlayer();
		this.#requestedPlayer = readText(params, 'player');
		this.#requestedProfile = this.#requestedPlayer ? readText(params, 'profile') : '';
		this.activeTab = readChoice(params, 'tab', ['crops', 'skills', 'uptime'] as const, 'crops');
		this.selectedStart = this.maxStartDate;
		const start = params.get('start');
		if (start && /^\d{4}-\d{2}-\d{2}$/.test(start)) {
			try {
				const date = parseDate(start);
				if (date.compare(this.minDate) >= 0 && date.compare(this.maxStartDate) <= 0) this.selectedStart = date;
			} catch {
				/* Invalid dates use the latest complete window. */
			}
		}
		this.#queryRevision++;
	};

	writeQuery = (): ToolQueryValues => ({
		player: this.playerUuid || this.#requestedPlayer,
		profile: this.profileUuid || this.#requestedProfile,
		start: nonDefault(this.selectedStart.toString(), this.maxStartDate.toString()),
		tab: nonDefault(this.activeTab, 'crops'),
	});

	#clearPlayer() {
		this.#lookupRequest++;
		this.#dataRequest++;
		this.playerUuid = '';
		this.profileUuid = '';
		this.playerName = '';
		this.profileName = '';
		this.profiles = [];
		this.cropDays = [];
		this.skillDays = [];
		this.uptimeDays = [];
		this.guildName = '';
		this.guildId = '';
		this.loadedRangeLabel = '';
		this.error = '';
		this.loading = false;
	}

	lookupPlayer = async (nameOrId: string, requestedProfile = '') => {
		if (!nameOrId.trim()) return;
		this.#clearPlayer();
		const request = this.#lookupRequest;
		this.#requestedPlayer = nameOrId.trim();
		this.#requestedProfile = requestedProfile;
		this.loading = true;
		try {
			const result = await getProfilesAccount({
				id: this.#requestedPlayer,
				profile: requestedProfile || undefined,
			});
			if (request !== this.#lookupRequest) return;
			if ('code' in result) {
				this.error = result.error ?? 'Player not found.';
				return;
			}
			if (!('profile' in result) || !('profiles' in result)) {
				this.error = 'This player has no available SkyBlock profile.';
				return;
			}
			const profiles = result.profiles ?? [];
			const normalized = requestedProfile.replaceAll('-', '').toLowerCase();
			const profile = requestedProfile
				? profiles.find(
						(p) =>
							p.id.replaceAll('-', '').toLowerCase() === normalized ||
							p.name.toLowerCase() === requestedProfile.toLowerCase()
					)
				: profiles.find((p) => p.id === result.profile?.profileId);
			if (!profile) {
				this.error = 'The requested profile was not found for this player.';
				return;
			}
			this.playerName = result.account.name ?? nameOrId;
			this.playerUuid = result.account.id ?? '';
			this.profileUuid = profile.id;
			this.profileName = profile.name;
			this.profiles = profiles;
			await this.fetchData();
		} catch {
			if (request === this.#lookupRequest) this.error = 'Failed to look up player.';
		} finally {
			if (request === this.#lookupRequest) this.loading = false;
		}
	};

	#dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
	#rangeFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	readonly tooltipFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	selectedEnd = $derived(this.selectedStart.add({ days: GAIN_WINDOW_DAYS - 1 }));
	selectedRangeLabel = $derived.by(() =>
		this.#formatDateRange(this.selectedStart.toDate(this.#tz), this.selectedEnd.toDate(this.#tz))
	);
	backDisabled = $derived(this.selectedStart <= this.minDate);
	forwardDisabled = $derived(this.selectedStart >= this.maxStartDate);
	windowDirty = $derived(
		Boolean(this.playerUuid && this.loadedRangeLabel && this.loadedRangeLabel !== this.selectedRangeLabel)
	);

	cropChartData = $derived(this.cropDays.map((day) => ({ date: day.date, label: day.dateLabel, value: day.weight })));
	skillChartData = $derived(
		this.skillDays.map((day) => ({ date: day.date, label: day.dateLabel, value: day.totalXp }))
	);
	uptimeChartData = $derived(
		this.uptimeDays.map((day) => ({ date: day.date, label: day.dateLabel, value: day.hours }))
	);

	totalWeight = $derived(this.cropDays.reduce((sum, day) => sum + day.weight, 0));
	avgWeight = $derived(this.cropDays.length ? this.totalWeight / this.cropDays.length : 0);
	totalXp = $derived(this.skillDays.reduce((sum, day) => sum + day.totalXp, 0));
	avgXp = $derived(this.skillDays.length ? this.totalXp / this.skillDays.length : 0);
	totalGexp = $derived(this.uptimeDays.reduce((sum, day) => sum + day.gexp, 0));
	avgGexp = $derived(this.uptimeDays.length ? this.totalGexp / this.uptimeDays.length : 0);

	fetchData = async () => {
		if (!this.playerUuid || !this.profileUuid) return;
		const requestId = ++this.#dataRequest;
		const requestedPlayerUuid = this.playerUuid;
		const requestedProfileUuid = this.profileUuid;

		const requestedStart = this.selectedStart;
		const requestedEnd = requestedStart.add({ days: GAIN_WINDOW_DAYS - 1 });
		const rangeStartDay = this.#getCalendarDayTimestamp(requestedStart);
		const rangeEndDay = this.#getCalendarDayTimestamp(requestedEnd);

		this.loading = true;
		this.error = '';
		this.guildName = '';
		this.guildId = '';
		this.cropDays = [];
		this.skillDays = [];
		this.uptimeDays = [];

		try {
			const [cropResult, skillResult, guildResult] = await Promise.allSettled([
				getCollectionSnapshots({
					playerUuid: requestedPlayerUuid,
					profileUuid: requestedProfileUuid,
					start: Math.floor(requestedStart.toDate(this.#tz).getTime() / 1000),
					days: GAIN_WINDOW_DAYS,
				}),
				getSkillSnapshots({
					playerUuid: requestedPlayerUuid,
					profileUuid: requestedProfileUuid,
					start: Math.floor(requestedStart.toDate(this.#tz).getTime() / 1000),
					days: GAIN_WINDOW_DAYS,
				}),
				getPlayerGuildData({ playerUuid: requestedPlayerUuid }),
			]);
			if (
				requestId !== this.#dataRequest ||
				this.playerUuid !== requestedPlayerUuid ||
				this.profileUuid !== requestedProfileUuid
			)
				return;
			const failedSections: string[] = [];

			if (cropResult.status === 'fulfilled' && cropResult.value) {
				this.cropDays = this.#processCropData(cropResult.value);
			} else {
				failedSections.push('crop history');
			}

			if (skillResult.status === 'fulfilled' && skillResult.value) {
				this.skillDays = this.#processSkillData(skillResult.value);
			} else {
				failedSections.push('skill history');
			}

			if (guildResult.status === 'fulfilled' && guildResult.value) {
				this.guildName = guildResult.value.guildName ?? '';
				this.guildId = guildResult.value.guildId ?? '';
				if (guildResult.value.expHistory) {
					this.uptimeDays = this.#processUptimeData(guildResult.value.expHistory, rangeStartDay, rangeEndDay);
				}
			} else {
				failedSections.push('guild history');
			}

			this.loadedRangeLabel = this.#formatDateRange(
				requestedStart.toDate(this.#tz),
				requestedEnd.toDate(this.#tz)
			);
			if (failedSections.length === 3) {
				this.error = 'Gain history is unavailable right now. Please try again.';
			} else if (failedSections.length > 0) {
				this.error = `Loaded partial results. Could not load ${failedSections.join(', ')}.`;
			}
		} catch {
			if (requestId !== this.#dataRequest) return;
			this.error = 'Failed to fetch gain data.';
		} finally {
			if (requestId === this.#dataRequest) this.loading = false;
		}
	};

	previousWindow = () => {
		if (this.selectedStart <= this.minDate) return;
		const nextStart = this.selectedStart.subtract({ days: GAIN_WINDOW_DAYS });
		this.selectedStart = nextStart < this.minDate ? this.minDate : nextStart;
	};

	nextWindow = () => {
		if (this.selectedStart >= this.maxStartDate) return;
		const nextStart = this.selectedStart.add({ days: GAIN_WINDOW_DAYS });
		this.selectedStart = nextStart > this.maxStartDate ? this.maxStartDate : nextStart;
	};

	#processCropData(collections: CollectionSnapshot[]): DayProgress[] {
		const dataPoints = [...collections].sort((a, b) => +(a.timestamp ?? 0) - +(b.timestamp ?? 0));
		const days: DayProgress[] = [];

		for (let i = 0; i < dataPoints.length; i++) {
			const point = dataPoints[i];
			const lastPoint = dataPoints.at(i + 1) ?? point;
			const cropGains = this.#calculateGains(lastPoint.crops, point.crops);
			const pestGains = this.#calculateGains(lastPoint.pests, point.pests);
			const date = this.#getDateFromTimestamp(lastPoint.timestamp);

			days.push({
				date,
				dateLabel: this.#dateFormatter.format(new Date(date * 1000)),
				crops: cropGains,
				pests: pestGains,
				weight: +(lastPoint.cropWeight ?? 0) - +(point.cropWeight ?? 0),
			});
		}

		return this.#trimDays(days, (day) => Object.values(day.crops).every((crop) => crop === 0));
	}

	#processSkillData(skills: SkillSnapshot[]): SkillDayProgress[] {
		const dataPoints = [...skills].sort((a, b) => +(a.timestamp ?? 0) - +(b.timestamp ?? 0));
		const days: SkillDayProgress[] = [];

		for (let i = 0; i < dataPoints.length; i++) {
			const point = dataPoints[i];
			const lastPoint = dataPoints.at(i + 1) ?? point;
			const skillGains = this.#calculateGains(lastPoint.skills, point.skills);
			const totalXp = Object.values(skillGains).reduce((sum, value) => sum + Math.max(0, value), 0);
			const date = this.#getDateFromTimestamp(lastPoint.timestamp);

			days.push({
				date,
				dateLabel: this.#dateFormatter.format(new Date(date * 1000)),
				skills: skillGains,
				totalXp,
			});
		}

		return this.#trimDays(days, (day) => Object.values(day.skills).every((skill) => skill === 0));
	}

	#processUptimeData(expHistory: Record<string, number>, startDay: number, endDay: number): UptimeDayProgress[] {
		return Object.entries(expHistory)
			.map(([dateStr, gexp]) => {
				const date = this.#parseGuildExpHistoryDate(dateStr);
				if (date === null) return null;
				return {
					date,
					dateLabel: this.#dateFormatter.format(new Date(date * 1000)),
					gexp,
					hours: gexp / GEXP_PER_HOUR,
				};
			})
			.filter((day): day is UptimeDayProgress => day !== null && day.date >= startDay && day.date <= endDay)
			.sort((a, b) => a.date - b.date)
			.slice(-GAIN_WINDOW_DAYS);
	}

	#getDateFromTimestamp(timestamp: number | undefined): number {
		return getUnixTime(addHours(startOfDay(fromUnixTime(timestamp ?? 0, { in: utc }), { in: utc }), 12));
	}

	#calculateGains(
		current: Record<string, number> | undefined,
		previous: Record<string, number> | undefined
	): Record<string, number> {
		return Object.entries(current ?? {}).reduce<Record<string, number>>((gains, [key, value]) => {
			gains[key] = value - (previous?.[key] ?? 0);
			return gains;
		}, {});
	}

	#trimDays<T>(days: T[], isEmpty: (day: T) => boolean): T[] {
		const trimmed = [...days];
		if (trimmed.length > 1 && isEmpty(trimmed.at(-1) as T)) {
			trimmed.pop();
		}
		while (trimmed.length > GAIN_WINDOW_DAYS) {
			trimmed.shift();
		}
		return trimmed;
	}

	#formatDateRange(start: Date, end: Date): string {
		return `${this.#rangeFormatter.format(start)} - ${this.#rangeFormatter.format(end)}`;
	}

	#getCalendarDayTimestamp(date: CalendarDate): number {
		return Math.floor(Date.UTC(date.year, date.month - 1, date.day, 12) / 1000);
	}

	#parseGuildExpHistoryDate(dateStr: string): number | null {
		const numericParts = dateStr
			.split(/\D+/)
			.filter(Boolean)
			.map((part) => Number(part));

		if (numericParts.length >= 3) {
			const [first, second, third] = numericParts;
			if (first >= 1900) {
				return Math.floor(Date.UTC(first, second - 1, third, 12) / 1000);
			}
			if (third >= 1900) {
				return Math.floor(Date.UTC(third, first - 1, second, 12) / 1000);
			}
		}

		const parsed = Date.parse(dateStr);
		if (Number.isNaN(parsed)) return null;

		const date = new Date(parsed);
		return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12) / 1000);
	}

	formatCompact(num: number): string {
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
		if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
		return num.toFixed(0);
	}

	formatHours(hours: number): string {
		const wholeHours = Math.floor(hours);
		const minutes = Math.round((hours - wholeHours) * 60);
		return `${wholeHours}h ${minutes}m`;
	}

	allCrops(crops: Record<string, number>): { name: string; amount: number; img?: string }[] {
		return Object.entries(crops)
			.filter(([, amount]) => amount > 0)
			.sort((a, b) => b[1] - a[1])
			.map(([key, amount]) => {
				const crop = getCropFromName(key);
				const name = crop ? getCropDisplayName(crop) : key;
				return { name, amount, img: PROPER_CROP_TO_IMG[name] };
			});
	}

	allPests(pests: Record<string, number>): { name: string; amount: number; cropName: string }[] {
		return Object.entries(pests)
			.filter(([, amount]) => amount > 0)
			.sort((a, b) => b[1] - a[1])
			.map(([key, amount]) => {
				const cropEntry = Object.entries(CROP_TO_PEST).find(
					([, pest]) => String(pest).toLowerCase() === key.toLowerCase()
				);
				const cropName = cropEntry
					? getCropDisplayName(cropEntry[0] as Crop)
					: key.charAt(0).toUpperCase() + key.slice(1);
				return { name: key.charAt(0).toUpperCase() + key.slice(1), amount, cropName };
			});
	}

	topCrops(crops: Record<string, number>, limit = 3): { name: string; amount: number; img?: string }[] {
		return this.allCrops(crops).slice(0, limit);
	}

	allSkills(skills: Record<string, number>): { name: string; amount: number }[] {
		return Object.entries(skills)
			.filter(([, amount]) => amount > 0)
			.sort((a, b) => b[1] - a[1])
			.map(([key, amount]) => ({
				name: key.charAt(0).toUpperCase() + key.slice(1),
				amount,
			}));
	}

	topSkills(skills: Record<string, number>, limit = 3): { name: string; amount: number }[] {
		return this.allSkills(skills).slice(0, limit);
	}

	dispose = () => {
		this.#dataRequest++;
		this.#lookupRequest++;
	};
}
