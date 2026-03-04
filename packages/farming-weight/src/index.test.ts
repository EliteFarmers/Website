import madge from 'madge';
import { expect, test } from 'vitest';

test('Circular dependencies', () => {
	madge('./src', {
		fileExtensions: ['ts'],
		tsConfig: './tsconfig.json',
		dependencyFilter: (dependency) => {
			// Ignore test files and node_modules
			return (
				!dependency.includes('test') && !dependency.includes('node_modules') && !dependency.includes('dist/')
			);
		},
		detectiveOptions: {
			ts: {
				skipTypeImports: true,
			},
		},
	}).then((res) => {
		const circular = res.circular();
		expect(circular).toStrictEqual([]);
	});
});
