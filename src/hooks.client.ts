import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry } from '@sentry/sveltekit';

const { PUBLIC_SENTRY_DSN, PUBLIC_SENTRY_SAMPLE_RATE } = env;

if (PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: PUBLIC_SENTRY_DSN,
		tunnel: '/api/s-tunnel',
		tracesSampleRate: +(PUBLIC_SENTRY_SAMPLE_RATE ?? 0.1),
		enableLogs: true,
		environment: dev ? 'development' : 'production',
	});
}

export const handleError = PUBLIC_SENTRY_DSN ? handleErrorWithSentry() : undefined;
