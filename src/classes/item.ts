export interface Item {
	id?: number | null;
	count?: number | null;
	skyblockId?: string | null;
	uuid?: string | null;
	name?: string | null;
	lore?: string[] | null;
	enchantments?: {
		[key: string]: number | null;
	} | null;
	attributes?: {
		[key: string]: string | null;
	} | null;
}
