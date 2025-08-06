/*
    CLI script to remove explicit return types from TypeScript functions in generated API files.
    We want to directly use the return type of the customFetch function instead of the Orval-generated return type.
*/

import path from 'path';
import { Project, SyntaxKind, type ArrowFunction, type FunctionDeclaration, type MethodDeclaration } from 'ts-morph';

async function removeReturnTypesFromFile(filePath: string) {
	const project = new Project();
	const sourceFile = project.addSourceFileAtPath(filePath);

	console.log(`Analyzing ${path.basename(filePath)}...`);

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

	if (changesMade > 0) {
		await sourceFile.save();
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
