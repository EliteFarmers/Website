import { REDIS_PASSWORD, REDIS_URI } from '$env/static/private';
import { createClient } from 'redis';

const client = createClient({ url: REDIS_URI as string, password: REDIS_PASSWORD as string });

client.on('error', (error) => {
	console.error(error);
});

await client.connect();

export default client;
