import { Extension } from '@tiptap/core';

const blockIdNodeTypes = [
	'paragraph',
	'heading',
	'blockquote',
	'codeBlock',
	'image',
	'litematic',
	'bulletList',
	'orderedList',
	'listItem',
	'skyblockItem',
	'itemPrice',
	'twoColumn',
	'youtube',
	'callout',
	'accordion',
	'recipe',
	'itemList',
	'credits',
	'wikiLink',
	'table',
	'blockGrid',
];

export const BlockId = Extension.create({
	name: 'blockId',

	addGlobalAttributes() {
		return [
			{
				types: blockIdNodeTypes,
				attributes: {
					blockId: {
						default: null,
						parseHTML: (element) => element.getAttribute('data-block-id'),
						renderHTML: (attributes) =>
							typeof attributes.blockId === 'string' && attributes.blockId
								? { 'data-block-id': attributes.blockId }
								: {},
					},
				},
			},
		];
	},
});
