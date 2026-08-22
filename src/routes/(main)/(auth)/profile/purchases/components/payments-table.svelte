<script lang="ts" generics="TData extends RowData">
	import {
		createTable,
		dataTableFeatures,
		FlexRender,
		type AnyColumnDef,
		type PaginationState,
		type RowData,
	} from '$ui/data-table/index.js';
	import * as Table from '$ui/table/index.js';
	import PaymentsTablePagination from './payments-table-pagination.svelte';

	type PaginationChangeHandler = (pagination: PaginationState) => void;
	type RowClickHandler = (row: TData) => void;

	type DataTableProps<TData> = {
		columns: AnyColumnDef<TData>[];
		data: TData[];
		pageIndex: number;
		pageSize: number;
		pageCount: number;
		isRowEmphasized?: (row: TData) => boolean;
		onPaginationChange?: PaginationChangeHandler;
		onRowClick?: RowClickHandler;
		loading?: boolean;
		emptyMessage?: string;
	};

	let {
		data,
		columns,
		pageIndex,
		pageSize,
		pageCount,
		isRowEmphasized,
		onPaginationChange: onPaginationChangeProp,
		onRowClick,
		loading = false,
		emptyMessage = 'No purchases found.',
	}: DataTableProps<TData> = $props();

	const pagination = $derived.by(() => ({ pageIndex, pageSize }));

	const table = createTable({
		features: dataTableFeatures,
		get data() {
			return data;
		},
		state: {
			get pagination() {
				return pagination;
			},
		},
		get columns() {
			return columns;
		},
		manualPagination: true,
		get pageCount() {
			return pageCount;
		},
		onPaginationChange: (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			onPaginationChangeProp?.(next);
		},
	});
</script>

<div class="space-y-4">
	<div class="overflow-x-auto">
		<Table.Root class="min-w-[940px] border-separate border-spacing-x-0 border-spacing-y-2 border-0">
			<Table.Header class={loading ? 'opacity-60' : ''} aria-busy={loading}>
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
			<Table.Body class={loading ? 'opacity-60' : ''} aria-busy={loading}>
				{#each table.getRowModel().rows as row (row.id)}
					{@const emphasized = isRowEmphasized?.(row.original) ?? false}
					<Table.Row
						class={[
							'group',
							onRowClick ? 'cursor-pointer transition-opacity hover:opacity-80' : '',
							emphasized ? 'hover:opacity-100' : '',
						]}
						onclick={() => onRowClick?.(row.original)}
					>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell
								class={[
									'border-t border-b align-top transition-colors first:rounded-l-md first:border-l last:rounded-r-md last:border-r',
									emphasized
										? 'border-destructive/35 bg-destructive/5 group-hover:bg-destructive/10 first:border-l-destructive/70 last:border-r-destructive/50'
										: 'bg-card',
								]}
							>
								<FlexRender {cell} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-28 rounded-md border bg-card text-center">
							{emptyMessage}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<PaymentsTablePagination {table} />
</div>
