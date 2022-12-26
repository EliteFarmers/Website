import { REDIS_PASSWORD, REDIS_URI } from '$env/static/private';
import { createClient } from 'redis';

const client = createClient({ url: REDIS_URI, password: REDIS_PASSWORD });

client.on('error', (error) => {
	console.error(error);
});

await client.connect();

export default client;
