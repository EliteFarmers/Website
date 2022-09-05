import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const returnCode = url.searchParams.get('code');
	const returnState = url.searchParams.get('state');
	const error = url.searchParams.get('error');

	if (error || !returnCode || !returnState) {
		return new Response(undefined, { status: 302, headers: { Location: '/' } });
	}

	return new Response('', {
		headers: {
			refresh: `0;url=/api/login?code=${returnCode}&state=${returnState}`,
			'content-type': 'text/plain',
		},
	});
};
