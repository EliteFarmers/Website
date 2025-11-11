import { prerender } from '$app/server';
import { fetchCmsData } from '$lib/api/cms';
import { mdToHtml, mdToInline } from '$lib/md';

export const getBusinessInfo = prerender(async () => {
	try {
		const { data } = await fetchCmsData<{ data: { name: string; contact: string; footer: string } }>(
			`/business-info`
		);
		console.log('Fetched business info:', data);

		const result = {
			name: await mdToInline(data.name),
			contact: await mdToHtml(data.contact),
			footer: await mdToInline(data.footer),
		};
		console.log('Processed business info:', result);

		return result;
	} catch (error) {
		console.error('Error fetching business info:', error);
		return { name: '', contact: '', footer: '' };
	}
});
