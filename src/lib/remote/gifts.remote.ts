import { command, query } from '$app/server';
import {
	claimGift as apiClaimGift,
	resendGift as apiResendGift,
	type ClaimGiftRequest,
	declineGift as apiDeclineGift,
	type DeclineGiftRequest,
	getPendingGifts,
	type ResendGiftRequest,
} from '$lib/api';
import * as z from 'zod';

export const GetPendingGifts = query(async () => {
	const response = await getPendingGifts();
	if (!response.ok) return null;
	return response.data ?? [];
});

const claimGiftSchema = z.object({
	orderId: z.string(),
	orderItemIds: z.array(z.string()).optional(),
});

export const ClaimGift = command(claimGiftSchema, async ({ orderId, orderItemIds }) => {
	const response = await apiClaimGift(orderId, {
		orderItemIds: (orderItemIds ?? []) as unknown as ClaimGiftRequest['orderItemIds'],
	});

	if (response.ok) return { status: 'claimed' as const };

	const message = extractErrorMessage(response.error);
	if (response.response.status === 409) return { status: 'conflict' as const, message };
	if (response.response.status === 403) return { status: 'forbidden' as const, message };
	return { status: 'error' as const, message };
});

const declineGiftSchema = z.object({
	orderId: z.string(),
	orderItemIds: z.array(z.string()).optional(),
});

export const DeclineGift = command(declineGiftSchema, async ({ orderId, orderItemIds }) => {
	const response = await apiDeclineGift(orderId, {
		orderItemIds: (orderItemIds ?? []) as unknown as DeclineGiftRequest['orderItemIds'],
	});

	if (response.ok) return { status: 'declined' as const };

	const message = extractErrorMessage(response.error);
	if (response.response.status === 409) return { status: 'conflict' as const, message };
	if (response.response.status === 403) return { status: 'forbidden' as const, message };
	return { status: 'error' as const, message };
});

const resendGiftSchema = z.object({
	orderId: z.string(),
	orderItemIds: z.array(z.string()),
	mode: z.enum(['GiftUser', 'GiftGuild']),
	playerUuidOrIgn: z.string().nullish(),
	guildId: z.number().nullish(),
	message: z.string().nullish(),
});

export const ResendGift = command(resendGiftSchema, async ({ orderId, ...body }) => {
	const response = await apiResendGift(orderId, {
		orderItemIds: body.orderItemIds as unknown as ResendGiftRequest['orderItemIds'],
		mode: body.mode,
		playerUuidOrIgn: body.playerUuidOrIgn,
		guildId: body.guildId ? BigInt(body.guildId) : undefined,
		message: body.message,
	});

	if (response.ok) return { status: 'sent' as const };

	const message = extractErrorMessage(response.error);
	if (response.response.status === 409) return { status: 'conflict' as const, message };
	if (response.response.status === 403) return { status: 'forbidden' as const, message };
	return { status: 'error' as const, message };
});

function extractErrorMessage(error: unknown): string | null {
	if (!error || typeof error !== 'object') return null;
	const obj = error as Record<string, unknown>;

	if (obj.errors && typeof obj.errors === 'object') {
		const errs = obj.errors as Record<string, unknown>;
		if (Array.isArray(errs.generalErrors) && errs.generalErrors.length > 0) {
			return String(errs.generalErrors[0]);
		}
	}

	if (typeof obj.message === 'string') return obj.message;
	if (typeof obj.detail === 'string') return obj.detail;
	if (typeof obj.title === 'string') return obj.title;
	return null;
}
