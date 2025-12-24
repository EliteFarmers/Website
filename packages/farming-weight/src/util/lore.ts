export function extractNumberFromLine(line: string, regex: RegExp) {
	const match = regex.exec(line);
	if (!match?.length || !match[1]) return;

	const found = +match[1].replaceAll(',', '');
	if (isNaN(found)) return;

	return found;
}

export function getNumberFromMatchingLine(lines: string[], regex: RegExp) {
	for (const line of lines) {
		const found = extractNumberFromLine(line, regex);
		if (found) return found;
	}
	return undefined;
}
