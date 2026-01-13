import type {
	AccordionBlockNode,
	BlockGridBlockNode,
	BlockNode,
	CalloutBlockNode,
	CalloutVariant,
	CodeBlockNode,
	HeadingBlockNode,
	ImageBlockNode,
	InlineNode,
	ItemListBlockNode,
	ItemPriceBlockNode,
	ListBlockNode,
	ListItemBlockNode,
	ParagraphBlockNode,
	QuoteBlockNode,
	RecipeBlockNode,
	RootNode,
	SkyblockItemBlockNode,
	TableBlockNode,
	TextNode,
	TwoColumnBlockNode,
	YouTubeBlockNode,
} from '$comp/blocks/blocks';
import type { JSONContent } from '@tiptap/core';

export function tiptapToStrapi(content: JSONContent): RootNode {
	if (!content.content) return [];

	return content.content.map((node) => convertNode(node)).filter((node): node is BlockNode => node !== null);
}

function convertNode(node: JSONContent): BlockNode | null {
	switch (node.type) {
		case 'paragraph':
			return convertParagraph(node);
		case 'heading':
			return convertHeading(node);
		case 'blockquote':
			return convertQuote(node);
		case 'codeBlock':
			return convertCode(node);
		case 'image':
			return convertImage(node);
		case 'bulletList':
		case 'orderedList':
			return convertList(node);
		case 'skyblockItem':
			return convertSkyblockItem(node);
		case 'itemPrice':
			return convertItemPrice(node);
		case 'twoColumn':
			return convertTwoColumn(node);
		case 'youtube':
			return convertYouTube(node);
		case 'callout':
			return convertCallout(node);
		case 'accordion':
			return convertAccordion(node);
		case 'recipe':
			return convertRecipe(node);
		case 'itemList':
			return convertItemList(node);
		case 'table':
			return convertTable(node);
		case 'blockGrid':
			return convertBlockGrid(node);
		default:
			console.warn(`Unknown Tiptap node type: ${node.type}`);
			return null;
	}
}

function convertParagraph(node: JSONContent): ParagraphBlockNode {
	return {
		type: 'paragraph',
		children: convertInlineNodes(node.content),
	};
}

function convertHeading(node: JSONContent): HeadingBlockNode {
	return {
		type: 'heading',
		level: (node.attrs?.level as 1 | 2 | 3 | 4 | 5 | 6) || 1,
		children: convertInlineNodes(node.content),
	};
}

function convertQuote(node: JSONContent): QuoteBlockNode {
	return {
		type: 'quote',
		children: convertInlineNodes(node.content),
	};
}

function convertCode(node: JSONContent): CodeBlockNode {
	// Strapi code block expects TextNode[] children, usually just one
	const textContent = node.content?.map((c) => c.text || '').join('') || '';
	return {
		type: 'code',
		children: [
			{
				type: 'text',
				text: textContent,
			},
		],
	};
}

function convertImage(node: JSONContent): ImageBlockNode {
	return {
		type: 'image',
		image: {
			name: node.attrs?.alt || 'image',
			alternativeText: node.attrs?.alt,
			url: node.attrs?.src || '',
			caption: node.attrs?.title,
			// Defaults for required fields if missing
			hash: 'unknown',
			ext: 'unknown',
			mime: 'image/unknown',
			size: 0,
			provider: 'local',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			width: node.attrs?.width ? parseInt(node.attrs.width) : undefined,
			height: node.attrs?.height ? parseInt(node.attrs.height) : undefined,
		},
	};
}

function convertList(node: JSONContent): ListBlockNode {
	const children: (ListItemBlockNode | ListBlockNode)[] = [];

	(node.content || []).forEach((item) => {
		const converted = convertListItem(item);
		if (converted) {
			children.push(...converted);
		}
	});

	return {
		type: 'list',
		format: node.type === 'orderedList' ? 'ordered' : 'unordered',
		children,
	};
}

