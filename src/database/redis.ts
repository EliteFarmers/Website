import { building } from '$app/environment';
import { REDIS_PASSWORD, REDIS_URI } from '$env/static/private';
import { createClient } from 'redis';

class Redis {
	private c;

	constructor() {
		console.log('Connecting to Redis...');
		this.c = createClient({
			url: REDIS_URI,
			password: REDIS_PASSWORD,
		});

		this.c.on('error', (error) => {
			console.error(error, 'Redis error');
		});
	}

	async client() {
		if (building) return this.c;

		try {
			await this.c.connect();
		} catch (error) {
			console.error(error, 'Redis error');
		}

		return this.c;
	}
}

export const client = await new Redis().client();
