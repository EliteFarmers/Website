import { afterNavigate } from '$app/navigation';
import { page } from '$app/state';
import { PersistedState } from 'runed';
import { getContext, setContext, untrack } from 'svelte';

interface Favorite {
	href: string;
	name: string;
	icon?: string;
}

export class Favorites {
	#favorites = new PersistedState('elite-favorites', [] as Favorite[]);
	#currentFavorited = $derived.by(() => {
		return this.#favorites.current.some((favorite) => favorite.href === page.url.pathname);
	});
	#currentPage = $state<Favorite | undefined>();
	#override = $state<Favorite | undefined>();

	constructor() {
		$effect.root(() => {
			untrack(() => {
				afterNavigate(() => {
					this.#currentPage = {
						href: page.url.pathname,
						name: document.title,
					};

					if (this.#override?.href !== page.url.pathname) {
						this.#override = undefined;
					}
				});
			});
		});
	}

	get current() {
		return this.#favorites.current ?? [];
	}

	get favorited() {
		return this.#currentFavorited;
	}

	get currentPage() {
		return this.#override ?? this.#currentPage;
	}

	setPage(favorite: Favorite) {
		this.#override = favorite;
	}

	addFavorite(favorite?: Favorite) {
		if (!favorite) {
			return;
		}
		this.removeFavorite(favorite.href);
		this.#favorites.current = [...this.current, favorite];
	}

	removeFavorite(href: string) {
		if (this.current.some((favorite) => favorite.href === href)) {
			this.#favorites.current = this.current.filter((favorite) => favorite.href !== href);
			return true;
		}
		return false;
	}
}

export function initFavoritesContext() {
	const existing = getContext<Favorites>('elite-favorites');
	if (existing) {
		return existing;
	}

	const favorites = new Favorites();
	setContext('elite-favorites', favorites);
	return favorites;
}

export function getFavoritesContext() {
	const favorites = getContext<Favorites>('elite-favorites');
	if (!favorites) {
		throw new Error('Favorites context not found');
	}
	return favorites;
}
