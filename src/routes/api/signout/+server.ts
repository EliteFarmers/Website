export async function GET() {
	
	const headers = new Headers();
	headers.append('Set-Cookie', `discord_access_token=deleted; Path=/; Max-Age=-1`)
	headers.append('Set-Cookie', `discord_refresh_token=deleted; Path=/; Max-Age=-1`)

	return new Response(undefined, { status: 200, headers });
}