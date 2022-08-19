export async function GET() {
	throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
	return {
		headers: {
			'Set-Cookie': [
				`discord_access_token=deleted; Path=/; Max-Age=-1`,
				`discord_refresh_token=deleted; Path=/; Max-Age=-1`,
			],
		},
		status: 200
	}
}