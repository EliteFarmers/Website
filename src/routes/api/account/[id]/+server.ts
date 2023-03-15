import { ACCOUNT_UPDATE_INTERVAL } from '$lib/constants/data';
import { accountFromIGN, accountFromUUID } from '$lib/data';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const id = params.id.replaceAll('-', '');
	const fromName = id.length < 17;

	const account = fromName ? await accountFromIGN(id) : await accountFromUUID(id);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	if (!account || (account as any).size === 0 || (account as any).errorMessage) {
		return json({ success: false, error: 'Account not found' }, { status: 404 });
	}

	setHeaders({
		'Cache-Control': `max-age=${ACCOUNT_UPDATE_INTERVAL / 1000}, public`,
	});

	return json(account);
};
