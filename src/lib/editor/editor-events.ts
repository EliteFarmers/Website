// Editor events for communication between node views and Editor component
// Using CustomEvents on window for simplicity since node views are mounted outside the component tree

import type { BlockGridCell, ItemListItem, RecipeSlot } from '$comp/blocks/blocks';

export interface EditSkyblockItemEvent {
	skyblockId: string;
	size: 'sm' | 'md' | 'lg';
	inline: boolean;
	pet: boolean;
	pos: number;
}

export interface EditItemPriceEvent {
	skyblockId: string;
	multiplier: number;
	pos: number;
}

export interface EditRecipeEvent {
	grid: RecipeSlot[];
	output: RecipeSlot;
	pos: number;
}

export interface EditItemListEvent {
	items: ItemListItem[];
	pos: number;
}

export interface EditAccordionEvent {
	title: string;
	pos: number;
}

export interface EditTableEvent {
	rows: number;
	cols: number;
	cells: string[][];
	pos: number;
}

export interface EditBlockGridEvent {
	rows: number;
	cols: number;
	cells: BlockGridCell[][];
	pos: number;
}

export function dispatchEditSkyblockItem(data: EditSkyblockItemEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-skyblock-item', { detail: data }));
}

export function dispatchEditItemPrice(data: EditItemPriceEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-item-price', { detail: data }));
}

export function dispatchEditRecipe(data: EditRecipeEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-recipe', { detail: data }));
}

export function dispatchEditItemList(data: EditItemListEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-item-list', { detail: data }));
}

export function dispatchEditTable(data: EditTableEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-table', { detail: data }));
}

export function dispatchEditBlockGrid(data: EditBlockGridEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-block-grid', { detail: data }));
}

export function dispatchEditAccordion(data: EditAccordionEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-accordion', { detail: data }));
}

export function onEditSkyblockItem(handler: (data: EditSkyblockItemEvent) => void): () => void {
	const listener = (e: Event) => handler((e as CustomEvent<EditSkyblockItemEvent>).detail);
	window.addEventListener('editor:edit-skyblock-item', listener);
	return () => window.removeEventListener('editor:edit-skyblock-item', listener);
}

export function onEditItemPrice(handler: (data: EditItemPriceEvent) => void): () => void {
	const listener = (e: Event) => handler((e as CustomEvent<EditItemPriceEvent>).detail);
	window.addEventListener('editor:edit-item-price', listener);
	return () => window.removeEventListener('editor:edit-item-price', listener);
}

export function onEditRecipe(handler: (data: EditRecipeEvent) => void): () => void {
	const listener = (e: Event) => handler((e as CustomEvent<EditRecipeEvent>).detail);
	window.addEventListener('editor:edit-recipe', listener);
	return () => window.removeEventListener('editor:edit-recipe', listener);
}

export function onEditItemList(handler: (data: EditItemListEvent) => void): () => void {
	const listener = (e: Event) => handler((e as CustomEvent<EditItemListEvent>).detail);
	window.addEventListener('editor:edit-item-list', listener);
	return () => window.removeEventListener('editor:edit-item-list', listener);
}

export function onEditTable(handler: (data: EditTableEvent) => void): () => void {
	const listener = (e: Event) => handler((e as CustomEvent<EditTableEvent>).detail);
	window.addEventListener('editor:edit-table', listener);
	return () => window.removeEventListener('editor:edit-table', listener);
}

export function onEditBlockGrid(handler: (data: EditBlockGridEvent) => void): () => void {
	const listener = (e: Event) => handler((e as CustomEvent<EditBlockGridEvent>).detail);
	window.addEventListener('editor:edit-block-grid', listener);
	return () => window.removeEventListener('editor:edit-block-grid', listener);
}

export function onEditAccordion(handler: (data: EditAccordionEvent) => void): () => void {
	const listener = (e: Event) => handler((e as CustomEvent<EditAccordionEvent>).detail);
	window.addEventListener('editor:edit-accordion', listener);
	return () => window.removeEventListener('editor:edit-accordion', listener);
}
