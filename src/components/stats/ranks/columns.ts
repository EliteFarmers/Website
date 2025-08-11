import type { LeaderboardRanksResponse } from '$lib/api';
import { renderComponent } from '$ui/data-table';
import Calendar from '@lucide/svelte/icons/calendar';
import SquareActivity from '@lucide/svelte/icons/square-activity';
import type { ColumnDef } from '@tanstack/table-core';
import DataTableColumnHeader from './data-table-column-header.svelte';

export type LbRanking = LeaderboardRanksResponse['ranks'][number] & {
	id: string;
	interval: 'none' | 'monthly';
};
export type LbList = (typeof import('$lib/servercache').cache)['leaderboards'];

export let categories = [{ value: 'General', label: 'General' }];

export const getColumns = (leaderboards?: LbList) => {
	categories = Object.keys(leaderboards?.categories ?? {}).map((c) => ({
		value: c,
		label: c,
	}));
	return [
		{
			id: 'title',
			accessorKey: 'title',
			header: null,
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
		{
			id: 'interval',
			accessorKey: 'interval',
			header: null,
			enableSorting: true,
		},
		{
			id: 'category',
			accessorFn: (row) => {
				const leaderboard = leaderboards?.leaderboards[row.id];
				return leaderboard?.category || 'General';
			},
			header: null,
			enableSorting: true,
			filterFn: (row, id, value) => {
				const leaderboard = leaderboards?.leaderboards[row.original.id];
				return value.includes(leaderboard?.category || 'General');
			},
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
};

export const types = [
	{
		value: 'none',
		label: 'Normal',
		icon: SquareActivity,
	},
	{
		value: 'monthly',
		label: 'Monthly',
		icon: Calendar,
	},
];
