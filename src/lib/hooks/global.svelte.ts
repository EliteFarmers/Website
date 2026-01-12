import { page } from '$app/state';
import type { AnnouncementDto, AuthorizedAccountDto, NotificationDto } from '$lib/api';
import type { AuthSession } from '$lib/api/auth';
import { GetNotifications, MarkNotificationRead } from '$lib/remote/notifications.remote';
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
	packs?: { id: string; on: boolean; order: number }[];
};

export class GlobalContext {
	#user = $state<AuthorizedAccountDto | undefined>();
	#session = $state<AuthSession | undefined>();
	#authorized = $derived(this.#session !== undefined);
	#data = new PersistedState<PersistedData>('global-data', {
		dismissedAnnouncements: [],
		settings: {},
		packs: [],
	});
	#announcements = $state<AnnouncementDto[]>([]);
	#notifications = $state<NotificationDto[]>([]);
	#initialized = $state(false);
	#packsParam = $state('');

	constructor(data: ConstructorData) {
		this.setValues(data);

		$effect(() => {
			tick().then(() => {
				if (page.data.session || !page.data.persistSession) {
					this.session = page.data.session as AuthSession | undefined;
				}
				this.#initialized = true;

				if (this.authorized) {
					this.loadNotifications();
				}
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
		if (user) {
			this.loadNotifications();
		}
		if (this.#announcements?.length) {
			// Filter out dismissed announcements that no longer exist
			dismissed = dismissed.filter((id) => this.#announcements.some((a) => a.id === id));
		}

		this.#data.current = {
			dismissedAnnouncements: dismissed,
			settings: user?.settings ?? this.data.settings,
			minecraftAccounts: user?.minecraftAccounts?.map((a) => a.id) ?? this.data.minecraftAccounts,
			packs: this.data.packs ?? [],
		};

		this.updatePacksParam();
	}

	get authorized() {
		return this.#authorized;
	}

	get data() {
		return this.#data.current;
	}

	get packs() {
		return this.data.packs ?? [];
	}

	get packsParam() {
		return this.#packsParam;
	}

	set packs(packs: { id: string; on: boolean; order: number }[]) {
		this.#data.current = {
			...this.#data.current,
			packs,
		};
		this.updatePacksParam();
	}

	updatePacksParam() {
		this.#packsParam = this.packs.length
			? '?packs=' + this.packs.filter((p) => p.on).sort((a, b) => a.order - b.order)[0]?.id
			: '';
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

	get notifications() {
		return this.#notifications;
	}

	get unreadNotificationsCount() {
		return this.#notifications.filter((n) => !n.isRead).length;
	}

	async loadNotifications() {
		if (!this.authorized) return;
		try {
			const data = await GetNotifications({ offset: 0, limit: 100, unreadOnly: false });
			if (data) {
				this.#notifications = data.notifications;
			}
		} catch (e) {
			console.error('Failed to load notifications', e);
		}
	}

	async markNotificationRead(id: bigint | string) {
		const notification = this.#notifications.find((n) => n.id == id);
		if (notification && !notification.isRead) {
			notification.isRead = true;
			try {
				await MarkNotificationRead(id.toString());
			} catch (e) {
				console.error('Failed to mark notification as read', e);
				notification.isRead = false;
			}
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