function convertListItem(node: JSONContent): (ListItemBlockNode | ListBlockNode)[] | null {
	if (node.type !== 'listItem') return null;

	const result: (ListItemBlockNode | ListBlockNode)[] = [];
	const inlineChildren: InlineNode[] = [];

	node.content?.forEach((child) => {
		if (child.type === 'paragraph') {
			inlineChildren.push(...convertInlineNodes(child.content));
		} else if (child.type === 'bulletList' || child.type === 'orderedList') {
			// Handle nested lists
			const nestedList = convertList(child);
			if (nestedList) {
				result.push(nestedList);
			}
		}
	});

	// Add the list item with inline content first
	if (inlineChildren.length > 0 || result.length === 0) {
		result.unshift({
			type: 'list-item',
			children: inlineChildren,
		});
	}

	return result;
}

function convertInlineNodes(nodes?: JSONContent[]): (InlineNode | SkyblockItemBlockNode)[] {
	if (!nodes) return [];
	return nodes
		.map((node) => convertInlineNode(node))
		.filter((n): n is InlineNode | SkyblockItemBlockNode => n !== null);
}

function convertInlineNode(node: JSONContent): InlineNode | SkyblockItemBlockNode | ItemPriceBlockNode | null {
	if (node.type === 'skyblockItem') {
		return convertSkyblockItem(node);
	}
	if (node.type === 'itemPrice') {
		return convertItemPrice(node);
	}
	if (node.type === 'text') {
		const textNode: TextNode = {
			type: 'text',
			text: node.text || '',
		};

		if (node.marks) {
			node.marks.forEach((mark) => {
				switch (mark.type) {
					case 'bold':
						textNode.bold = true;
						break;
					case 'italic':
						textNode.italic = true;
						break;
					case 'strike':
						textNode.strikethrough = true;
						break;
					case 'code':
						textNode.code = true;
						break;
					case 'underline':
						textNode.underline = true;
						break;
					case 'link':
						// Link marks are handled separately below
						break;
				}
			});
		}

		// Link marks require wrapping the text node in a LinkNode
		const linkMark = node.marks?.find((m) => m.type === 'link');
		if (linkMark) {
			return {
				type: 'link',
				url: linkMark.attrs?.href || '',
				children: [textNode], // Wrap the text node
			};
		}

		return textNode;
	}
	return null;
}

function convertSkyblockItem(node: JSONContent): SkyblockItemBlockNode {
	return {
		type: 'skyblock-item',
		skyblockId: node.attrs?.skyblockId || '',
		size: node.attrs?.size || 'md',
		inline: node.attrs?.inline !== false,
		pet: node.attrs?.pet === true,
	};
}

function convertItemPrice(node: JSONContent): ItemPriceBlockNode {
	return {
		type: 'item-price',
		skyblockId: node.attrs?.skyblockId || '',
		multiplier: node.attrs?.multiplier ?? 1,
	};
}

function convertTwoColumn(node: JSONContent): TwoColumnBlockNode {
	const leftColumn = node.content?.find((c) => c.type === 'columnLeft');
	const rightColumn = node.content?.find((c) => c.type === 'columnRight');

	return {
		type: 'two-column',
		variant: (node.attrs?.variant as 'plain' | 'bordered') || 'plain',
		left: leftColumn?.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
		right: rightColumn?.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
	};
}

function convertYouTube(node: JSONContent): YouTubeBlockNode {
	return {
		type: 'youtube',
		videoId: node.attrs?.videoId || '',
	};
}

function convertCallout(node: JSONContent): CalloutBlockNode {
	return {
		type: 'callout',
		variant: (node.attrs?.variant as CalloutVariant) || 'note',
		children: node.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
	};
}

function convertAccordion(node: JSONContent): AccordionBlockNode {
	return {
		type: 'accordion',
		title: (node.attrs?.title as string) || 'Click to expand',
		children: node.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
	};
}

