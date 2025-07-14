import { page } from '$app/state';
import type { components } from '$lib/api/api';
import type { AuthSession } from '$lib/api/auth';
import { PersistedState } from 'runed';
import { getContext, setContext } from 'svelte';

type ConstructorData = {
	user?: components['schemas']['AuthorizedAccountDto'] | null;
	session?: AuthSession | null;
	announcements?: components['schemas']['AnnouncementDto'][];
};

type PersistedData = {
	dismissedAnnouncements: string[];
};

export class GlobalContext {
	#user = $state<components['schemas']['AuthorizedAccountDto'] | undefined>();
	#session = $state<AuthSession | undefined>();
	#authorized = $derived(this.#session !== undefined);
	#data = new PersistedState<PersistedData>('global-data', {
		dismissedAnnouncements: [],
	});
	#announcements = $state<components['schemas']['AnnouncementDto'][]>([]);

	constructor(data: ConstructorData) {
		this.setValues(data);

		$effect(() => {
			this.session = page.data.session as AuthSession | undefined;
		});
	}

	setValues({ user, session, announcements }: ConstructorData) {
		this.#user = user ?? undefined;
		this.#session = session ?? undefined;
		this.#announcements = announcements ?? this.#announcements ?? [];

		this.#data.current = {
			dismissedAnnouncements: user?.dismissedAnnouncements ?? this.data.dismissedAnnouncements,
		};
	}

	get user() {
		return this.#user;
	}

	get session() {
		return this.#session;
	}

	set session(session: AuthSession | undefined) {
		this.#session = session;
		if (this.#user?.id !== session?.id) {
			this.#user = undefined;
		}
	}

	set user(user: components['schemas']['AuthorizedAccountDto'] | undefined | null) {
		this.#user = user ?? undefined;
		if (this.#session?.id !== user?.id) {
			this.#session = undefined;
		}
	}

	get authorized() {
		return this.#authorized;
	}

	get data() {
		return this.#data.current;
	}

	get allAnnouncements() {
		return this.#announcements;
	}

	get announcements() {
		return this.#announcements.filter((a) => !this.data.dismissedAnnouncements.includes(a.id));
	}

	set data(data: PersistedData) {
		this.#data.current = data;
	}

	dismissAnnouncement(id: string) {
		if (!this.#data.current.dismissedAnnouncements.includes(id)) {
			this.#data.current = {
				...this.#data.current,
				dismissedAnnouncements: [...this.#data.current.dismissedAnnouncements, id],
			};
		}
	}
}

export function initGlobalContext(opts: ConstructorData) {
	const existing = getContext<GlobalContext>('global-data');
	if (existing) {
		existing.setValues(opts);
		return existing;
	}

	const data = new GlobalContext(opts);
	setContext('global-data', data);
	return data;
}

export function getGlobalContext() {
	const data = getContext<GlobalContext>('global-data');
	if (!data) {
		throw new Error('Global context not found');
	}
	return data;
}
