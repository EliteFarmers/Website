import type { UserOrderDto } from '$lib/api';
import type { BadgeVariant } from '$ui/badge';

export const DEFAULT_PAYMENTS_PAGE_SIZE = 10;
export const PAYMENTS_PAGE_SIZES = [10, 20, 30, 40, 50] as const;

type PaymentsUrlState = {
	pageIndex: number;
	pageSize: number;
};

export function parsePaymentsUrlState(searchParams: URLSearchParams): PaymentsUrlState {
	const page = Number(searchParams.get('page') ?? '1');
	const pageSize = Number(searchParams.get('size') ?? String(DEFAULT_PAYMENTS_PAGE_SIZE));

	return {
		pageIndex: Number.isFinite(page) && page > 0 ? page - 1 : 0,
		pageSize: PAYMENTS_PAGE_SIZES.includes(pageSize as (typeof PAYMENTS_PAGE_SIZES)[number])
			? pageSize
			: DEFAULT_PAYMENTS_PAGE_SIZE,
	};
}

export function applyPaymentsUrlState(url: URL, state: PaymentsUrlState) {
	const next = new URL(url);

	if (state.pageIndex > 0) {
		next.searchParams.set('page', String(state.pageIndex + 1));
	} else {
		next.searchParams.delete('page');
	}

	if (state.pageSize !== DEFAULT_PAYMENTS_PAGE_SIZE) {
		next.searchParams.set('size', String(state.pageSize));
	} else {
		next.searchParams.delete('size');
	}

	return next;
}

export function formatOrderDate(value?: string | null) {
	if (!value) {
		return 'Unavailable';
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return 'Unavailable';
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
	}).format(date);
}

export function formatOrderDateTime(value?: string | null) {
	if (!value) {
		return 'Unavailable';
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return 'Unavailable';
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(date);
}

export function formatOrderCurrency(amount: number, currency: string) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			maximumFractionDigits: 2,
		}).format(amount);
	} catch {
		return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
	}
}

export function getOrderDisplayId(orderId: string) {
	return orderId.length > 12 ? orderId.slice(-12).toUpperCase() : orderId.toUpperCase();
}

export function getOrderProviderLabel(provider?: string | null) {
	return humanizeOrderLabel(provider ?? 'Unknown');
}

export function getOrderStatusVariant(status?: string | null): BadgeVariant {
	const normalized = status?.trim().toLowerCase() ?? '';

	if (
		normalized.includes('refund') ||
		normalized.includes('cancel') ||
		normalized.includes('dispute') ||
		normalized.includes('chargeback')
	) {
		return 'destructive';
	}

	if (
		normalized.includes('complete') ||
		normalized.includes('paid') ||
		normalized.includes('success') ||
		normalized.includes('fulfilled')
	) {
		return 'default';
	}

	if (normalized.includes('pending') || normalized.includes('open') || normalized.includes('processing')) {
		return 'secondary';
	}

	return 'outline';
}

export function humanizeOrderLabel(value?: string | null) {
	if (!value) {
		return 'Unknown';
	}

	return value
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function summarizeOrderItems(order: UserOrderDto, limit = 2) {
	const items = order.items.map((item) => {
		const name =
			item.productName?.trim() || item.tebexPackage?.name?.trim() || `Product #${item.productId.toString()}`;
		return {
			name,
			quantity: item.quantity,
		};
	});

	return {
		lines: items.slice(0, limit).map((item) => `${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}`),
		extraCount: Math.max(items.length - limit, 0),
		itemCount: items.length,
		totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
	};
}

export function getOrderRelationshipLabels(order: UserOrderDto) {
	const labels: string[] = [];

	if (order.isBuyer) {
		labels.push('Purchased');
	}

	if (order.isGiftSent) {
		labels.push('Gift Sent');
	}

	if (order.isGiftReceived) {
		labels.push('Gift Received');
	} else if (order.isRecipient && !order.isBuyer) {
		labels.push('Recipient');
	}

	return labels;
}

export function getOrderRecipientText(order: UserOrderDto) {
	const ign = order.recipientSnapshot?.minecraftIgn?.trim();

	if (ign) {
		return `For ${ign}`;
	}

	if (order.recipientGuildId) {
		return 'Delivered to a guild';
	}

	if (order.isGiftSent) {
		return 'Gift purchase';
	}

	return null;
}

export function getOrderResolutionText(order: UserOrderDto) {
	if (order.refundedAt) {
		return `Refunded ${formatOrderDate(order.refundedAt)}`;
	}

	if (order.disputedAt) {
		return `Disputed ${formatOrderDate(order.disputedAt)}`;
	}

	if (order.completedAt) {
		return `Completed ${formatOrderDate(order.completedAt)}`;
	}

	if (order.tebex?.expiresAt) {
		return `Expires ${formatOrderDate(order.tebex.expiresAt)}`;
	}

	return null;
}
