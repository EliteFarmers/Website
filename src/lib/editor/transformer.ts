import type {
	AccordionBlockNode,
	BlockGridBlockNode,
	BlockNode,
	CreditsBlockNode,
	CalloutBlockNode,
	CalloutVariant,
	CodeBlockNode,
	HeadingBlockNode,
	ImageBlockNode,
	InlineNode,
	ItemListBlockNode,
	ItemPriceBlockNode,
	LitematicBlockNode,
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
	WikiLinkInlineNode,
	YouTubeBlockNode,
} from '$comp/blocks/blocks';
import { ensureGuideBlockIds } from '$lib/guides/block-ids';
import { getLargestImageSourceUrl } from '$lib/guides/responsive-images';
import { normalizeWikiLinkUrl } from '$lib/guides/wiki-links';
import type { JSONContent } from '@tiptap/core';

export function tiptapToStrapi(content: JSONContent): RootNode {
	if (!content.content) return [];

	return ensureGuideBlockIds(
		content.content.map((node) => convertNode(node)).filter((node): node is BlockNode => node !== null)
	);
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
		case 'litematic':
			return convertLitematic(node);
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
		case 'credits':
			return convertCredits(node);
		case 'table':
			return convertTable(node);
		case 'blockGrid':
			return convertBlockGrid(node);
		default:
			console.warn(`Unknown Tiptap node type: ${node.type}`);
			return null;
	}
}

function readBlockId(node: JSONContent) {
	return typeof node.attrs?.blockId === 'string' && node.attrs.blockId ? node.attrs.blockId : undefined;
}

function attrsWithBlockId(node: BlockNode, attrs: Record<string, unknown> = {}) {
	return node.id ? { ...attrs, blockId: node.id } : attrs;
}

function convertParagraph(node: JSONContent): ParagraphBlockNode {
	return {
		id: readBlockId(node),
		type: 'paragraph',
		children: convertInlineNodes(node.content),
	};
}

function convertHeading(node: JSONContent): HeadingBlockNode {
	return {
		id: readBlockId(node),
		type: 'heading',
		level: (node.attrs?.level as 1 | 2 | 3 | 4 | 5 | 6) || 1,
		children: convertInlineNodes(node.content),
	};
}

function convertQuote(node: JSONContent): QuoteBlockNode {
	return {
		id: readBlockId(node),
		type: 'quote',
		children: convertInlineNodes(node.content),
	};
}

function convertCode(node: JSONContent): CodeBlockNode {
	// Strapi code block expects TextNode[] children, usually just one
	const textContent = node.content?.map((c) => c.text || '').join('') || '';
	return {
		id: readBlockId(node),
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
		id: readBlockId(node),
		type: 'image',
		image: {
			assetId: node.attrs?.assetId,
			name: node.attrs?.alt || 'image',
			alternativeText: node.attrs?.alt,
			url: node.attrs?.src || '',
			caption: node.attrs?.title,
			displaySize: node.attrs?.displaySize as ImageBlockNode['image']['displaySize'],
			align: node.attrs?.align as ImageBlockNode['image']['align'],
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
			sources: node.attrs?.sources as ImageBlockNode['image']['sources'],
		},
	};
}

function convertLitematic(node: JSONContent): LitematicBlockNode {
	return {
		id: readBlockId(node),
		type: 'litematic',
		assetId: node.attrs?.assetId || '',
		fileName: node.attrs?.fileName || '',
		downloadUrl: node.attrs?.downloadUrl || '',
		name: node.attrs?.name,
		author: node.attrs?.author,
		width: node.attrs?.width,
		height: node.attrs?.height,
		length: node.attrs?.length,
		regionCount: node.attrs?.regionCount ?? 0,
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
		id: readBlockId(node),
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
			id: readBlockId(node),
			type: 'list-item',
			children: inlineChildren,
		});
	}

	return result;
}

function convertInlineNodes(nodes?: JSONContent[]): InlineNode[] {
	if (!nodes) return [];
	return nodes.map((node) => convertInlineNode(node)).filter((n): n is InlineNode => n !== null);
}

