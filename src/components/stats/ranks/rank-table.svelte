<script lang="ts" generics="TData extends RowData, TExtra">
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
	import { untrack, type Component } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import DataTablePagination from './data-table-pagination.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';

	type DataTableProps<TData> = {
		columns: AnyColumnDef<TData>[];
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

<div class="flex flex-col items-start gap-2">
	<div class="flex w-full flex-col items-center">
		{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
			<div
				class="flex w-full flex-col gap-2 rounded-md border-2 bg-card p-2 text-card-foreground md:flex-row md:items-center"
			>
				<div class="flex flex-1">
					<DataTableToolbar {table} />
				</div>
				<div class="flex items-center md:justify-end">
					{#each headerGroup.headers as header (header.id)}
						{#if header.column.columnDef.header}
							<div
								class="px-4 font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0"
							>
								{#if !header.isPlaceholder}
									<FlexRender {header} />
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
					class="flex flex-1 flex-row rounded-md border-2 bg-background text-foreground transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
				>
					{#each row.getVisibleCells() as cell (cell.id)}
						<div class="min-w-fit flex-1 p-2">
							<FlexRender {cell} />
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<div
				class="flex h-24 w-full flex-col items-center justify-center rounded-md border-2 bg-background p-4 text-foreground"
			>
				<div class="text-center">No leaderboard ranks found!</div>
			</div>
		{/each}
	</div>
	<DataTablePagination {table} />
</div>
