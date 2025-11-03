import { getPost } from '$lib/posts';
import type { EntryGenerator, PageLoad } from './$types';

// export const prerender = true;

export const entries: EntryGenerator = async () => {
	const modules = import.meta.glob('/src/posts/**/*.md');
	const entries = [];

	for (const path of Object.keys(modules)) {
		const slug = path.replace('/src/posts/', '').replace('.md', '').replace('/index', '');
		entries.push({ slug });
	}

	return entries;
};

export const load: PageLoad = async ({ params }) => {
	const doc = await getPost(params.slug || 'index');
	return { ...doc, viewerData: null };
};
