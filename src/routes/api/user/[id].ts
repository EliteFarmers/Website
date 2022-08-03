import { accountFromIGN, accountFromUUID, fetchPlayer, fetchProfiles } from '$lib/data';
import { env } from '$env/dynamic/private';

// TEMP

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let data: { status: number; body: { account: any; profiles: unknown[]; player: any; }; };

// TEMP


type Params = { params: { id: string }}
export async function GET({ params }: Params) {

	// TEMP
	if (data) return data;
	// TEMP

	const id = params.id;
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

	if (account.size === 0 || account.errorMessage) {
		return { 
			status: 404,
			error: {
				message: `A user with the ${fromName ? 'username' : 'UUID'} of ${id} was not found!`
			}
		}
	}

	const key = env['HYPIXEL_API_KEY'];
	if (!key) {
		return {
			status: 500,
			error: {
				message: 'No API key was provided.'
			}
		}
	}

	const profiles = await fetchProfiles(account.id, key);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!profiles || (profiles as any)?.size === 0) {
		return { 
			status: 404,
			error: {
				message: `A user with the ${fromName ? 'username' : 'UUID'} of ${id} was not found!`
			}
		}
	}

	const player = await fetchPlayer(account.id, key);

	if (!player || player.size === 0) {
		return { 
			status: 404,
			error: {
				message: `A player with the ${fromName ? 'username' : 'UUID'} of ${id} was not found!`
			}
		}
	}

	// TEMP
	data = { 
		status: 200,
		body: {
			account: account,
			profiles: (profiles as { profiles: unknown[] }).profiles,
			player: player.player
		}
	};

	return data;
	// TEMP
}