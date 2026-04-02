<script lang="ts" generics="TData, TValue">
	import { createSvelteTable, FlexRender } from '$ui/data-table/index.js';
	import * as Table from '$ui/table/index.js';
	import { type ColumnDef, type PaginationState, getCoreRowModel } from '@tanstack/table-core';
	import PaymentsTablePagination from './payments-table-pagination.svelte';

	type PaginationChangeHandler = (pagination: PaginationState) => void;
	type RowClickHandler = (row: TData) => void;

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
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
	}: DataTableProps<TData, TValue> = $props();

	const pagination = $derived.by(() => ({ pageIndex, pageSize }));

	const table = createSvelteTable({
		get data() {
			return data;
		},
		state: {
			get pagination() {
				return pagination;
			},
		},
		columns: (() => columns)(),
		manualPagination: true,
		get pageCount() {
			return pageCount;
		},
		onPaginationChange: (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			onPaginationChangeProp?.(next);
		},
		getCoreRowModel: getCoreRowModel(),
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
								class="bg-card border-t border-b first:rounded-l-md first:border-l last:rounded-r-md last:border-r"
							>
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
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="bg-card h-28 rounded-md border text-center">
							{emptyMessage}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<PaymentsTablePagination {table} />
</div>
