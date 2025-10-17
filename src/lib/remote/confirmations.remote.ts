import { form, getRequestEvent, query } from '$app/server';
import {
	acceptConfirmation,
	createConfirmation,
	getAllConfirmations,
	zodAcceptConfirmationParams,
	zodCreateConfirmationBody,
} from '$lib/api';
import { error } from '@sveltejs/kit';

export const createConfirmationForm = form(zodCreateConfirmationBody, async (data) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		error(401, 'Unauthorized');
	}

	const { response, error: e } = await createConfirmation(data);

	if (!response.ok) {
		error(response.status, e ?? 'Failed to create announcement confirmation');
	}

	getConfirmations().refresh();
	return data;
});

export const getConfirmations = query(async () => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		error(401, 'Unauthorized');
	}

	const { response, data, error: e } = await getAllConfirmations();

	if (!response.ok) {
		error(response.status, e ?? 'Failed to fetch announcement confirmations');
	}

	return data;
});

export const acceptConfirmationForm = form(zodAcceptConfirmationParams, async (data) => {
	const event = getRequestEvent();
	if (!event.locals.access_token) {
		error(401, 'Unauthorized');
	}

	const { response, error: e } = await acceptConfirmation(data.id);

	if (!response.ok) {
		error(response.status, e ?? 'Failed to accept confirmation');
	}

	return data;
});
