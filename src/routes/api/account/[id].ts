import { accountFromIGN, accountFromUUID } from '$lib/data';

import type { RequestHandler } from './__types/[id]';
export const GET: RequestHandler = async ({ params }) => {

	const id = params.id.replaceAll('-', '');
	const fromName = (id.length < 17);
	
	const account = fromName
		? await accountFromIGN(id)
		: await accountFromUUID(id);
	
	if (!account) {
		return { 
			status: 408,
			error: {
				message: 'Failed to connect to Mojang\'s name servers.'
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if ((account as any).size === 0 || (account as any).errorMessage) {
		return { 
			status: 404,
			error: {
				message: `A user with the ${fromName ? 'username' : 'UUID'} of ${id} was not found!`
			}
		}
	}

	return {
		status: 200,
		body: account
	}
}