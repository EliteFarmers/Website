import { query } from '$app/server';
import { getPostsSidebar } from '$lib/posts';

export const getPosts = query(async () => {
	return getPostsSidebar();
});
