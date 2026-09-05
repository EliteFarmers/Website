import { describe, expect, it } from 'vitest';
import { nonDefault, readBoolean, readChoice, readNumber, withToolQuery } from './query-params';

describe('tool query parameters', () => {
	it.each(['', ' ', 'NaN', 'Infinity', '-1', '26', 'abc'])('rejects invalid numeric value %j', (value) => {
		expect(readNumber(new URLSearchParams({ level: value }), 'level', 5, 0, 25, 1)).toBe(5);
	});
	it('keeps zero and rounds valid slider values to their step', () => {
		expect(readNumber(new URLSearchParams('level=0'), 'level', 5, 0, 25, 1)).toBe(0);
		expect(readNumber(new URLSearchParams('bps=17.7'), 'bps', 20, 10, 20, 0.5)).toBe(17.5);
	});
	it('validates enums and accepts explicit boolean values', () => {
		const params = new URLSearchParams('buy=invalid&enabled=0');
		expect(readChoice(params, 'buy', ['instabuy', 'buyorder'], 'instabuy')).toBe('instabuy');
		expect(readBoolean(params, 'enabled', true)).toBe(false);
		expect(readBoolean(params, 'missing', true)).toBe(true);
	});
	it('removes defaults without losing unrelated parameters or a fragment', () => {
		const original = new URL('https://example.com/tools/rates?bps=10&utm_source=test#results');
		const next = withToolQuery(original, { bps: nonDefault(20, 20), crop: 'WHEAT', maxTool: false, fortune: 0 });
		expect(next.searchParams.has('bps')).toBe(false);
		expect(next.searchParams.get('utm_source')).toBe('test');
		expect(next.searchParams.get('maxTool')).toBe('false');
		expect(next.searchParams.get('fortune')).toBe('0');
		expect(next.hash).toBe('#results');
		expect(original.searchParams.get('bps')).toBe('10');
	});
});
