/*
    CLI script to remove explicit return types from TypeScript functions in generated API files.
    We want to directly use the return type of the customFetch function instead of the Orval-generated return type.
*/

import path from 'path';
import { Project, SyntaxKind, type ArrowFunction, type FunctionDeclaration, type MethodDeclaration } from 'ts-morph';

async function removeReturnTypesFromFile(filePath: string) {
	console.log(`Analyzing ${path.basename(filePath)}...`);

	const project = new Project();

	// Run a regex replacement on filePath.replace('.ts', '.zod.ts') to change all zod.boolean() to zod.coerce.boolean<boolean>()
	if (filePath.includes('.zod.')) {
		if (filePath.includes('Cms')) {
			const zodFileContent = await project.getFileSystem().readFile(filePath);
			const updatedZodFileContent = zodFileContent.replace(/\.optional\(\)/g, '.optional().nullable()');
			await project.getFileSystem().writeFile(filePath, updatedZodFileContent);
			console.log(`Updated .optional() to .optional().nullable() in ${path.basename(filePath)}.`);
		} else {
			const zodFileContent = await project.getFileSystem().readFile(filePath);
			const updatedZodFileContent = zodFileContent.replace(/zod\.boolean\(\)/g, 'zod.coerce.boolean<boolean>()');
			await project.getFileSystem().writeFile(filePath, updatedZodFileContent);
			console.log(`Updated zod.boolean() to zod.coerce.boolean<boolean>() in ${path.basename(filePath)}.`);
		}

		return;
	}

	// Find and replace text
	const cmsFileContent = await project.getFileSystem().readFile(filePath);
	const updatedCmsFileContent = cmsFileContent.replace('../custom-fetch-placeholder', '../custom-fetch');
	await project.getFileSystem().writeFile(filePath, updatedCmsFileContent);
	console.log(`Replaced custom-fetch-placeholder import in ${path.basename(filePath)}.`);

	const sourceFile = project.addSourceFileAtPath(filePath);

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

	sourceFile.addImportDeclaration({
		namedImports: ['ELITE_API_URL'],
		moduleSpecifier: '$env/static/private',
	});
	console.log(`Added import for api URL.`);

	await sourceFile.save();

	if (changesMade > 0) {
		console.log(`✅ Successfully removed ${changesMade} return types and saved the file.`);
	} else {
		console.log('No explicit return types found to remove.');
	}
}

const args = process.argv.slice(2);
if (args.length !== 1) {
	console.error('Usage: node remove-return-types.ts <path/to/your/file.ts>');
	process.exit(1);
}

const filePath = path.resolve(args[0]);
removeReturnTypesFromFile(filePath).catch(console.error);
