import type { RatesItemPriceData } from '$lib/api/elite';
import { renderComponent } from '$ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import type { FortuneUpgrade } from 'farming-weight';
import DataTableColumnHeader from './data-table-column-header.svelte';
import UpgradeCostPer from './upgrade-cost-per.svelte';
import UpgradeCost from './upgrade-cost.svelte';
import UpgradeFortune from './upgrade-fortune.svelte';
import UpgradeTitle from './upgrade-title.svelte';

export const getColumns = (
	itemsLookup?: RatesItemPriceData,
	costFn?: (upgrade: FortuneUpgrade, items?: RatesItemPriceData) => number
) =>
	[
		{
			id: 'title',
			accessorKey: 'title',
			header: 'Upgrade',
			cell: ({ row }) => {
				return renderComponent(UpgradeTitle, { upgrade: row.original, items: itemsLookup });
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
				return renderComponent(UpgradeCostPer, {
					upgrade: row.original,
					totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
				});
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