function convertInlineNode(node: JSONContent): InlineNode | null {
	if (node.type === 'skyblockItem') {
		return convertSkyblockItem(node);
	}
	if (node.type === 'itemPrice') {
		return convertItemPrice(node);
	}
	if (node.type === 'wikiLink') {
		return convertWikiLinkInline(node);
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
		id: readBlockId(node),
		type: 'skyblock-item',
		skyblockId: node.attrs?.skyblockId || '',
		size: node.attrs?.size || 'md',
		inline: node.attrs?.inline !== false,
		pet: node.attrs?.pet === true,
	};
}

function convertItemPrice(node: JSONContent): ItemPriceBlockNode {
	return {
		id: readBlockId(node),
		type: 'item-price',
		skyblockId: node.attrs?.skyblockId || '',
		multiplier: node.attrs?.multiplier ?? 1,
	};
}

function convertTwoColumn(node: JSONContent): TwoColumnBlockNode {
	const leftColumn = node.content?.find((c) => c.type === 'columnLeft');
	const rightColumn = node.content?.find((c) => c.type === 'columnRight');

	return {
		id: readBlockId(node),
		type: 'two-column',
		variant: (node.attrs?.variant as 'plain' | 'bordered') || 'plain',
		left: leftColumn?.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
		right: rightColumn?.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
	};
}

function convertYouTube(node: JSONContent): YouTubeBlockNode {
	return {
		id: readBlockId(node),
		type: 'youtube',
		videoId: node.attrs?.videoId || '',
	};
}

function convertCallout(node: JSONContent): CalloutBlockNode {
	return {
		id: readBlockId(node),
		type: 'callout',
		variant: (node.attrs?.variant as CalloutVariant) || 'note',
		children: node.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
	};
}

function convertAccordion(node: JSONContent): AccordionBlockNode {
	return {
		id: readBlockId(node),
		type: 'accordion',
		title: (node.attrs?.title as string) || 'Click to expand',
		children: node.content?.map((n) => convertNode(n)).filter((n): n is BlockNode => n !== null) ?? [],
	};
}

function convertRecipe(node: JSONContent): RecipeBlockNode {
	return {
		id: readBlockId(node),
		type: 'recipe',
		grid: (node.attrs?.grid as RecipeBlockNode['grid']) || [],
		output: (node.attrs?.output as RecipeBlockNode['output']) || {},
	};
}

function convertItemList(node: JSONContent): ItemListBlockNode {
	return {
		id: readBlockId(node),
		type: 'item-list',
		items: (node.attrs?.items as ItemListBlockNode['items']) || [],
	};
}

function convertCredits(node: JSONContent): CreditsBlockNode {
	return {
		id: readBlockId(node),
		type: 'credits',
		entries: (node.attrs?.entries as CreditsBlockNode['entries']) || [],
	};
}

function convertWikiLinkInline(node: JSONContent): WikiLinkInlineNode {
	const normalized = normalizeWikiLinkUrl((node.attrs?.url as string) || '');
	return {
		type: 'wiki-link',
		url: normalized?.url || ((node.attrs?.url as string) ?? ''),
		pageName: (node.attrs?.pageName as string) || normalized?.pageName || 'Wiki link',
	};
}

function convertTable(node: JSONContent): TableBlockNode {
	if (!node.content) return { id: readBlockId(node), type: 'table', rows: 0, cols: 0, cells: [] };

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
		id: readBlockId(node),
		type: 'table',
		rows: cells.length,
		cols,
		cells,
	};
}

function convertBlockGrid(node: JSONContent): BlockGridBlockNode {
	return {
		id: readBlockId(node),
		type: 'block-grid',
		rows: (node.attrs?.rows as number) || 3,
		cols: (node.attrs?.cols as number) || 3,
		cells: (node.attrs?.cells as BlockGridBlockNode['cells']) || [],
	};
}

export function strapiToTiptap(root: RootNode): JSONContent {
	const content = ensureGuideBlockIds(root);
	return {
		type: 'doc',
		content: content.map((node) => convertBlockToTiptap(node)).filter((n): n is JSONContent => n !== null),
	};
}

