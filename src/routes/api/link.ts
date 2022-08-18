import { GetUserByIGN, LinkDiscordUser } from '$db/database';
import type { RequestHandler } from './__types/link';

export const GET: RequestHandler = async () => {
	return {
		status: 404
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {

	const body = await request.text();

	if (!locals.discordUser) {
		return {
			status: 401,
			body: { error: 'You must be logged in to link your account.' }
		}
	}

	if (locals.discordUser.id && locals.user) {
		// Might unlink here if the user is already linked.
		return {
			status: 200,
			body: locals.user
		};
	}

	const input = body.replace('username=', '');
	const username = decodeURIComponent(input);

	// Check if the username is a valid minecraft username.
	if (!username || !username.match(/^[a-zA-Z0-9_]{1,16}$/)) {
		return {
			status: 400,
			body: { error: 'Invalid username.' }
		}
	}

	const foundUser = await GetUserByIGN(username);

	if (!foundUser) {
		return {
			status: 404,
			body: { error: 'User not found.' }
		}
	}

	const linkedName = foundUser.player?.player.socialMedia?.links?.DISCORD;

	if (!linkedName) {
		return {
			status: 400,
			body: { error: 'User not linked to Discord.' }
		}
	}

	const discordUser = `${locals.discordUser.username}#${locals.discordUser.discriminator}`;

	if (discordUser === linkedName) {
		await LinkDiscordUser(foundUser.uuid, locals.discordUser);

		return {
			status: 200,
			body: foundUser
		}
	}

	return {
		status: 400,
		body: { error: `Username does not match linked username. Linked username: ${linkedName} | Input username: ${username}` }
	}
}