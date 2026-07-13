import type { UserOrderDto } from '$lib/api';
import { renderComponent } from '$ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import DateCell from './date-cell.svelte';
import ItemsCell from './items-cell.svelte';
import OrderCell from './order-cell.svelte';
import StatusCell from './status-cell.svelte';
import TotalCell from './total-cell.svelte';

export const getColumns = () =>
	[
		{
			id: 'order',
			header: 'Order',
			cell: ({ row }) => renderComponent(OrderCell, { order: row.original }),
		},
		{
			id: 'date',
			header: 'Placed',
			cell: ({ row }) => renderComponent(DateCell, { order: row.original }),
		},
		{
			id: 'items',
			header: 'Items',
			cell: ({ row }) => renderComponent(ItemsCell, { order: row.original }),
		},
		{
			id: 'total',
			header: 'Total',
			cell: ({ row }) => renderComponent(TotalCell, { order: row.original }),
		},
		{
			id: 'status',
			header: 'Status',
			cell: ({ row }) => renderComponent(StatusCell, { order: row.original }),
		},
	] as ColumnDef<UserOrderDto>[];
