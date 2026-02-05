import type { GeneratorVerbOptions } from 'orval';

/**
 * Transforms the fetch options to allow for string or number types in url parameters.
 * @param options The original fetch options.
 * @returns The transformed fetch options.
 */
export default function fetchTransformer(options: GeneratorVerbOptions): GeneratorVerbOptions {
	for (const param of options.props) {
		if (param.definition.endsWith(': number')) {
			param.definition = param.definition.replace(': number', ': string | number');
			param.implementation = param.definition;
		}

		if (param.definition.endsWith(': bigint')) {
			param.definition = param.definition.replace(': bigint', ': string | bigint | number');
			param.implementation = param.definition;
		}
	}

	return options;
}
