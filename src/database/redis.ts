import { REDIS_PASSWORD, REDIS_URI } from '$env/static/private';
import { createClient } from 'redis';

class Redis {
	private c;

	constructor() {
		this.c = createClient({
			url: REDIS_URI,
			password: REDIS_PASSWORD,
		});

		this.c.on('error', (error) => {
			console.error(error);
		});
	}

	get client() {
		return this.c;
	}
}

export const client = new Redis().client;
