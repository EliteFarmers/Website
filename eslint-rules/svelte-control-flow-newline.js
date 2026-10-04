const closingTagByType = {
	SvelteIfBlock: '{/if}',
	SvelteEachBlock: '{/each}',
	SvelteKeyBlock: '{/key}',
	SvelteAwaitBlock: '{/await}',
	SvelteSnippetBlock: '{/snippet}',
};

function hasCodeBeforeOnLine(source, index) {
	const lineStart = source.lastIndexOf('\n', index - 1) + 1;
	return source.slice(lineStart, index).trim().length > 0;
}

export default {
	meta: {
		type: 'layout',
		fixable: 'whitespace',
		docs: {
			description: 'Require Svelte control-flow markers to occupy their own lines',
		},
		messages: {
			ownLine: 'Put Svelte control-flow markers and their contents on separate lines.',
		},
	},
	create(context) {
		const source = context.sourceCode.text;
		const checkBlock = (node, closingTag) => {
			const fixes = [];
			const [start] = node.range;
			const firstChild = node.children?.[0];
			if (firstChild) {
				const openingEnd = source.lastIndexOf('}', firstChild.range[0]);
				if (openingEnd >= start) {
					if (hasCodeBeforeOnLine(source, start))
						fixes.push((fixer) => fixer.insertTextBeforeRange([start, start], '\n'));
					const afterMarker = openingEnd + 1;
					const contentStart =
						firstChild.type === 'SvelteText'
							? afterMarker + source.slice(afterMarker, firstChild.range[1]).search(/\S/)
							: firstChild.range[0];
					if (contentStart >= afterMarker && !source.slice(afterMarker, contentStart).includes('\n')) {
						fixes.push((fixer) => fixer.insertTextAfterRange([openingEnd, openingEnd + 1], '\n'));
					}
				}
			}

			if (closingTag) {
				const closeStart = source.lastIndexOf('{/', node.range[1] - 1);
				if (
					closeStart >= start &&
					source.startsWith(closingTag, closeStart) &&
					hasCodeBeforeOnLine(source, closeStart)
				) {
					fixes.push((fixer) => fixer.insertTextBeforeRange([closeStart, closeStart], '\n'));
				}
			}

			if (fixes.length) {
				context.report({
					node,
					messageId: 'ownLine',
					fix(fixer) {
						return fixes.map((applyFix) => applyFix(fixer));
					},
				});
			}
		};

		const visitors = {};
		for (const [type, closingTag] of Object.entries(closingTagByType)) {
			visitors[type] = (node) => checkBlock(node, closingTag);
		}
		visitors.SvelteElseBlock = (node) => checkBlock(node, null);
		return visitors;
	},
};
