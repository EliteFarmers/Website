import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import * as Sentry from '@sentry/sveltekit';
import { consoleLoggingIntegration, contextLinesIntegration, extraErrorDataIntegration } from '@sentry/sveltekit';

const { PUBLIC_SENTRY_DSN, PUBLIC_SENTRY_SAMPLE_RATE } = env;

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	tracesSampleRate: +(PUBLIC_SENTRY_SAMPLE_RATE ?? 0.1),
	enableLogs: true,
	integrations: [consoleLoggingIntegration(), contextLinesIntegration(), extraErrorDataIntegration()],
	environment: dev ? 'development' : 'production',
});
