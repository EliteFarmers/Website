import { GetUserByIGN, LinkDiscordUser } from '$db/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response(undefined, { status: 404 })
};

export const POST: RequestHandler = async ({ locals, request }) => {

	const body = await request.text();

	if (!locals.discordUser) {
		return new Response('You must be logged in to link your account.', { status: 401 });
	}

	if (locals.discordUser.id && locals.user) {
		// Might unlink here if the user is already linked.
		return new Response(JSON.stringify(locals.user));
	}

	const input = body.replace('username=', '');
	const username = decodeURIComponent(input);

	// Check if the username is a valid minecraft username.
	if (!username || !username.match(/^[a-zA-Z0-9_]{1,16}$/)) {
		return new Response('Invalid username.', { status: 400 });
	}

	const foundUser = await GetUserByIGN(username);

	if (!foundUser) {
		return new Response('User not found.', { status: 404 });
	}

	const linkedName = foundUser.player?.player.socialMedia?.links?.DISCORD;

	if (!linkedName) {
		return new Response('User doesn\'t have a linked account on Hypixel.', { status: 404 });
	}

	const discordUser = `${locals.discordUser.username}#${locals.discordUser.discriminator}`;

	if (discordUser !== linkedName) {
		return new Response('User has a different account linked.', { status: 400 });
	}

	// Success!
	await LinkDiscordUser(foundUser.uuid, locals.discordUser);
	return new Response(JSON.stringify(foundUser));
}