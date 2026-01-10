// Editor events for communication between node views and Editor component
// Using CustomEvents on window for simplicity since node views are mounted outside the component tree

export interface EditSkyblockItemEvent {
	skyblockId: string;
	size: 'sm' | 'md' | 'lg';
	inline: boolean;
	pos: number;
}

export interface EditItemPriceEvent {
	skyblockId: string;
	multiplier: number;
	pos: number;
}

export function dispatchEditSkyblockItem(data: EditSkyblockItemEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-skyblock-item', { detail: data }));
}

export function dispatchEditItemPrice(data: EditItemPriceEvent) {
	window.dispatchEvent(new CustomEvent('editor:edit-item-price', { detail: data }));
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
