import type { RequestHandler } from './__types/callback';

export const GET: RequestHandler = async ({ url }) => {
 
	const returnCode = url.searchParams.get('code');
	const returnState = url.searchParams.get('state');
	const error = url.searchParams.get('error');

	if (error) {
		return {
			status: 302,
			headers: { Location: '/' },
		}
	}

	return {
		status: 200,
		headers: {
			refresh: `0;url=/api/login?code=${returnCode}&state=${returnState}`,
			'content-type': 'text/plain',
		},
		body: '',
	}
}