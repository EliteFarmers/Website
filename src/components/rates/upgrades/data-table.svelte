<script lang="ts" generics="TData, TValue">
	import { createSvelteTable, FlexRender } from '$ui/data-table/index.js';
	import * as Table from '$ui/table/index.js';
	import {
		getCoreRowModel,
		getExpandedRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type ColumnFiltersState,
		type ExpandedState,
		type PaginationState,
		type Row,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
	} from '@tanstack/table-core';
	import type { Snippet } from 'svelte';
	import DataTablePagination from './data-table-pagination.svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		initialSorting?: SortingState;
		initialFilters?: ColumnFiltersState;
		initialVisibility?: VisibilityState;
		renderSubComponent?: Snippet<[{ row: Row<TData> }]>;
		expanded?: ExpandedState;
	};

	let {
		data,
		columns,
		initialFilters = [],
		initialSorting = [],
		initialVisibility = {},
		renderSubComponent,
		expanded = $bindable({}),
	}: DataTableProps<TData, TValue> = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $derived<VisibilityState>(initialVisibility);
	let columnFilters = $derived<ColumnFiltersState>(initialFilters);
	let sorting = $derived<SortingState>(initialSorting);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 });

	const table = createSvelteTable({
		get data() {
			return data;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			},
			get pagination() {
				return pagination;
			},
			get expanded() {
				return expanded;
			},
		},
		get columns() {
			return columns;
		},
		enableRowSelection: true,
		enableExpanding: true,
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onExpandedChange: (updater) => {
			if (typeof updater === 'function') {
				expanded = updater(expanded);
			} else {
				expanded = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getExpandedRowModel: getExpandedRowModel(),
	});
</script>

<div class="space-y-4">
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
					{#if row.getIsExpanded() && renderSubComponent}
						<Table.Row class="hover:bg-transparent">
							<Table.Cell colspan={row.getVisibleCells().length}>
								{@render renderSubComponent({ row })}
							</Table.Cell>
						</Table.Row>
					{/if}
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No upgrades found!</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination {table} />
</div>
