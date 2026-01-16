import { page } from '$app/state';
import { getPageCtx } from '$lib/hooks/page.svelte';
import { PersistedState } from 'runed';
import { getContext, setContext } from 'svelte';

export interface FavoritedLink {
	href: string;
	name: string;
	icon?: string;
}

export class Favorites {
	#favorites = new PersistedState('elite-favorites', [] as FavoritedLink[]);
	#currentFavorited = $derived.by(() => {
		return this.#favorites.current.some((favorite) => favorite.href === page.url.pathname);
	});
	#override = $state<FavoritedLink | undefined>();
	#pageCtx = getPageCtx();
	currentPage = $derived.by(() => {
		if (this.#override && this.#override.href === page.url.pathname) {
			this.#override.name ||= this.#pageCtx.title;

			return this.#override;
		}

		return {
			href: page.url.pathname,
			name: this.#pageCtx.title,
		};
	});

	constructor() {
		$effect.pre(() => {
			if (this.#override?.href !== page.url.pathname) {
				this.#override = undefined;
			}
		});
	}

	get current() {
		return this.#favorites.current ?? [];
	}

	get favorited() {
		return this.#currentFavorited;
	}

	setPage(favorite: FavoritedLink) {
		this.#override = favorite;
	}

	addFavorite(favorite?: FavoritedLink) {
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

	setFavorites(favorites: FavoritedLink[]) {
		this.#favorites.current = favorites;
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
