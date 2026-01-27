import 'dotenv/config';
import { defineConfig } from 'orval';

export default defineConfig({
	elite: {
		input: {
			target: process.env.ELITE_API_URL + '/openapi/v1.json',
		},
		output: {
			baseUrl: '${ELITE_API_URL}',
			client: 'fetch',
			target: './src/lib/api/client',
			schemas: './src/lib/api/schemas',
			namingConvention: 'PascalCase',
			override: {
				useBigInt: true,
				transformer: './src/lib/api/util/fetch-transformer.ts',
				mutator: {
					path: './src/lib/api/custom-fetch-placeholder.ts',
					name: 'customFetch',
				},
			},
		},
		hooks: {
			afterAllFilesWrite: {
				command: 'pnpm postprocess-api',
				injectGeneratedDirsAndFiles: false,
			},
		},
	},
	zod: {
		input: {
			target: process.env.ELITE_API_URL + '/openapi/v1.json',
		},
		output: {
			client: 'zod',
			target: './src/lib/api/client',
			fileExtension: '.zod.ts',
			namingConvention: 'PascalCase',
			override: {
				useBigInt: true,
				zod: {
					coerce: {
						param: ['boolean', 'bigint'],
						query: ['boolean', 'bigint'],
						body: ['boolean', 'bigint'],
						header: ['boolean', 'bigint'],
						response: ['boolean', 'bigint'],
					},
					generate: {
						param: true,
						body: true,
						response: false,
						query: true,
						header: true,
					},
				},
				transformer: './src/lib/api/util/zod-transformer.ts',
			},
		},
		hooks: {
			afterAllFilesWrite: {
				command: 'pnpm postprocess-zod',
				injectGeneratedDirsAndFiles: false,
			},
		},
	},
	strapi: {
		input: {
			target: process.env.PUBLIC_STRAPI_API_URL + '/openapi.json',
		},
		output: {
			client: 'zod',
			target: './src/lib/api/client',
			fileExtension: '.zod.ts',
			namingConvention: 'PascalCase',
		},
		hooks: {
			afterAllFilesWrite: {
				command: 'pnpm postprocess-cms',
				injectGeneratedDirsAndFiles: false,
			},
		},
	},
});
