import { browser } from '$app/environment';
import { replaceState } from '$app/navigation';
import { page } from '$app/state';
import { onMount, untrack } from 'svelte';
import { withToolQuery, type ToolQueryValues } from './query-params';

/** Call during component initialization. URL changes and control edits both update the same instance. */
export function syncToolQuery(
	getUrl: () => URL,
	read: (params: URLSearchParams) => void,
	write: () => ToolQueryValues
): void {
	let routeUrl = getUrl().href;
	const initial = browser ? new URL(window.location.href) : getUrl();
	const pathname = initial.pathname;
	let handledUrl = initial.href;
	untrack(() => read(initial.searchParams));

	function readIncoming(url: URL) {
		if (url.pathname !== pathname || url.href === handledUrl) return;
		handledUrl = url.href;
		untrack(() => read(url.searchParams));
	}

	$effect.pre(() => {
		const url = getUrl();
		if (url.href === routeUrl) return;
		routeUrl = url.href;
		readIncoming(url);
	});

	onMount(() => {
		const restore = () => readIncoming(new URL(window.location.href));
		window.addEventListener('popstate', restore);
		return () => window.removeEventListener('popstate', restore);
	});

	$effect(() => {
		void getUrl();
		const values = write();
		untrack(() => {
			// Shallow replaceState updates the address, but not page.url in this SvelteKit version.
			const current = new URL(window.location.href);
			if (current.pathname !== pathname) return;
			const next = withToolQuery(current, values);
			if (next.href === current.href) return;
			handledUrl = next.href;
			// This absolute URL already includes the current route's base path.
			replaceState(next, page.state);
		});
	});
}
