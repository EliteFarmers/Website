<script lang="ts" module>
	type TData = unknown;
</script>

<script lang="ts" generics="TData">
	import { Button } from '$ui/button';
	import * as Select from '$ui/select';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import type { Table } from '@tanstack/table-core';

	let { table }: { table: Table<TData> } = $props();
</script>

<div class="bg-card flex w-full flex-col items-center justify-between gap-2 rounded-md border-2 p-2 md:flex-row">
	<div class="text-muted-foreground flex-1 text-sm">
		<!-- {table.getFilteredSelectedRowModel().rows.length} of -->
		Showing {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length} ranks
	</div>
	<div class="flex flex-col items-center gap-2 md:flex-row lg:space-x-8">
		<div class="flex items-center space-x-2">
			<p class="text-sm font-medium">Rankings per page</p>
			<Select.Root
				allowDeselect={false}
				type="single"
				value={`${table.getState().pagination.pageSize}`}
				onValueChange={(value) => {
					table.setPageSize(Number(value));
				}}
			>
				<Select.Trigger class="h-8 w-[70px]">
					{String(table.getState().pagination.pageSize)}
				</Select.Trigger>
				<Select.Content side="top">
					{#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
						<Select.Item value={`${pageSize}`}>
							{pageSize}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex flex-row items-center justify-center gap-2">
			<div class="flex items-center justify-center text-sm font-medium whitespace-nowrap">
				Page {table.getState().pagination.pageIndex + 1} of
				{table.getPageCount()}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Go to first page</span>
					<ChevronsLeft />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Go to previous page</span>
					<ChevronLeft />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Go to next page</span>
					<ChevronRight />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Go to last page</span>
					<ChevronsRight />
				</Button>
			</div>
		</div>
	</div>
</div>
