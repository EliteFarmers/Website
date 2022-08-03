export async function GET() {
	return {
		headers: {
			'Set-Cookie': [
				`discord_access_token=deleted; Path=/; Max-Age=-1`,
				`discord_refresh_token=deleted; Path=/; Max-Age=-1`,
			],
			Location: '/'
		},
		status: 302
	}
}