/*
    CLI script to remove explicit return types from TypeScript functions in generated API files.
    We want to directly use the return type of the customFetch function instead of the Orval-generated return type.
*/

import path from 'path';
import { Project, SyntaxKind, type ArrowFunction, type FunctionDeclaration, type MethodDeclaration } from 'ts-morph';

const fileIoAttempts = 5;

async function removeReturnTypesFromFile(filePath: string, baseUrlEnvName = 'ELITE_API_URL') {
	console.log(`Analyzing ${path.basename(filePath)}...`);

	const project = new Project();
	const isZodProject = filePath.includes('.zod.');

	if (isZodProject) {
		if (filePath.includes('Cms')) {
			const zodFileContent = await retryFileOperation(() => project.getFileSystem().readFile(filePath), filePath);
			const updatedZodFileContent = zodFileContent.replace(
				/\.optional\(\)(?!\.nullable\(\))/g,
				'.optional().nullable()'
			);
			await retryFileOperation(
				() => project.getFileSystem().writeFile(filePath, updatedZodFileContent),
				filePath
			);
			console.log(`Updated .optional() to .optional().nullable() in ${path.basename(filePath)}.`);
		} else {
			// Remote functions don't like zod.coerce.boolean() without the type specified
			// zod.coerce.boolean() -> zod.coerce.boolean<boolean>()
			// Ensuring it works if there's a line breaks (ex: zod\n.coerce\n.boolean)
			const zodFileContent = await retryFileOperation(() => project.getFileSystem().readFile(filePath), filePath);
			const updatedZodFileContent = zodFileContent
				.replace(/\.coerce\s*\.\s*boolean\s*\(\s*\)/g, '.coerce.boolean<boolean>()')
				// Orval 8 applies the global PascalCase convention after our Zod prefix transformer.
				// Keep the established public names used by the Website (zodGetFoo, zodPostBar, ...).
				.replace(/\bZod(?=[A-Z])/g, 'zod');
			await retryFileOperation(
				() => project.getFileSystem().writeFile(filePath, updatedZodFileContent),
				filePath
			);
			console.log(`Updated zod.boolean() to zod.coerce.boolean<boolean>() in ${path.basename(filePath)}.`);
		}
		return;
	}

	// Find and replace text
	const cmsFileContent = await retryFileOperation(() => project.getFileSystem().readFile(filePath), filePath);
	const updatedCmsFileContent = cmsFileContent.replace('../custom-fetch-placeholder', '../custom-fetch');
	await retryFileOperation(() => project.getFileSystem().writeFile(filePath, updatedCmsFileContent), filePath);
	console.log(`Replaced custom-fetch-placeholder import in ${path.basename(filePath)}.`);

	const sourceFile = await retryFileOperation(async () => project.addSourceFileAtPath(filePath), filePath);

	const functionDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
	const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
	const methodDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);

	const allFunctions: (FunctionDeclaration | ArrowFunction | MethodDeclaration)[] = [
		...functionDeclarations,
		...arrowFunctions,
		...methodDeclarations,
	];

	let changesMade = 0;

	for (const func of allFunctions) {
		if (func.getReturnTypeNode()) {
			func.removeReturnType();
			changesMade++;
		}
	}

	for (const declaration of sourceFile.getImportDeclarations()) {
		if (declaration.getModuleSpecifierValue() === '$env/dynamic/private') {
			declaration.remove();
		}
	}
	for (const statement of sourceFile.getVariableStatements()) {
		if (statement.getText().includes(`{ ${baseUrlEnvName} } = env`)) {
			statement.remove();
		}
	}

	const importDeclaration = sourceFile.addImportDeclaration({
		namedImports: ['env'],
		moduleSpecifier: '$env/dynamic/private',
	});
	sourceFile.insertText(
		importDeclaration.getPos() + importDeclaration.getWidth() + 1,
		`\nconst { ${baseUrlEnvName} } = env;\n`
	);

	await retryFileOperation(() => sourceFile.save(), filePath);

	try {
		// Find and replace text in all files in src/lib/api/client/schemas directory
		const schemasProject = new Project();
		const schemasDir = path.join(path.dirname(filePath), '..', 'schemas');
		const schemaFiles = await retryFileOperation(
			async () => schemasProject.getFileSystem().readDirSync(schemasDir),
			schemasDir
		);
		for (const schemaFile of schemaFiles) {
			const schemaFilePath = schemaFile.name;

			const schemaFileContent = await retryFileOperation(
				() => schemasProject.getFileSystem().readFile(schemaFilePath),
				schemaFilePath
			);
			const schemaName = path.basename(schemaFilePath);
			let updatedSchemaFileContent = restoreStringEnumKeys(schemaFileContent);

			if (schemaName.includes('Request')) {
				updatedSchemaFileContent = updatedSchemaFileContent.replace(
					/\bbigint\b(?!\s*\|)/g,
					'number | string | bigint'
				);
			}

			if (updatedSchemaFileContent !== schemaFileContent) {
				await retryFileOperation(
					() => schemasProject.getFileSystem().writeFile(schemaFilePath, updatedSchemaFileContent),
					schemaFilePath
				);
			}
		}
	} catch (err) {
		console.error('Error processing schema files:', err);
		throw err;
	}

	if (changesMade > 0) {
		console.log(`✅ Successfully removed ${changesMade} return types and saved the file.`);
	} else {
		console.log('No explicit return types found to remove.');
	}
}

function restoreStringEnumKeys(content: string) {
	return content.replace(
		/(export const \w+ = \{\r?\n)([\s\S]*?)(\r?\n\} as const;)/g,
		(_enumDeclaration, start: string, body: string, end: string) => {
			const updatedBody = body.replace(
				/^(\s+)(?:[A-Za-z_$][\w$]*|'[^']*'|"[^"]*"):\s*(['"])([A-Za-z_$][\w$]*)\2(,?)$/gm,
				(_entry, indentation: string, quote: string, value: string, comma: string) =>
					`${indentation}${value}: ${quote}${value}${quote}${comma}`
			);
			return `${start}${updatedBody}${end}`;
		}
	);
}

async function retryFileOperation<T>(operation: () => Promise<T>, filePath: string): Promise<T> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= fileIoAttempts; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;
			if (attempt < fileIoAttempts) {
				await new Promise((resolve) => setTimeout(resolve, attempt * 50));
			}
		}
	}

	throw new Error(`Unable to process ${filePath} after ${fileIoAttempts} attempts.`, {
		cause: lastError,
	});
}

const args = process.argv.slice(2);
if (args.length < 1 || args.length > 2) {
	console.error('Usage: node remove-return-types.ts <path/to/your/file.ts> [BASE_URL_ENV_NAME]');
	process.exit(1);
}

const filePath = path.resolve(args[0]);
removeReturnTypesFromFile(filePath, args[1]).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
