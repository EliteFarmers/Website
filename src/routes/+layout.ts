import posthog from 'posthog-js';
import { browser } from '$app/environment';
// Access posthog environment variables while keeping them optional
import * as e from '$env/static/public';
const POSTHOG_TOKEN = (e as Record<string, string>).PUBLIC_POSTHOG_TOKEN;
const POSTHOG_UI_HOST = (e as Record<string, string>).PUBLIC_POSTHOG_UI_HOST;

export const load = async ({ data }) => {
	if (browser && POSTHOG_TOKEN && POSTHOG_UI_HOST) {
		posthog.init(POSTHOG_TOKEN, {
			api_host: '/post',
			ui_host: POSTHOG_UI_HOST,
			defaults: '2025-05-24',
			person_profiles: 'identified_only',
			persistence: 'memory',
			bootstrap: {
				distinctID: data.session?.id,
			},
			mask_personal_data_properties: true,
			disable_session_recording: true,
		});
	}

	return;
};
