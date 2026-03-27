import { browser } from '$app/environment';
import type {
	CreateTebexCheckoutRequest,
	CreateTebexCheckoutRequestRecipient,
	TebexCurrentCheckoutDto,
} from '$lib/api';
import { getGlobalContext, GlobalContext } from '$lib/hooks/global.svelte';
import Tebex from '@tebexio/tebex.js';
import { createContext } from 'svelte';
import { toast } from 'svelte-sonner';
import { createCheckout, deleteCheckout, getCurrentCheckout, updateCheckout } from './checkout.remote';
import { getTebexThemeConfig } from './theme';

type TebexCheckoutResultStatus = 'idle' | 'open' | 'success' | 'error';

type TebexCheckoutResultState = {
	status: TebexCheckoutResultStatus;
	lastEventAt: number | null;
	hasClosedSinceResult: boolean;
};

export class TebexContext {
	#tebex = $state<typeof Tebex | null>(null);
	#gbl: GlobalContext;
	#currentCheckoutQuery = $state<ReturnType<typeof getCurrentCheckout> | null>(browser ? getCurrentCheckout() : null);
	#initializedCurrentCheckout = $state(false);
	#pendingProductActions = $state<Record<string, 'adding' | 'removing'>>({});
	#updatingRecipient = $state(false);
	#deletingCheckoutOrderId = $state<string | null>(null);
	#checkoutResult = $state<TebexCheckoutResultState>({
		status: 'idle',
		lastEventAt: null,
		hasClosedSinceResult: false,
	});
	#checkoutEventUnsubscribers: Array<() => void> = [];

	constructor(tebex?: typeof Tebex) {
		this.#tebex = tebex ?? null;
		this.#gbl = getGlobalContext();

		$effect(() => {
			const authorized = this.#gbl.authorized;
			const sessionId = this.#gbl.session?.id;

			if (!authorized || !sessionId) {
				this.#currentCheckoutQuery?.set(null);
				this.#initializedCurrentCheckout = true;
				this.#pendingProductActions = {};
				this.#updatingRecipient = false;
				this.resetCheckoutResult();
				return;
			}

			this.refreshCurrentCheckout();
		});
	}

	get currentCheckout() {
		return this.#currentCheckoutQuery?.current ?? null;
	}

	get loadingCurrentCheckout() {
		return this.#currentCheckoutQuery?.loading ?? false;
	}

	get initializedCurrentCheckout() {
		return this.#initializedCurrentCheckout;
	}

	get checkoutResult() {
		return this.#checkoutResult;
	}

	get updatingRecipient() {
		return this.#updatingRecipient;
	}

	get pendingProductActions() {
		return this.#pendingProductActions;
	}

	getProductAction(productId: string) {
		return this.#pendingProductActions[productId] ?? null;
	}

	get isMutatingCheckout() {
		return (
			Object.keys(this.#pendingProductActions).length > 0 ||
			this.#updatingRecipient ||
			Boolean(this.#deletingCheckoutOrderId)
		);
	}

	resetCheckoutResult() {
		this.#checkoutResult = {
			status: 'idle',
			lastEventAt: null,
			hasClosedSinceResult: false,
		};
	}

	async refreshCurrentCheckout() {
		const currentCheckoutQuery = this.#ensureCurrentCheckoutQuery();

		if (!this.#gbl.authorized) {
			currentCheckoutQuery?.set(null);
			this.#initializedCurrentCheckout = true;
			return null;
		}

		try {
			await currentCheckoutQuery?.refresh();
			return currentCheckoutQuery?.current ?? null;
		} catch (error) {
			console.error('Failed to load current Tebex checkout', error);
			currentCheckoutQuery?.set(null);
			return null;
		} finally {
			this.#initializedCurrentCheckout = true;
		}
	}

	async addToBasket(productId: string, options?: { recipient?: string | null }) {
		if (this.#gbl.authorized && !this.#initializedCurrentCheckout && !this.loadingCurrentCheckout) {
			await this.refreshCurrentCheckout();
		}

		const currentCheckoutQuery = this.#ensureCurrentCheckoutQuery();
		const existingCheckout = currentCheckoutQuery?.current ?? null;
		const productInCurrentCheckout = existingCheckout?.checkoutRequest.items.some(
			(item) => item.productId === productId
		);

		if (!currentCheckoutQuery || productInCurrentCheckout || this.getProductAction(productId)) {
			return;
		}

		this.resetCheckoutResult();
		this.#setProductAction(productId, 'adding');

		try {
			let result: { error?: string } | undefined;
			const optimisticCheckout = currentCheckoutQuery.withOverride((current) =>
				this.#buildOptimisticCheckout(current, productId, 'add', options?.recipient)
			);

			if (existingCheckout?.canMutate) {
				result = await updateCheckout({
					orderId: existingCheckout.orderId,
					body: this.#buildCheckoutRequest(existingCheckout.checkoutRequest, productId, options?.recipient),
				}).updates(optimisticCheckout);
			} else {
				result = await createCheckout({
					items: [{ productId, quantity: 1 }],
					recipient: options?.recipient
						? { mode: 'GiftUser', playerUuidOrIgn: options.recipient }
						: undefined,
				}).updates(optimisticCheckout);
			}

			if (result?.error) {
				toast.error(result.error);
				return;
			}
		} catch (error) {
			console.error('Failed to add product to basket', error);
			toast.error('Failed to update your basket');
		} finally {
			this.#initializedCurrentCheckout = true;
			this.#clearProductAction(productId);
		}
	}

	async removeFromCheckout(productId: string) {
		const currentCheckoutQuery = this.#ensureCurrentCheckoutQuery();
		const existingCheckout = currentCheckoutQuery?.current ?? null;
		if (!existingCheckout?.canMutate || !currentCheckoutQuery || this.getProductAction(productId)) return;

		const items = existingCheckout.checkoutRequest.items.filter((item) => item.productId !== productId);

		this.resetCheckoutResult();
		this.#setProductAction(productId, 'removing');

		try {
			if (!items.length) {
				if (this.#deletingCheckoutOrderId === existingCheckout.orderId) {
					return;
				}

				this.#deletingCheckoutOrderId = existingCheckout.orderId;

				const result = await deleteCheckout({
					orderId: existingCheckout.orderId,
				}).updates(currentCheckoutQuery.withOverride(() => null));

				if (result?.error) {
					if (result.error === 'Only unpaid tebex orders can be deleted') {
						await this.refreshCurrentCheckout();
						if (!this.currentCheckout?.canMutate) {
							return;
						}
					}

					toast.error(result.error);
				}

				return;
			}

			const result = await updateCheckout({
				orderId: existingCheckout.orderId,
				body: {
					...existingCheckout.checkoutRequest,
					items,
				},
			}).updates(
				currentCheckoutQuery.withOverride((current) =>
					this.#buildOptimisticCheckout(current, productId, 'remove')
				)
			);

			if (result?.error) {
				toast.error(result.error);
				return;
			}
		} catch (error) {
			console.error('Failed to remove product from basket', error);
			toast.error('Failed to update your basket');
		} finally {
			if (this.#deletingCheckoutOrderId === existingCheckout.orderId) {
				this.#deletingCheckoutOrderId = null;
			}
			this.#clearProductAction(productId);
		}
	}

	async setRecipient(playerUuidOrIgn: string | null) {
		const currentCheckoutQuery = this.#ensureCurrentCheckoutQuery();
		const existingCheckout = currentCheckoutQuery?.current ?? null;
		if (!existingCheckout?.canMutate || !currentCheckoutQuery) return false;
		const nextRecipient: CreateTebexCheckoutRequestRecipient = playerUuidOrIgn
			? { mode: 'GiftUser', playerUuidOrIgn }
			: { mode: 'Self' };

		this.resetCheckoutResult();
		this.#updatingRecipient = true;

		try {
			const result = await updateCheckout({
				orderId: existingCheckout.orderId,
				body: {
					...existingCheckout.checkoutRequest,
					recipient: nextRecipient,
				},
			}).updates(
				currentCheckoutQuery.withOverride((current) =>
					current
						? {
								...current,
								checkoutRequest: {
									...current.checkoutRequest,
									recipient: nextRecipient,
								},
							}
						: current
				)
			);

			if (result?.error) {
				toast.error(result.error);
				return false;
			}

			if (result?.data) {
				const currentCheckout = currentCheckoutQuery.current ?? existingCheckout;
				currentCheckoutQuery.set(
					currentCheckout
						? {
								...currentCheckout,
								...result.data,
								checkoutRequest: {
									...currentCheckout.checkoutRequest,
									recipient: nextRecipient,
								},
							}
						: null
				);
			} else {
				await this.refreshCurrentCheckout();
			}

			return true;
		} catch (error) {
			console.error('Failed to update checkout recipient', error);
			toast.error('Failed to update the gift recipient');
			return false;
		} finally {
			this.#updatingRecipient = false;
		}
	}

	#buildCheckoutRequest(
		currentRequest: CreateTebexCheckoutRequest,
		productId: string,
		recipient?: string | null
	): CreateTebexCheckoutRequest {
		const items = [...currentRequest.items];

		if (!items.some((item) => item.productId === productId)) {
			items.push({ productId, quantity: 1 });
		}

		return {
			...currentRequest,
			items,
			recipient: recipient ? { mode: 'GiftUser', playerUuidOrIgn: recipient } : currentRequest.recipient,
		};
	}

	#buildOptimisticCheckout(
		currentCheckout: TebexCurrentCheckoutDto | null | undefined,
		productId: string,
		action: 'add' | 'remove',
		recipient?: string | null
	): TebexCurrentCheckoutDto | null {
		if (action === 'remove') {
			const items = currentCheckout?.checkoutRequest.items.filter((item) => item.productId !== productId) ?? [];
			if (!items.length) {
				return null;
			}

			return currentCheckout
				? {
						...currentCheckout,
						totalPrice: null,
						checkoutRequest: {
							...currentCheckout.checkoutRequest,
							items,
						},
					}
				: null;
		}

		if (!currentCheckout) {
			return {
				orderId: 'pending',
				provider: 'tebex',
				status: 'pending',
				providerStatus: null,
				checkoutIdent: null,
				checkoutUrl: null,
				authUrl: null,
				currency: null,
				totalPrice: null,
				expiresAt: null,
				paymentStarted: false,
				canMutate: false,
				checkoutRequest: {
					items: [{ productId, quantity: 1 }],
					recipient: recipient ? { mode: 'GiftUser', playerUuidOrIgn: recipient } : undefined,
				},
			};
		}

		return {
			...currentCheckout,
			totalPrice: null,
			checkoutRequest: this.#buildCheckoutRequest(currentCheckout.checkoutRequest, productId, recipient),
		};
	}

	#setProductAction(productId: string, action: 'adding' | 'removing') {
		this.#pendingProductActions = {
			...this.#pendingProductActions,
			[productId]: action,
		};
	}

	#clearProductAction(productId: string) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [productId]: _removed, ...rest } = this.#pendingProductActions;
		this.#pendingProductActions = rest;
	}

	#ensureCurrentCheckoutQuery() {
		if (!this.#currentCheckoutQuery && browser) {
			this.#currentCheckoutQuery = getCurrentCheckout();
		}

		return this.#currentCheckoutQuery;
	}

	launchCheckout(checkoutIdent?: string | null) {
		if (!checkoutIdent) {
			return;
		}

		const { theme, colors } = getTebexThemeConfig();

		this.#tebex?.checkout.init({
			ident: checkoutIdent,
			theme,
			colors,
			closeOnPaymentComplete: true,
		});
		this.#tebex?.checkout.launch();
	}

	init(tebex: typeof Tebex) {
		this.#clearCheckoutListeners();
		this.#tebex = tebex;
		this.#checkoutEventUnsubscribers = [
			tebex.checkout.on('open', () => {
				this.#checkoutResult = {
					status: 'open',
					lastEventAt: Date.now(),
					hasClosedSinceResult: false,
				};
			}),
			tebex.checkout.on('payment:complete', () => {
				const currentCheckoutQuery = this.#ensureCurrentCheckoutQuery();
				this.#checkoutResult = {
					status: 'success',
					lastEventAt: Date.now(),
					hasClosedSinceResult: false,
				};
				this.#pendingProductActions = {};
				this.#updatingRecipient = false;
				this.#deletingCheckoutOrderId = null;
				currentCheckoutQuery?.set(null);
				void this.refreshCurrentCheckout();
			}),
			tebex.checkout.on('payment:error', () => {
				this.#checkoutResult = {
					status: 'error',
					lastEventAt: Date.now(),
					hasClosedSinceResult: false,
				};
			}),
			tebex.checkout.on('close', () => {
				if (this.#checkoutResult.status === 'success' || this.#checkoutResult.status === 'error') {
					this.#checkoutResult = {
						...this.#checkoutResult,
						lastEventAt: Date.now(),
						hasClosedSinceResult: true,
					};
					return;
				}

				this.resetCheckoutResult();
			}),
		];
	}

	#clearCheckoutListeners() {
		for (const unsubscribe of this.#checkoutEventUnsubscribers) {
			unsubscribe();
		}
		this.#checkoutEventUnsubscribers = [];
	}
}

const [getTebex, setTebex] = createContext<TebexContext>();
function initTebex() {
	const ctx = new TebexContext();
	setTebex(ctx);
	return ctx;
}

export { getTebex, initTebex };
