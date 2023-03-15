import { GetUserByIGN, LinkDiscordUser, UnlinkDiscordUser } from '$db/database';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const body = await request.text();

	if (!locals.discordUser) {
		return json({ success: false, error: 'You must be logged in to link your account.' }, { status: 401 });
	}

	if (locals.discordUser.id && locals.user) {
		const username = decodeURIComponent(body.replace('username=', ''));

		if (username === '$Unlink') {
			const uuid = locals.user.uuid;

			if (!uuid) {
				return json({ success: false, error: 'Invalid UUID.' }, { status: 404 });
			}
			await UnlinkDiscordUser(uuid);
			return json({ success: true });
		}
		return json(locals.user);
	}

	const input = body.replace('username=', '');
	const username = decodeURIComponent(input) || undefined;

	// Check if the username is a valid minecraft username.
	if (!username?.match(/^[a-zA-Z0-9_]{1,16}$/)) {
		return json({ success: false, error: 'Invalid username.' }, { status: 404 });
	}

	const foundUser = await GetUserByIGN(username);

	if (!foundUser) {
		return json({ success: false, error: 'User not found.' }, { status: 404 });
	}

	const linkedName = foundUser.player?.player.socialMedia?.links?.DISCORD;

	if (!linkedName) {
		return json({ success: false, error: "User doesn't have a linked account on Hypixel." }, { status: 404 });
	}

	const discordUser = `${locals.discordUser.username}#${locals.discordUser.discriminator}`;

	if (discordUser !== linkedName) {
		return json({ success: false, error: 'User has a different account linked.' }, { status: 401 });
	}

	// Success!
	await LinkDiscordUser(foundUser.uuid, locals.discordUser);
	return json(foundUser);
};
