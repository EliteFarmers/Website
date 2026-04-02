import { goto } from '$app/navigation';
import type { ProductDto } from '$lib/api';
import { getGlobalContext } from '$lib/hooks/global.svelte';
import { getTebex } from '$lib/tebex/index.svelte';
import { toast } from 'svelte-sonner';
import { SvelteURL } from 'svelte/reactivity';

export type BasketLineItem = {
	productId: string;
	quantity: number;
	product: ProductDto | null | undefined;
	isPendingPlaceholder: boolean;
};

export class CheckoutState {
	#tebex = getTebex();
	#gbl = getGlobalContext();
	#products: () => ProductDto[];
	#pageUrl: () => URL;

	// Mutable state
	giftIntent = $state<'self' | 'gift'>('self');
	#stagedRecipientIgn = $state<string | null>(null);
	settingRecipient = $state(false);
	launchingCheckout = $state(false);
	addingPendingGiftProduct = $state(false);
	editingGiftRecipient = $state(false);
	#shouldApplyGiftPrompt = $state(true);

	constructor(products: () => ProductDto[], pageUrl: () => URL) {
		this.#products = products;
		this.#pageUrl = pageUrl;

		$effect(() => {
			if (this.isGiftCheckout) {
				this.giftIntent = 'gift';
			}
		});

		$effect(() => {
			if (this.recipientIgn) {
				this.#stagedRecipientIgn = this.recipientIgn;
				return;
			}

			if (this.#tebex.currentCheckout) {
				this.#stagedRecipientIgn = null;
			}
		});

		$effect(() => {
			if (!this.#shouldApplyGiftPrompt) return;

			if (this.#pageUrl().searchParams.get('gift') === '1') {
				this.giftIntent = 'gift';
			}

			this.#shouldApplyGiftPrompt = false;
		});

		$effect(() => {
			if (
				this.pendingGiftProductId &&
				!this.pendingGiftProductInCheckout &&
				!this.addingPendingGiftProduct &&
				this.effectiveRecipientIgn
			) {
				this.#addPendingGiftProduct();
			}
		});
	}

	get checkoutResult() {
		return this.#tebex.checkoutResult;
	}

	get showingCheckoutSuccess() {
		return this.checkoutResult.status === 'success' && this.checkoutResult.hasClosedSinceResult;
	}

	get showingCheckoutError() {
		return this.checkoutResult.status === 'error' && this.checkoutResult.hasClosedSinceResult;
	}

	get checkoutPageTitle() {
		if (this.showingCheckoutSuccess) return 'Order received';
		if (this.showingCheckoutError) return 'Checkout needs attention';
		return 'Review your order';
	}

	get checkoutPageDescription() {
		if (this.showingCheckoutSuccess) {
			return 'Your Tebex checkout has been submitted, you should receive an email confirmation shortly!';
		}
		if (this.showingCheckoutError) {
			return 'Your payment was not completed. You can try checkout again or return to the basket.';
		}
		return 'Confirm your items and recipient, then continue to payment.';
	}

	get checkoutItems(): BasketLineItem[] {
		const items = this.#tebex.currentCheckout?.checkoutRequest.items ?? [];
		return items.map((item) => {
			const product = this.#products().find((p) => p.id === item.productId);
			return { ...item, product, isPendingPlaceholder: false };
		});
	}

	get basketItems(): BasketLineItem[] {
		const pending = this.pendingGiftProduct;
		if (!pending || this.pendingGiftProductInCheckout) return this.checkoutItems;
		return [
			...this.checkoutItems,
			{ productId: pending.id, quantity: 1, product: pending, isPendingPlaceholder: true },
		];
	}

	get basketItemCount() {
		return this.basketItems.reduce((total, item) => total + item.quantity, 0);
	}

	get totalPrice() {
		return this.#tebex.currentCheckout?.totalPrice ?? null;
	}

	get recipient() {
		return this.#tebex.currentCheckout?.checkoutRequest.recipient ?? null;
	}

	get recipientIgn() {
		return this.recipient?.playerUuidOrIgn ?? null;
	}

	get isGiftCheckout() {
		return this.recipient?.mode === 'GiftUser' && Boolean(this.recipientIgn);
	}

	get effectiveRecipientIgn() {
		return this.recipientIgn ?? this.#stagedRecipientIgn;
	}

	get pendingGiftProductId() {
		return this.#pageUrl().searchParams.get('giftProduct');
	}

	get pendingGiftProduct() {
		return this.#products().find((p) => p.id === this.pendingGiftProductId) ?? null;
	}

	get pendingGiftProductInCheckout() {
		return this.pendingGiftProductId
			? this.checkoutItems.some((item) => item.productId === this.pendingGiftProductId)
			: false;
	}

	get hasPendingGiftPlaceholder() {
		return Boolean(this.pendingGiftProduct && !this.pendingGiftProductInCheckout);
	}

	get hasCheckoutToReview() {
		return this.checkoutItems.length > 0 || Boolean(this.pendingGiftProduct);
	}

	get hasOwnedItemsInCheckout() {
		return (
			this.checkoutItems.some((item) => item.product && this.#gbl.ownsProduct(item.product.id)) ||
			(this.pendingGiftProduct && this.#gbl.ownsProduct(this.pendingGiftProduct.id))
		);
	}

	get hasNonGiftableItemsForGift() {
		const nonGiftable = this.checkoutItems.filter((item) => item.product && !item.product.tebex?.supportsGifting);
		const pendingSupports = this.pendingGiftProduct
			? Boolean(this.pendingGiftProduct.tebex?.supportsGifting)
			: true;
		return nonGiftable.length > 0 || !pendingSupports;
	}

	get selfCheckoutBlocked() {
		return this.giftIntent === 'self' && this.hasOwnedItemsInCheckout;
	}

	get selfCheckoutUnavailable() {
		return this.hasOwnedItemsInCheckout;
	}

	get canMutateCheckout() {
		return this.#tebex.currentCheckout?.canMutate ?? false;
	}

	get deliveryLabel() {
		if (this.giftIntent === 'gift') {
			return this.effectiveRecipientIgn
				? `Gift delivery to ${this.effectiveRecipientIgn}`
				: 'Gift recipient not selected';
		}
		return 'Delivered to your account';
	}

	get deliveryDescription() {
		if (this.selfCheckoutUnavailable) {
			return 'This basket includes something you already own, so it must be delivered to another player.';
		}
		if (this.giftIntent === 'gift') {
			return this.effectiveRecipientIgn
				? `The gift will be prepared for ${this.effectiveRecipientIgn}.`
				: 'Choose a player before you continue.';
		}
		return 'This order will stay on your own account.';
	}

	get checkoutStatusLabel() {
		if (this.showingCheckoutSuccess) return 'Paid';
		if (this.showingCheckoutError) return 'Payment failed';
		if (this.#tebex.isMutatingCheckout || this.addingPendingGiftProduct) return 'Updating...';
		if (!this.checkoutItems.length && this.hasPendingGiftPlaceholder) {
			return this.effectiveRecipientIgn ? 'Ready to add' : 'Choose recipient';
		}
		if (this.totalPrice === null) return 'Updating...';
		return 'Ready';
	}

	get totalPriceLabel() {
		if (this.checkoutItems.length > 0) return 'Updating...';
		if (this.hasPendingGiftPlaceholder) {
			return this.effectiveRecipientIgn ? 'Adding item...' : 'Choose recipient';
		}
		return 'Add item to see total';
	}

	get canCheckout() {
		if (this.launchingCheckout || this.#tebex.isMutatingCheckout || this.addingPendingGiftProduct) return false;
		if (this.selfCheckoutBlocked) return false;
		if (this.giftIntent === 'gift' && this.hasNonGiftableItemsForGift) return false;
		if (this.giftIntent === 'gift' && !this.effectiveRecipientIgn) return false;
		if (this.giftIntent === 'gift' && this.#isSelfRecipient(this.effectiveRecipientIgn)) return false;
		if (this.pendingGiftProduct && !this.pendingGiftProductInCheckout) return false;
		return true;
	}

	#isSelfRecipient(ign: string | null | undefined) {
		if (!ign || !this.#gbl.session?.ign) return false;
		return ign.toLowerCase() === this.#gbl.session.ign.toLowerCase();
	}

	getProductAction(productId: string) {
		return this.#tebex.getProductAction(productId);
	}

	itemDescription(item: BasketLineItem) {
		if (!item.isPendingPlaceholder) return item.product?.description ?? 'Included in this checkout.';
		if (this.addingPendingGiftProduct) return 'Adding this item to the gift basket now.';
		if (this.effectiveRecipientIgn) {
			return `This item will be added automatically for ${this.effectiveRecipientIgn}.`;
		}
		return 'Choose a recipient and this item will be added automatically.';
	}

	chooseSelf() {
		if (this.selfCheckoutUnavailable) {
			toast.error('Items you already own need to be sent as a gift to another player.');
			return;
		}

		this.giftIntent = 'self';
		this.#stagedRecipientIgn = null;
		this.editingGiftRecipient = false;
	}

	chooseGift() {
		if (this.hasNonGiftableItemsForGift) {
			toast.error('One or more items in this checkout cannot be sent as a gift.');
			return;
		}

		this.giftIntent = 'gift';

		if (!this.effectiveRecipientIgn) {
			this.editingGiftRecipient = true;
		}
	}

	async selectRecipient(ign: string) {
		if (this.#isSelfRecipient(ign)) {
			toast.error('Choose another player when sending a gift.');
			return;
		}

		this.giftIntent = 'gift';
		this.#stagedRecipientIgn = ign;

		if (!this.#tebex.currentCheckout) {
			if (this.pendingGiftProductId && !this.pendingGiftProductInCheckout) {
				await this.#addPendingGiftProduct(ign);
			}
			this.editingGiftRecipient = false;
			return;
		}

		this.settingRecipient = true;
		try {
			const updated = await this.#tebex.setRecipient(ign);
			if (!updated) {
				this.#stagedRecipientIgn = this.recipientIgn;
				return;
			}
			this.editingGiftRecipient = false;
			if (this.pendingGiftProductId && !this.pendingGiftProductInCheckout) {
				await this.#addPendingGiftProduct(ign);
			}
		} finally {
			this.settingRecipient = false;
		}
	}

	async clearGift() {
		if (this.selfCheckoutUnavailable) {
			toast.error('Items you already own need to be sent as a gift to another player.');
			return;
		}

		this.chooseSelf();

		if (!this.#tebex.currentCheckout) return;

		this.settingRecipient = true;
		try {
			await this.#tebex.setRecipient(null);
			this.editingGiftRecipient = false;
		} finally {
			this.settingRecipient = false;
		}
	}

	startChangingRecipient() {
		this.#tebex.resetCheckoutResult();
		this.giftIntent = 'gift';
		this.editingGiftRecipient = true;
	}

	stopChangingRecipient() {
		this.editingGiftRecipient = false;
	}

	async removeItem(productId: string) {
		await this.#tebex.removeFromCheckout(productId);
	}

	returnToBasket() {
		this.#tebex.resetCheckoutResult();
	}

	async clearPendingGiftProductPrompt() {
		if (!this.pendingGiftProductId) return;
		const nextUrl = new SvelteURL(this.#pageUrl());
		nextUrl.searchParams.delete('giftProduct');
		await goto(nextUrl, { replaceState: true, noScroll: true, keepFocus: true });
	}

	async proceedToCheckout() {
		this.launchingCheckout = true;
		try {
			if (this.selfCheckoutBlocked) {
				toast.error('Items you already own need to stay in a gift checkout.');
				return;
			}

			if (this.giftIntent === 'gift' && !this.effectiveRecipientIgn) return;

			if (this.giftIntent === 'gift' && this.#isSelfRecipient(this.effectiveRecipientIgn)) {
				toast.error('Choose another player when sending a gift.');
				return;
			}

			if (this.giftIntent === 'self' && this.isGiftCheckout) {
				const updated = await this.#tebex.setRecipient(null);
				if (!updated) return;
			}

			let ident = this.#tebex.currentCheckout?.checkoutIdent;
			if (!ident) {
				await this.#tebex.refreshCurrentCheckout();
				ident = this.#tebex.currentCheckout?.checkoutIdent;
			}

			if (ident) {
				this.#tebex.launchCheckout(ident);
			}
		} finally {
			this.launchingCheckout = false;
		}
	}

	async #addPendingGiftProduct(recipientToUse?: string | null) {
		if (!this.pendingGiftProductId || this.pendingGiftProductInCheckout) return;

		const activeRecipient = recipientToUse ?? this.effectiveRecipientIgn;
		if (!activeRecipient || this.#isSelfRecipient(activeRecipient)) return;

		this.addingPendingGiftProduct = true;
		try {
			await this.#tebex.addToBasket(this.pendingGiftProductId, { recipient: activeRecipient });

			const hasItem =
				this.#tebex.currentCheckout?.checkoutRequest.items.some(
					(item) => item.productId === this.pendingGiftProductId
				) ?? false;

			if (hasItem) await this.clearPendingGiftProductPrompt();
		} finally {
			this.addingPendingGiftProduct = false;
		}
	}
}
