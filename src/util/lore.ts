export function ExtractNumberFromLine(line: string, regex: RegExp) {
	const match = regex.exec(line);
	if (!match?.length || !match[1]) return;

	const found = +match[1];
	if (isNaN(found)) return;

	return found;
}
