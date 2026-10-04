<script lang="ts" generics="TData extends RowData">
	import {
		createTable,
		dataTableFeatures,
		FlexRender,
		type AnyColumnDef,
		type ColumnFiltersState,
		type RowData,
		type SortingState,
		type VisibilityState,
	} from '$ui/data-table/index.js';
	import { untrack } from 'svelte';
	import * as Table from '$ui/table/index.js';
	import DataTablePagination from './data-table-pagination.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';

	type DataTableProps<TData> = {
		columns: AnyColumnDef<TData>[];
		data: TData[];
		initialSorting?: SortingState;
		initialFilters?: ColumnFiltersState;
		initialVisibility?: VisibilityState;
	};

	let {
		data,
		columns,
		initialFilters = [],
		initialSorting = [],
		initialVisibility = {},
	}: DataTableProps<TData> = $props();

	const table = createTable({
		features: dataTableFeatures,
		get data() {
			return data;
		},
		initialState: untrack(() => ({
			sorting: initialSorting,
			columnVisibility: initialVisibility,
			columnFilters: initialFilters,
			pagination: { pageIndex: 0, pageSize: 10 },
		})),
		get columns() {
			return columns;
		},
		enableRowSelection: true,
	});
</script>

<div class="space-y-4">
	<DataTableToolbar {table} />
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
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination {table} />
</div>
