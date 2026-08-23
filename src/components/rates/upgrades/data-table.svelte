<script lang="ts" generics="TData extends RowData">
	import {
		createTable,
		dataTableFeatures,
		FlexRender,
		type AnyColumnDef,
		type ColumnFiltersState,
		type ExpandedState,
		type PaginationState,
		type Row,
		type RowData,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
	} from '$ui/data-table/index.js';
	import * as Table from '$ui/table/index.js';
	import type { Snippet } from 'svelte';
	import DataTablePagination from './data-table-pagination.svelte';

	type DataTableProps<TData> = {
		columns: AnyColumnDef<TData>[];
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
	}: DataTableProps<TData> = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $derived<VisibilityState>(initialVisibility);
	let columnFilters = $derived<ColumnFiltersState>(initialFilters);
	let sorting = $derived<SortingState>(initialSorting);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 });

	const table = createTable({
		features: dataTableFeatures,
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
		autoResetExpanded: false,
		autoResetPageIndex: false,
		getRowCanExpand: () => !!renderSubComponent,
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
									<FlexRender {header} />
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
								<FlexRender {cell} />
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