function convertRecipe(node: JSONContent): RecipeBlockNode {
	return {
		type: 'recipe',
		grid: (node.attrs?.grid as RecipeBlockNode['grid']) || [],
		output: (node.attrs?.output as RecipeBlockNode['output']) || {},
	};
}

function convertItemList(node: JSONContent): ItemListBlockNode {
	return {
		type: 'item-list',
		items: (node.attrs?.items as ItemListBlockNode['items']) || [],
	};
}

function convertTable(node: JSONContent): TableBlockNode {
	if (!node.content) return { type: 'table', rows: 0, cols: 0, cells: [] };

	const cells: RootNode[][] = []; // Changed to RootNode[][]
	let cols = 0;

	// Wrapper for cell content to match tiptap structure expected by tiptapToStrapi (doc/root)
	// or manually map if tiptapToStrapi expects full doc
	node.content.forEach((row) => {
		if (row.type === 'tableRow' && row.content) {
			const rowData: RootNode[] = [];
			row.content.forEach((cell) => {
				// cell.content is BlockNode[] (JSONContent[])
				if (cell.content) {
					// tiptapToStrapi expects a JSONContent node like { content: [...] }
					rowData.push(tiptapToStrapi({ content: cell.content }));
				} else {
					rowData.push([]);
				}
			});
			cells.push(rowData);
			cols = Math.max(cols, rowData.length);
		}
	});

	return {
		type: 'table',
		rows: cells.length,
		cols,
		cells,
	};
}

function convertBlockGrid(node: JSONContent): BlockGridBlockNode {
	return {
		type: 'block-grid',
		rows: (node.attrs?.rows as number) || 3,
		cols: (node.attrs?.cols as number) || 3,
		cells: (node.attrs?.cells as BlockGridBlockNode['cells']) || [],
	};
}

export function strapiToTiptap(root: RootNode): JSONContent {
	return {
		type: 'doc',
		content: root.map((node) => convertBlockToTiptap(node)).filter((n): n is JSONContent => n !== null),
	};
}

function convertBlockToTiptap(node: BlockNode): JSONContent | null {
	switch (node.type) {
		case 'paragraph':
			return {
				type: 'paragraph',
				content: convertInlineToTiptap(node.children),
			};
		case 'heading':
			return {
				type: 'heading',
				attrs: { level: node.level },
				content: convertInlineToTiptap(node.children),
			};
		case 'quote':
			return {
				type: 'blockquote',
				content: [{ type: 'paragraph', content: convertInlineToTiptap(node.children) }], // Blockquote usually contains paragraphs in Tiptap
			};
		case 'code':
			return {
				type: 'codeBlock',
				content: node.children.map((c) => ({ type: 'text', text: c.text })),
			};
		case 'image':
			return {
				type: 'image',
				attrs: {
					src: node.image.url,
					alt: node.image.alternativeText,
					title: node.image.caption,
					width: node.image.width,
					height: node.image.height,
				},
			};
		case 'list':
			return {
				type: node.format === 'ordered' ? 'orderedList' : 'bulletList',
				content: node.children.map((item) => convertListChildToTiptap(item)),
			};
		case 'skyblock-item':
			return convertSkyblockItemToTiptap(node);
		case 'item-price':
			return {
				type: 'itemPrice',
				attrs: {
					skyblockId: node.skyblockId,
					multiplier: node.multiplier ?? 1,
				},
			};
		case 'two-column':
			return {
				type: 'twoColumn',
				attrs: { variant: node.variant || 'plain' },
				content: [
					{
						type: 'columnLeft',
						content: node.left
							.map((n) => convertBlockToTiptap(n))
							.filter((n): n is JSONContent => n !== null),
					},
					{
						type: 'columnRight',
						content: node.right
							.map((n) => convertBlockToTiptap(n))
							.filter((n): n is JSONContent => n !== null),
					},
				],
			};
		case 'youtube':
			return {
				type: 'youtube',
				attrs: { videoId: node.videoId },
			};
		case 'callout':
			return {
				type: 'callout',
				attrs: { variant: node.variant },
				content: node.children.map((n) => convertBlockToTiptap(n)).filter((n): n is JSONContent => n !== null),
			};
		case 'accordion':
			return {
				type: 'accordion',
				attrs: { title: node.title },
				content: node.children.map((n) => convertBlockToTiptap(n)).filter((n): n is JSONContent => n !== null),
			};
		case 'recipe':
			return {
				type: 'recipe',
				attrs: { grid: node.grid, output: node.output },
			};
		case 'item-list':
			return {
				type: 'itemList',
				attrs: { items: node.items },
			};
		case 'table':
			return {
				type: 'table',
				content: node.cells.map((row) => ({
					type: 'tableRow',
					content: row.map((cellContent) => {
						// cellContent is RootNode (BlockNode[])
						// strapiToTiptap returns { type: 'doc', content: [...] }
						// We need the content array for the tableCell
						const tiptapContent = strapiToTiptap(cellContent);
						return {
							type: 'tableCell',
							content: tiptapContent.content || [{ type: 'paragraph' }], // Ensure valid content
						};
					}),
				})),
			};
		case 'block-grid':
			return {
				type: 'blockGrid',
				attrs: { rows: node.rows, cols: node.cols, cells: node.cells },
			};
		default:
			return null;
	}
}

