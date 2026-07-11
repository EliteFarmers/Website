import { page } from '$app/state';
import type {
	AnnouncementDto,
	AuthorizedAccountDto,
	EntitlementDto,
	NotificationDto,
	PendingGiftDto,
	ResourcePackDto,
} from '$lib/api';
import type { AuthSession } from '$lib/api/auth';
import { getAuthorizedAccount } from '$lib/remote';
import { ClaimGift, DeclineGift, GetPendingGifts } from '$lib/remote/gifts.remote';
import { GetNotifications, MarkNotificationRead } from '$lib/remote/notifications.remote';
import type { LocalTexturePackOverride } from '$lib/texture-packs';
import type { RemoteQuery } from '@sveltejs/kit';
import { PersistedState } from 'runed';
import { getContext, setContext, tick } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

type ConstructorData = {
	user?: AuthorizedAccountDto | null;
	session?: AuthSession | null;
	announcements?: AnnouncementDto[];
	texturePacks?: ResourcePackDto[] | null;
};

type PersistedData = {
	dismissedAnnouncements: string[];
	settings: AuthorizedAccountDto['settings'];
	minecraftAccounts?: string[];
	packs?: { id: string; on: boolean; order: number }[];
	localTexturePackOverrides?: LocalTexturePackOverride[];
	newSidebar?: Record<string, number>;
	packPreferenceVersion?: number;
};

type PackPreference = { id: string; on: boolean; order: number };
const PACK_PREFERENCE_VERSION = 1;

