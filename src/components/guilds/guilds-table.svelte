<script lang="ts" generics="TData extends RowData">
	import {
		createTable,
		dataTableFeatures,
		FlexRender,
		type AnyColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowData,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
	} from '$ui/data-table/index.js';
	import * as Table from '$ui/table/index.js';
	import DataTablePagination from './data-table-pagination.svelte';

	type PaginationChangeHandler = (pagination: PaginationState) => void;
	type TableMeta = {
		getRankNumber: (rowIndex: number) => number;
	};

	type DataTableProps<TData> = {
		columns: AnyColumnDef<TData>[];
		data: TData[];
		initialSorting?: SortingState;
		initialFilters?: ColumnFiltersState;
		initialVisibility?: VisibilityState;
		pageIndex?: number;
		pageSize?: number;
		pageCount?: number;
		manualPagination?: boolean;
		onSortingChange?: (sorting: SortingState) => void;
		onPaginationChange?: PaginationChangeHandler;
		loading?: boolean;
	};

	let {
		data,
		columns,
		initialFilters = [],
		initialSorting = [],
		initialVisibility = {},
		pageIndex = 0,
		pageSize = 10,
		pageCount,
		manualPagination = false,
		onSortingChange: onSortingChangeProp,
		onPaginationChange: onPaginationChangeProp,
		loading = false,
	}: DataTableProps<TData> = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $derived<VisibilityState>(initialVisibility);
	let columnFilters = $derived<ColumnFiltersState>(initialFilters);
	let sorting = $derived<SortingState>(initialSorting);
	const pagination = $derived.by(() => ({ pageIndex, pageSize }));
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
		},
		get columns() {
			return columns;
		},
		enableRowSelection: true,
		get manualPagination() {
			return manualPagination;
		},
		get pageCount() {
			return pageCount;
		},
		meta: {
			getRankNumber: (rowIndex: number) => pagination.pageIndex * pagination.pageSize + rowIndex + 1,
		} satisfies TableMeta,
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
			onSortingChangeProp?.(sorting);
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
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			onPaginationChangeProp?.(next);
		},
	});
</script>

<div class="space-y-4">
	<div>
		<div class="flex items-center py-4">
			<!-- <Input
				placeholder="Filter emails..."
				value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
				oninput={(e) => table.getColumn('email')?.setFilterValue(e.currentTarget.value)}
				onchange={(e) => {
					table.getColumn('email')?.setFilterValue(e.currentTarget.value);
				}}
				class="max-w-sm"
			/> -->
		</div>
		<Table.Root
			class="border-separate border-spacing-x-0 border-spacing-y-2 border-0 {loading ? 'opacity-60' : ''}"
			aria-busy={loading}
		>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head
								class="border-t border-b bg-card first:rounded-l-md first:border-l last:rounded-r-md last:border-r"
							>
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
							<Table.Cell
								class="border-t border-b first:rounded-l-md first:border-l last:rounded-r-md last:border-r"
							>
								<FlexRender {cell} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No guilds found!</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination {table} />
</div>