function convertBlockToTiptap(node: BlockNode): JSONContent | null {
	switch (node.type) {
		case 'paragraph':
			return {
				type: 'paragraph',
				attrs: attrsWithBlockId(node),
				content: convertInlineToTiptap(node.children),
			};
		case 'heading':
			return {
				type: 'heading',
				attrs: attrsWithBlockId(node, { level: node.level }),
				content: convertInlineToTiptap(node.children),
			};
		case 'quote':
			return {
				type: 'blockquote',
				attrs: attrsWithBlockId(node),
				content: [{ type: 'paragraph', content: convertInlineToTiptap(node.children) }], // Blockquote usually contains paragraphs in Tiptap
			};
		case 'code':
			return {
				type: 'codeBlock',
				attrs: attrsWithBlockId(node),
				content: node.children.map((c) => ({ type: 'text', text: c.text })),
			};
		case 'image':
			return {
				type: 'image',
				attrs: attrsWithBlockId(node, {
					src: getLargestImageSourceUrl(node.image.sources) ?? node.image.url,
					alt: node.image.alternativeText,
					title: node.image.caption,
					displaySize: node.image.displaySize,
					align: node.image.align,
					width: node.image.width,
					height: node.image.height,
					assetId: node.image.assetId,
					sources: node.image.sources,
				}),
			};
		case 'litematic':
			return {
				type: 'litematic',
				attrs: attrsWithBlockId(node, {
					assetId: node.assetId,
					fileName: node.fileName,
					downloadUrl: node.downloadUrl,
					name: node.name,
					author: node.author,
					width: node.width,
					height: node.height,
					length: node.length,
					regionCount: node.regionCount,
				}),
			};
		case 'list':
			return {
				type: node.format === 'ordered' ? 'orderedList' : 'bulletList',
				attrs: attrsWithBlockId(node),
				content: node.children.map((item) => convertListChildToTiptap(item)),
			};
		case 'skyblock-item':
			return convertSkyblockItemToTiptap(node);
		case 'item-price':
			return {
				type: 'itemPrice',
				attrs: attrsWithBlockId(node, {
					skyblockId: node.skyblockId,
					multiplier: node.multiplier ?? 1,
				}),
			};
		case 'two-column':
			return {
				type: 'twoColumn',
				attrs: attrsWithBlockId(node, { variant: node.variant || 'plain' }),
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
				attrs: attrsWithBlockId(node, { videoId: node.videoId }),
			};
		case 'callout':
			return {
				type: 'callout',
				attrs: attrsWithBlockId(node, { variant: node.variant }),
				content: node.children.map((n) => convertBlockToTiptap(n)).filter((n): n is JSONContent => n !== null),
			};
		case 'accordion':
			return {
				type: 'accordion',
				attrs: attrsWithBlockId(node, { title: node.title }),
				content: node.children.map((n) => convertBlockToTiptap(n)).filter((n): n is JSONContent => n !== null),
			};
		case 'recipe':
			return {
				type: 'recipe',
				attrs: attrsWithBlockId(node, { grid: node.grid, output: node.output }),
			};
		case 'item-list':
			return {
				type: 'itemList',
				attrs: attrsWithBlockId(node, { items: node.items }),
			};
		case 'credits':
			return {
				type: 'credits',
				attrs: attrsWithBlockId(node, { entries: node.entries }),
			};
		case 'table':
			return {
				type: 'table',
				attrs: attrsWithBlockId(node),
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
				attrs: attrsWithBlockId(node, { rows: node.rows, cols: node.cols, cells: node.cells }),
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
		attrs: attrsWithBlockId(node),
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
		attrs: attrsWithBlockId(node, {
			skyblockId: node.skyblockId,
			size: node.size,
			inline: node.inline,
			pet: node.pet,
		}),
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
				attrs: attrsWithBlockId(node, {
					skyblockId: node.skyblockId,
					multiplier: node.multiplier ?? 1,
				}),
			});
		} else if (node.type === 'wiki-link') {
			results.push(convertWikiLinkToTiptap(node));
		}
	}

	return results;
}

function convertWikiLinkToTiptap(node: WikiLinkInlineNode): JSONContent {
	return {
		type: 'wikiLink',
		attrs: {
			url: node.url,
			pageName: node.pageName,
		},
	};
}