export class GlobalContext {
	#user = $state<AuthorizedAccountDto | undefined>();
	#session = $state<AuthSession | undefined>();
	#authorized = $derived(this.#session !== undefined);
	#data = new PersistedState<PersistedData>('global-data', {
		dismissedAnnouncements: [],
		settings: {},
		packs: [],
		localTexturePackOverrides: [],
		newSidebar: {},
		packPreferenceVersion: 0,
	});
	#announcements = $state<AnnouncementDto[]>([]);
	#notifications = $state<NotificationDto[]>([]);
	#pendingGifts = $state<PendingGiftDto[]>([]);
	#initialized = $state(false);
	#packsParam = $state('');
	#packVersions = new SvelteMap<string, string>();
	#userQuery = $state<RemoteQuery<AuthorizedAccountDto | undefined>>();
	#accesses = $derived.by(() =>
		(this.#user?.entitlements ?? []).reduce(
			(acc, e) => {
				acc[e.productId] = e;
				return acc;
			},
			{} as Record<string, EntitlementDto>
		)
	);

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
					this.loadPendingGifts();
					this.loadUser();
				}
			});
		});
	}

	setValues({ user, session, announcements, texturePacks }: ConstructorData) {
		this.#session = session ?? undefined;
		if (user !== undefined) {
			this.user = user;
		}
		this.#announcements = announcements ?? this.#announcements ?? [];
		if (texturePacks) {
			this.#packVersions = new SvelteMap<string, string>(texturePacks.map((pack) => [pack.id, pack.version]));
		}
		this.dropUnavailablePacks(texturePacks);
		this.applyDefaultPacks(texturePacks);
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
			this.loadPendingGifts();
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
			localTexturePackOverrides: this.data.localTexturePackOverrides ?? [],
			newSidebar: this.data.newSidebar ?? {},
			packPreferenceVersion: this.data.packPreferenceVersion ?? 0,
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

	get localTexturePackOverrides() {
		return this.data.localTexturePackOverrides ?? [];
	}

	get enabledPackIds() {
		return this.packs
			.filter((p) => p.on && p.id !== 'vanilla')
			.sort((a, b) => a.order - b.order)
			.map((p) => p.id);
	}

	get packsParam() {
		return this.#packsParam;
	}

	set packs(packs: { id: string; on: boolean; order: number }[]) {
		this.#data.current = {
			...this.#data.current,
			packs: normalizePackPreferences(packs),
		};
		this.updatePacksParam();
	}

	set localTexturePackOverrides(localTexturePackOverrides: LocalTexturePackOverride[]) {
		this.#data.current = {
			...this.#data.current,
			localTexturePackOverrides,
		};
	}

	updatePacksParam() {
		const packIds = this.enabledPackIds;
		if (!packIds.length) {
			this.#packsParam = '';
			return;
		}

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const params = new URLSearchParams({ packs: packIds.join(',') });
		const versions = packIds.map((id) => this.#packVersions.get(id)).filter((version) => version !== undefined);
		if (versions.length) params.set('v', versions.join(','));
		this.#packsParam = `?${params.toString()}`;
	}

	hasPackEnabled(packId: string) {
		return this.packs.some((pack) => pack.id === packId && pack.on);
	}

	hasLocalTexturePackOverride(packId: string) {
		return this.localTexturePackOverrides.some((pack) => pack.id === packId);
	}

	upsertLocalTexturePackOverride(pack: LocalTexturePackOverride, enable = false) {
		this.localTexturePackOverrides = [
			...this.localTexturePackOverrides.filter((existingPack) => existingPack.id !== pack.id),
			pack,
		];

		if (enable) {
			this.enablePack(pack.id);
		}
	}

	enablePack(packId: string) {
		const remaining = this.packs.filter((pack) => pack.id !== packId);

		this.packs = [
			{
				id: packId,
				on: true,
				order: 0,
			},
			...remaining.map((pack, index) => ({
				id: pack.id,
				on: pack.on,
				order: index + 1,
			})),
		];
	}

	removeLocalTexturePackOverride(packId: string) {
		this.localTexturePackOverrides = this.localTexturePackOverrides.filter((pack) => pack.id !== packId);
		this.packs = this.packs.filter((pack) => pack.id !== packId);
	}

	dropUnavailablePacks(texturePacks: Pick<ResourcePackDto, 'id'>[] | null | undefined) {
		if (!texturePacks?.length) return;

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const availablePackIds = new Set(texturePacks.map((pack) => pack.id));
		for (const pack of this.localTexturePackOverrides) {
			availablePackIds.add(pack.id);
		}

		const packs = this.packs.filter((pack) => availablePackIds.has(pack.id));
		if (packs.length === this.packs.length) {
			this.updatePacksParam();
			return;
		}

		this.packs = packs;
	}

	applyDefaultPacks(texturePacks: ResourcePackDto[] | null | undefined) {
		if (!texturePacks?.length || (this.data.packPreferenceVersion ?? 0) >= PACK_PREFERENCE_VERSION) return;

		const defaultPack = texturePacks.find((pack) => pack.id === 'hypixel' && pack.defaultEnabled);
		if (!defaultPack) return;

		this.packs = [{ id: defaultPack.id, on: true, order: 0 }];
		this.#data.current = {
			...this.#data.current,
			packPreferenceVersion: PACK_PREFERENCE_VERSION,
		};
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

	get pendingGifts() {
		return this.#pendingGifts;
	}

	get hasPendingGifts() {
		return this.#pendingGifts.length > 0;
	}

	async loadPendingGifts() {
		if (!this.authorized) return;
		try {
			const data = await GetPendingGifts();
			if (data) {
				this.#pendingGifts = data;
			}
		} catch (e) {
			console.error('Failed to load pending gifts', e);
		}
	}

	async claimGift(orderId: string, orderItemIds?: string[]) {
		const result = await ClaimGift({ orderId, orderItemIds });

		// Always refresh pending gifts after a claim attempt to get accurate state
		await this.loadPendingGifts();

		return result;
	}

	async declineGift(orderId: string, orderItemIds?: string[]) {
		const result = await DeclineGift({ orderId, orderItemIds });

		// Always refresh pending gifts after a decline attempt to get accurate state
		await this.loadPendingGifts();

		return result;
	}

	ownsAccount(uuid: string) {
		return this.data?.minecraftAccounts?.some((a) => a === uuid);
	}

	seenSidebarItem(key: string, expiresAt: number) {
		return (this.data?.newSidebar?.[key] || 0) >= expiresAt;
	}

	markSidebarItemSeen(key: string, expiresAt: number) {
		this.#data.current = {
			...this.#data.current,
			newSidebar: {
				...this.#data.current.newSidebar,
				[key]: expiresAt,
			},
		};
	}

	get accesses() {
		return this.#accesses;
	}

	ownsProduct(productId: string) {
		return !!this.#accesses[productId];
	}

	async loadUser() {
		if (!this.session?.id || this.session.id === this.user?.id) return;

		this.#userQuery = getAuthorizedAccount();
		this.user = await this.#userQuery;
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

function normalizePackPreferences(packs: PackPreference[]) {
	const enabled = packs
		.filter((pack) => pack.on)
		.sort((a, b) => a.order - b.order)
		.map((pack) => ({
			id: pack.id,
			on: true,
			order: 0,
		}));
	const disabled = packs
		.filter((pack) => !pack.on)
		.sort((a, b) => a.order - b.order)
		.map((pack) => ({
			id: pack.id,
			on: false,
			order: 0,
		}));

	return [...enabled, ...disabled].map((pack, order) => ({
		...pack,
		order,
	}));
}
