import { json } from '@sveltejs/kit';
import { GetUserByIGN, LinkDiscordUser } from '$db/database';
import type { RequestHandler } from '../$types';

export const GET: RequestHandler = async () => {
	return new Response(undefined, { status: 404 })
};

export const POST: RequestHandler = async ({ locals, request }) => {

	const body = await request.text();

	if (!locals.discordUser) {
		return json({ error: 'You must be logged in to link your account.' }, {
			status: 401
		})
	}

	if (locals.discordUser.id && locals.user) {
		// Might unlink here if the user is already linked.
		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return new Response(locals.user);
		return {
			status: 200,
			body: locals.user
		};
	}

	const input = body.replace('username=', '');
	const username = decodeURIComponent(input);

	// Check if the username is a valid minecraft username.
	if (!username || !username.match(/^[a-zA-Z0-9_]{1,16}$/)) {
		return json({ error: 'Invalid username.' }, {
			status: 400
		})
	}

	const foundUser = await GetUserByIGN(username);

	if (!foundUser) {
		return json({ error: 'User not found.' }, {
			status: 404
		})
	}

	const linkedName = foundUser.player?.player.socialMedia?.links?.DISCORD;

	if (!linkedName) {
		return json({ error: 'User not linked to Discord.' }, {
			status: 400
		})
	}

	const discordUser = `${locals.discordUser.username}#${locals.discordUser.discriminator}`;

	if (discordUser === linkedName) {
		await LinkDiscordUser(foundUser.uuid, locals.discordUser);

		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
		// Suggestion (check for correctness before using):
		// return json(foundUser);
		return {
			status: 200,
			body: foundUser
		}
	}

	return json({ error: `Username does not match linked username. Linked username: ${linkedName} | Input username: ${username}` }, {
		status: 400
	})
}