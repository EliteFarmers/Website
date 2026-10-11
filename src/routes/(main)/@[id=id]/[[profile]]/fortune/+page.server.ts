import { MissingRatesDataSchema } from '$lib/stores/ratesData';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const data = url.searchParams.get('data');
	if (!data) {
		return {};
	}

	try {
		const string = atob(data ?? '');
		const parsed = JSON.parse(string);
		const result = MissingRatesDataSchema.safeParse(parsed);
		if (!result.success) {
			return { importedSettingsError: 'Failed to import settings!' };
		}
		return { importedSettings: result.data };
	} catch {
		return { importedSettingsError: 'Failed to parse settings!' };
	}
}) satisfies PageServerLoad;
