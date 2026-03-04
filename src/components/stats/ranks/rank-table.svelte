<script lang="ts" generics="TData, TValue, TExtra">
	import { createSvelteTable, FlexRender } from '$ui/data-table/index.js';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
	} from '@tanstack/table-core';
	import type { Component } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import DataTablePagination from './data-table-pagination.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		extra?: TExtra;
		initialSorting?: SortingState;
		initialFilters?: ColumnFiltersState;
		initialVisibility?: VisibilityState;
		row?: Component<{ original: TData; extra?: TExtra } & HTMLAttributes<HTMLDivElement>>;
	};

	let {
		data,
		columns,
		initialFilters = [],
		initialSorting = [],
		initialVisibility = {},
		row: RowComponent,
		extra,
	}: DataTableProps<TData, TValue> = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $derived<VisibilityState>(initialVisibility);
	let columnFilters = $derived<ColumnFiltersState>(initialFilters);
	let sorting = $derived<SortingState>(initialSorting);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

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
		},
		columns: (() => columns)(),
		enableRowSelection: true,
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
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});
</script>

<div class="flex flex-col items-start gap-2">
	<div class="flex w-full flex-col items-center">
		{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
			<div class="bg-card flex w-full flex-col gap-2 rounded-md border-2 p-2 md:flex-row md:items-center">
				<div class="flex flex-1">
					<DataTableToolbar {table} />
				</div>
				<div class="flex items-center md:justify-end">
					{#each headerGroup.headers as header (header.id)}
						{@const hdef = header.column.columnDef.header}
						{#if hdef}
							<div
								class="text-foreground px-4 font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0"
							>
								{#if !header.isPlaceholder}
									<FlexRender content={hdef} context={header.getContext()} />
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
	<div class="flex w-full flex-col gap-1">
		{#each table.getRowModel().rows as row (row.id)}
			{#if RowComponent}
				<RowComponent original={row.original} data-state={row.getIsSelected() && 'selected'} {extra} />
			{:else}
				<div
					data-state={row.getIsSelected() && 'selected'}
					class="hover:bg-muted/50 data-[state=selected]:bg-muted flex flex-1 flex-row rounded-md border-2 transition-colors"
				>
					{#each row.getVisibleCells() as cell (cell.id)}
						<div class="min-w-fit flex-1 p-2">
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="flex w-full flex-col items-center justify-center border-2 rounded-md p-4 h-24">
				<div class="text-center">No leaderboard ranks found!</div>
			</div>
		{/each}
	</div>
	<DataTablePagination {table} />
</div>
