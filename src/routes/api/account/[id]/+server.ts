import { json } from '@sveltejs/kit';
import { accountFromIGN, accountFromUUID } from '$lib/data';

import type { RequestHandler } from '../$types';
export const GET: RequestHandler = async ({ params }) => {

	const id = params.id.replaceAll('-', '');
	const fromName = (id.length < 17);
	
	const account = fromName
		? await accountFromIGN(id)
		: await accountFromUUID(id);
	
	if (!account) {
		return new Response(undefined, { status: 408 })
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if ((account as any).size === 0 || (account as any).errorMessage) {
		return new Response(undefined, { status: 404 })
	}

	throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
	// Suggestion (check for correctness before using):
	// return json(account);
	return {
		status: 200,
		body: account
	}
}