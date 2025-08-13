import { page } from '$app/state';
import type { AnnouncementDto, AuthorizedAccountDto } from '$lib/api';
import type { AuthSession } from '$lib/api/auth';
import { PersistedState } from 'runed';
import { getContext, setContext, tick } from 'svelte';

type ConstructorData = {
	user?: AuthorizedAccountDto | null;
	session?: AuthSession | null;
	announcements?: AnnouncementDto[];
};

type PersistedData = {
	dismissedAnnouncements: string[];
	settings: AuthorizedAccountDto['settings'];
	minecraftAccounts?: string[];
};

export class GlobalContext {
	#user = $state<AuthorizedAccountDto | undefined>();
	#session = $state<AuthSession | undefined>();
	#authorized = $derived(this.#session !== undefined);
	#data = new PersistedState<PersistedData>('global-data', {
		dismissedAnnouncements: [],
		settings: {},
	});
	#announcements = $state<AnnouncementDto[]>([]);
	#initialized = $state(false);

	constructor(data: ConstructorData) {
		this.setValues(data);

		$effect(() => {
			this.session = page.data.session as AuthSession | undefined;
			tick().then(() => {
				this.#initialized = true;
			});
		});
	}

	setValues({ user, session, announcements }: ConstructorData) {
		this.#session = session ?? undefined;
		this.user = user;
		this.#announcements = announcements ?? this.#announcements ?? [];
	}

	get initialized() {
		return this.#initialized;
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

	set user(user: AuthorizedAccountDto | undefined | null) {
		this.#user = user ?? undefined;

		if (this.#session?.id !== user?.id) {
			this.#session = undefined;
		}

		let dismissed = user?.dismissedAnnouncements ?? this.data.dismissedAnnouncements;
		if (this.#announcements?.length) {
			// Filter out dismissed announcements that no longer exist
			dismissed = dismissed.filter((id) => this.#announcements.some((a) => a.id === id));
		}

		this.#data.current = {
			dismissedAnnouncements: dismissed,
			settings: user?.settings ?? this.data.settings,
			minecraftAccounts: user?.minecraftAccounts?.map((a) => a.id) ?? this.data.minecraftAccounts,
		};
	}

	get authorized() {
		return this.#authorized;
	}

	get data() {
		return this.#data.current;
	}

	get allAnnouncements() {
		return this.initialized ? this.#announcements : [];
	}

	get announcements() {
		return this.initialized
			? this.#announcements.filter((a) => !this.data.dismissedAnnouncements.includes(a.id))
			: [];
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

			fetch('/api/dismiss/' + id);
		}
	}

	ownsAccount(uuid: string) {
		return this.data?.minecraftAccounts?.some((a) => a === uuid);
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
