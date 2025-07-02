import { renderComponent } from '$ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableColumnHeader from './data-table-column-header.svelte';
import type { components } from '$lib/api/api';
import RankTitle from './rank-title.svelte';

export type LbRanking = components['schemas']['LeaderboardRanksResponse']['ranks'][number] & { id: string };
export type LbList = (typeof import('$lib/servercache').cache)['leaderboards'];

export const getColumns = (ranks: LbRanking[], leaderboards?: LbList) =>
	[
		{
			id: 'title',
			accessorKey: 'title',
			header: 'Leaderboard',
			cell: ({ row }) => {
				return renderComponent(RankTitle, { rank: row.original, leaderboards });
			},
		},
		{
			id: 'amount',
			accessorKey: 'amount',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<LbRanking, unknown>, {
					column,
					title: 'Amount',
				}),
			enableSorting: true,
			// cell: ({ row }) => {
			// 	return renderComponent(UpgradeFortune, { upgrade: row.original });
			// },
		},
		{
			id: 'rank',
			accessorKey: 'rank',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader<LbRanking, unknown>, {
					column,
					title: 'Rank',
				}),
			enableSorting: true,
			// cell: ({ row }) => {
			// 	return renderComponent(UpgradeFortune, { upgrade: row.original });
			// },
		},
		// {
		// 	accessorKey: 'costper',
		// 	accessorFn: (row) => {
		// 		if (costFn) {
		// 			const increase = row.increase || row.max || 0;
		// 			return increase > 0 ? Math.round(costFn(row, itemsLookup) / increase) : 0;
		// 		}
		// 		return 0;
		// 	},
		// 	cell: ({ row }) => {
		// 		return renderComponent(UpgradeCostPer, {
		// 			upgrade: row.original,
		// 			totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
		// 		});
		// 	},
		// 	enableSorting: true,
		// 	header: ({ column }) =>
		// 		renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
		// 			column,
		// 			title: 'Cost Per Fortune',
		// 		}),
		// },
		// {
		// 	accessorKey: 'cost',
		// 	header: ({ column }) =>
		// 		renderComponent(DataTableColumnHeader<FortuneUpgrade, unknown>, {
		// 			column,
		// 			title: 'Cost',
		// 			class: 'justify-end',
		// 		}),
		// 	cell: ({ row }) =>
		// 		renderComponent(UpgradeCost, {
		// 			upgrade: row.original,
		// 			items: itemsLookup,
		// 			totalCost: costFn ? costFn(row.original, itemsLookup) : 0,
		// 		}),
		// 	enableSorting: true,
		// 	accessorFn: (row) => {
		// 		if (costFn) {
		// 			return costFn(row, itemsLookup);
		// 		}
		// 		return 0;
		// 	},
		// },
	] as ColumnDef<LbRanking>[];
