const propertyName = /^(?:--[a-zA-Z0-9_-]+|[a-zA-Z][a-zA-Z0-9-]*)$/;
const inheritedProperties = new Set([
	'color',
	'font',
	'line-height',
	'letter-spacing',
	'word-spacing',
	'text-align',
	'text-transform',
	'text-shadow',
	'direction',
]);

/** Only inherited styling belongs on an overlay, never the page's layout or background image. */
export function pageThemeCss(properties: Record<string, string> = {}, inheritedOnly = false): string {
	return Object.entries(properties)
		.filter(
			([property]) =>
				propertyName.test(property) &&
				(!inheritedOnly ||
					property.startsWith('--') ||
					property.startsWith('font-') ||
					inheritedProperties.has(property))
		)
		.map(([property, value]) => `${property}:${value}`)
		.join(';');
}

/** Missing and inherited styles retain the viewer's theme. */
export function pageBaseTheme(value?: string | null): 'light' | 'dark' | undefined {
	return value === 'light' || value === 'dark' ? value : undefined;
}
