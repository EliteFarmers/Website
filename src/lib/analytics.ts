import { browser } from '$app/environment';

type AnalyticsPrimitive = string | number | boolean | bigint | null | undefined;

export type AnalyticsEventData = Record<string, AnalyticsPrimitive>;

type SanitizedAnalyticsEventData = Record<string, string | number | boolean | null>;

function sanitizeAnalyticsData(data?: AnalyticsEventData): SanitizedAnalyticsEventData | undefined {
	if (!data) return undefined;

	const sanitized: SanitizedAnalyticsEventData = {};

	for (const [key, value] of Object.entries(data)) {
		if (value === undefined) continue;
		sanitized[key] = typeof value === 'bigint' ? value.toString() : value;
	}

	return Object.keys(sanitized).length ? sanitized : undefined;
}

export function trackAnalytics(eventName: string, data?: AnalyticsEventData) {
	if (!browser || !window.umami?.track) return;

	try {
		const sanitizedData = sanitizeAnalyticsData(data);
		if (sanitizedData) {
			window.umami.track(eventName, sanitizedData);
			return;
		}
		window.umami.track(eventName);
	} catch (error) {
		console.warn('Failed to track analytics event', eventName, error);
	}
}

export function trackAnalyticsError(eventName: string, data?: AnalyticsEventData) {
	trackAnalytics(eventName, {
		...data,
		error: true,
	});
}
