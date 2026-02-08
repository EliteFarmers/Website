export * from './client/EliteAPI';
export * from './client/EliteAPI.zod';
export * from './schemas';

export const getWithTimeout = async <T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T | null> => {
	const controller = new AbortController();

	const timeoutPromise = new Promise<null>((resolve) => {
		const timeoutId = setTimeout(() => {
			controller.abort();
			resolve(null);
		}, ms);

		controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
	});

	try {
		const result = await Promise.race([fn(controller.signal), timeoutPromise]);
		return result;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			return null;
		}
		throw error;
	}
};
