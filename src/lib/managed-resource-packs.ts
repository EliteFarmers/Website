import type { BadgeVariant } from '$ui/badge';

export function formatManagedPackDate(value?: string | null) {
	if (!value) return '-';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(date);
}

export function formatManagedPackBytes(bytes?: bigint | number | null) {
	if (bytes === null || bytes === undefined) return '-';

	const numeric = typeof bytes === 'bigint' ? Number(bytes) : bytes;
	if (!Number.isFinite(numeric) || numeric < 0) return '-';

	if (numeric < 1024) {
		return `${Math.round(numeric)} B`;
	}

	const units = ['KB', 'MB', 'GB', 'TB'];
	let value = numeric;
	let unitIndex = -1;

	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}

	return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function humanizeManagedPackValue(value?: string | null) {
	if (!value) return 'Unknown';

	return value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getManagedPackStatusVariant(status?: string | null): BadgeVariant {
	const normalized = status?.trim().toLowerCase() ?? '';

	if (!normalized) return 'outline';
	if (normalized.includes('live') || normalized.includes('approved')) return 'default';
	if (normalized.includes('pending')) return 'secondary';
	if (normalized.includes('reject') || normalized.includes('fail')) return 'destructive';
	return 'outline';
}

export function getManagedPackValidationVariant(validationSucceeded?: boolean | null): BadgeVariant {
	if (validationSucceeded === true) return 'default';
	if (validationSucceeded === false) return 'destructive';
	return 'outline';
}

export function formatManagedPackCountdown(ms: number) {
	if (ms <= 0) return '0s';

	const totalSeconds = Math.ceil(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	if (minutes <= 0) return `${seconds}s`;
	return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}
