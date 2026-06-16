self.addEventListener('push', (event) => {
	let payload;
	try {
		payload = event.data ? event.data.json() : {};
	} catch {
		payload = {};
	}

	const title = payload.title || 'Elite notification';
	const options = {
		body: payload.message || '',
		icon: '/favicon.webp',
		badge: '/favicon.webp',
		data: {
			link: payload.link || '/',
			notificationId: payload.id,
		},
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const link = event.notification.data?.link || '/';
	const url = new URL(link, self.location.origin).href;

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			for (const client of clients) {
				if ('focus' in client && client.url === url) {
					return client.focus();
				}
			}

			if (self.clients.openWindow) {
				return self.clients.openWindow(url);
			}
		})
	);
});
