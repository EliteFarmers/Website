import 'dotenv/config';
import { defineConfig } from 'orval';

export default defineConfig({
	elite: {
		input: {
			target: process.env.ELITE_API_URL + '/openapi/v1.json',
		},
		output: {
			baseUrl: process.env.ELITE_API_URL,
			client: 'fetch',
			target: './src/lib/api/endpoints',
			schemas: './src/lib/api/schemas',
			namingConvention: 'PascalCase',
			// Split generated files by tags.
			// mode: 'tags-split',

			override: {
				useBigInt: true,
				mutator: {
					path: './src/lib/api/custom-fetch.ts',
					name: 'customFetch',
				},
			},
		},
		hooks: {
			// A post-generation hook to run a linter/formatter on the generated files.
			afterAllFilesWrite: 'pnpm prettier --write',
		},
	},
	zod: {
		input: {
			target: process.env.ELITE_API_URL + '/openapi/v1.json',
		},
		output: {
			baseUrl: process.env.ELITE_API_URL,

			client: 'zod',
			target: './src/lib/api/endpoints',
			fileExtension: '.zod.ts',
			namingConvention: 'PascalCase',
			// Split generated files by tags.
			// mode: 'tags-split',

			override: {
				useBigInt: true,
				transformer: './src/lib/api/zod-transformer.ts',
			},
		},
		hooks: {
			// A post-generation hook to run a linter/formatter on the generated files.
			afterAllFilesWrite: 'pnpm prettier --write',
		},
	},
});
