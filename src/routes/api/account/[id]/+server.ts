import { accountFromIGN, accountFromUUID } from '$lib/data';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {

	const id = params.id.replaceAll('-', '');
	const fromName = (id.length < 17);
	
	const account = fromName
		? await accountFromIGN(id)
		: await accountFromUUID(id);
	
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!account || (account as any).size === 0 || (account as any).errorMessage) {
		return new Response('Account not found', { status: 404 })
	}

	return new Response(JSON.stringify(account));
}