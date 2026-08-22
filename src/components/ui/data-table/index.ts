import {
	columnFacetingFeature,
	columnFilteringFeature,
	columnVisibilityFeature,
	createExpandedRowModel,
	createFacetedRowModel,
	createFacetedUniqueValues,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	rowExpandingFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	tableFeatures,
} from '@tanstack/svelte-table';
import type {
	Column as TanStackColumn,
	ColumnDef as TanStackColumnDef,
	ColumnVisibilityState,
	Row as TanStackRow,
	RowData,
	Table as TanStackTable,
} from '@tanstack/svelte-table';

export const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	columnFacetingFeature,
	facetedRowModel: createFacetedRowModel(),
	facetedUniqueValues: createFacetedUniqueValues(),
	columnVisibilityFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
	rowSelectionFeature,
	rowExpandingFeature,
	expandedRowModel: createExpandedRowModel(),
});

export type DataTableFeatures = typeof dataTableFeatures;
type AsRowData<TData> = TData & RowData;
export type ColumnDef<TData, TValue = unknown> = TanStackColumnDef<DataTableFeatures, AsRowData<TData>, TValue>;
export type AnyColumnDef<TData> = ColumnDef<TData, any>;
export type Column<TData, TValue = unknown> = TanStackColumn<DataTableFeatures, AsRowData<TData>, TValue>;
export type Row<TData> = TanStackRow<DataTableFeatures, AsRowData<TData>>;
export type Table<TData> = TanStackTable<DataTableFeatures, AsRowData<TData>>;
export type VisibilityState = ColumnVisibilityState;

export type {
	ColumnFiltersState,
	ExpandedState,
	PaginationState,
	RowData,
	RowSelectionState,
	SortingState,
} from '@tanstack/svelte-table';
export { createTable, FlexRender, renderComponent, renderSnippet } from '@tanstack/svelte-table';
