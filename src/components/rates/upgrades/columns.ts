import { renderComponent, renderSnippet } from '$ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import UpgradeTitle from './upgrade-title.svelte';
import DataTableColumnHeader from './data-table-column-header.svelte';
import type { FortuneUpgrade } from 'farming-weight';
import UpgradeFortune from './upgrade-fortune.svelte';
import type { components } from '$lib/api/api';
import UpgradeCost from './upgrade-cost.svelte';

const amountCellSnippet = createRawSnippet<[[FortuneUpgrade, number]]>((getUpgrade) => {
	const [upgrade, amount] = getUpgrade();
	const increase = upgrade.increase || upgrade.max || 0;
	let costPer = increase > 0 ? Math.round(amount / increase) : 0;

	if (costPer === 0) {
		costPer = (upgrade.max ?? increase) > 0 ? Math.round(amount / (upgrade.max ?? increase)) : 0;
	}

	return {
		render: () =>
			`<span><span class="text-right font-semibold dark:text-completed">${Math.round(costPer).toLocaleString()}</span><span class="text-muted-foreground"> coins</span></span>`,
	};
});

export const getColumns = (
	itemsLookup?: components['schemas']['GetSpecifiedSkyblockItemsResponse']['items'],
	costFn?: (
		upgrade: FortuneUpgrade,
		items?: components['schemas']['GetSpecifiedSkyblockItemsResponse']['items']
	) => number
) =>
	[
		{
			id: 'title',
			accessorKey: 'title',
			header: 'Upgrade',
			cell: ({ row }) => {
				return renderComponent(UpgradeTitle, { upgrade: row.original });
			},
		},
		{
			id: 'increase',
			accessorKey: 'increase',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
					column,
					title: 'Fortune',
				}),
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(UpgradeFortune, { upgrade: row.original });
			},
		},
		{
			accessorKey: 'costper',
			accessorFn: (row) => {
				if (costFn) {
					const increase = row.increase || row.max || 0;
					return increase > 0 ? Math.round(costFn(row, itemsLookup) / increase) : 0;
				}
				return 0;
			},
			cell: ({ row }) => {
				return renderSnippet(amountCellSnippet, [
					row.original,
					costFn ? costFn(row.original, itemsLookup) : 0,
				] as [FortuneUpgrade, number]);
			},
			enableSorting: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
					column,
					title: 'Cost Per Fortune',
				}),
		},
		{
			accessorKey: 'cost',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
					column,
					title: 'Cost',
					class: 'justify-end',
				}),
			cell: ({ row }) =>
				renderComponent(UpgradeCost, {
					upgrade: row.original,
					items: itemsLookup,
					totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
				}),
			enableSorting: true,
			accessorFn: (row) => {
				if (costFn) {
					return costFn(row, itemsLookup);
				}
				return 0;
			},
		},
	] as ColumnDef<FortuneUpgrade>[];