function convertListChildToTiptap(node: ListItemBlockNode | ListBlockNode): JSONContent {
	if (node.type === 'list') {
		// Nested list: wrap it in a listItem
		return {
			type: 'listItem',
			content: [convertBlockToTiptap(node)].filter((n): n is JSONContent => n !== null),
		};
	}
	return convertListItemToTiptap(node);
}

function convertListItemToTiptap(node: ListItemBlockNode): JSONContent {
	return {
		type: 'listItem',
		content: [
			{
				type: 'paragraph',
				content: convertInlineToTiptap(node.children),
			},
		],
	};
}

function convertSkyblockItemToTiptap(node: SkyblockItemBlockNode): JSONContent {
	return {
		type: 'skyblockItem',
		attrs: {
			skyblockId: node.skyblockId,
			size: node.size,
			inline: node.inline,
			pet: node.pet,
		},
	};
}

function convertInlineToTiptap(nodes: InlineNode[]): JSONContent[] {
	const results: JSONContent[] = [];

	for (const node of nodes) {
		if (node.type === 'text') {
			const marks: { type: string; attrs?: Record<string, unknown> }[] = [];
			if (node.bold) marks.push({ type: 'bold' });
			if (node.italic) marks.push({ type: 'italic' });
			if (node.strikethrough) marks.push({ type: 'strike' });
			if (node.code) marks.push({ type: 'code' });
			if (node.underline) marks.push({ type: 'underline' });

			results.push({
				type: 'text',
				text: node.text,
				marks: marks.length ? marks : undefined,
			});
		} else if (node.type === 'link') {
			// Flatten children (text nodes) and apply link mark
			for (const child of node.children) {
				if (child.type === 'text') {
					const marks: { type: string; attrs?: Record<string, unknown> }[] = [
						{ type: 'link', attrs: { href: node.url } },
					];
					if (child.bold) marks.push({ type: 'bold' });
					if (child.italic) marks.push({ type: 'italic' });
					if (child.strikethrough) marks.push({ type: 'strike' });
					if (child.code) marks.push({ type: 'code' });

					results.push({
						type: 'text',
						text: child.text,
						marks,
					});
				}
			}
		} else if (node.type === 'skyblock-item') {
			results.push(convertSkyblockItemToTiptap(node));
		} else if (node.type === 'item-price') {
			results.push({
				type: 'itemPrice',
				attrs: {
					skyblockId: node.skyblockId,
					multiplier: node.multiplier ?? 1,
				},
			});
		}
	}

	return results;
}
