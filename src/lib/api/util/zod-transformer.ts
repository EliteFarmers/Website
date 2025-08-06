import type { GeneratorVerbOptions } from 'orval';

export default function zodTransformer(options: GeneratorVerbOptions): GeneratorVerbOptions {
	options.operationId = addZodPrefix(options.operationId);
	options.operationName = addZodPrefix(options.operationName);

	return options;
}

function addZodPrefix(name: string): string {
	return `zod${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}
