import { PUBLIC_BOT_INVITE } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
	// If there are any query parameters, redirect to the public bot invite with the same query parameters
	const params = [...url.searchParams.entries()];

	if (params.length > 0) {
		const url = new URL(PUBLIC_BOT_INVITE);
		params.forEach(([key, value]) => url.searchParams.set(key, value));

		throw redirect(302, url.toString());
	}

	throw redirect(302, PUBLIC_BOT_INVITE);
}