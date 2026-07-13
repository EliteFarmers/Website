import { command, query } from '$app/server';
import {
	hiddenCreateTebexCheckout,
	hiddenDeleteTebexCheckout,
	hiddenGetCurrentTebexCheckout,
	hiddenUpdateTebexCheckout,
} from '$lib/api';
import z from 'zod';

const checkoutBodySchema = z.object({
	items: z.array(
		z.object({
			productId: z.string(),
			quantity: z.number(),
		})
	),
	recipient: z
		.object({
			mode: z.enum(['Self', 'GiftUser', 'GiftGuild']).nullish(),
			playerUuidOrIgn: z.string().nullish(),
			guildId: z.union([z.string(), z.number(), z.bigint()]).nullish(),
			message: z.string().nullish(),
		})
		.nullish(),
	creatorCode: z.string().nullish(),
	country: z.string().nullish(),
	fingerprint: z.string().nullish(),
});

function normalizeCheckoutBody(body: z.infer<typeof checkoutBodySchema>) {
	return {
		...body,
		recipient: body.recipient
			? {
					...body.recipient,
					guildId:
						typeof body.recipient.guildId === 'bigint'
							? body.recipient.guildId.toString()
							: body.recipient.guildId,
				}
			: body.recipient,
	};
}

export const getCurrentCheckout = query(async () => {
	const response = await hiddenGetCurrentTebexCheckout();
	return response.ok ? (response.data ?? null) : null;
});

export const createCheckout = command(checkoutBodySchema, async (body) => {
	const response = await hiddenCreateTebexCheckout(
		normalizeCheckoutBody(body) as unknown as Parameters<typeof hiddenCreateTebexCheckout>[0]
	);
	if (!response.ok) {
		return { error: extractErrorMessage(response.error) ?? 'Failed to create checkout' };
	}
	return { data: response.data ?? null };
});

export const updateCheckout = command(
	z.object({
		orderId: z.string(),
		body: checkoutBodySchema,
	}),
	async ({ orderId, body }) => {
		const response = await hiddenUpdateTebexCheckout(
			orderId,
			normalizeCheckoutBody(body) as unknown as Parameters<typeof hiddenUpdateTebexCheckout>[1]
		);
		if (!response.ok) {
			return { error: extractErrorMessage(response.error) ?? 'Failed to update checkout' };
		}
		return { data: response.data ?? null };
	}
);

export const deleteCheckout = command(
	z.object({
		orderId: z.string(),
	}),
	async ({ orderId }) => {
		const response = await hiddenDeleteTebexCheckout(orderId);
		if (!response.ok) {
			return { error: extractErrorMessage(response.error) ?? 'Failed to clear checkout' };
		}
		return { ok: true as const };
	}
);

function extractErrorMessage(error: unknown): string | null {
	if (!error || typeof error !== 'object') return null;
	const obj = error as Record<string, unknown>;

	// Check nested errors.generalErrors first (most specific)
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
