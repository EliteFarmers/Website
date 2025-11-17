<script lang="ts">
	import { Button } from '$ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	interface Props {
		currentPage: number;
		pageCount: number;
		class?: string;
		onChange?: (page: number) => void;
	}

	let { currentPage, pageCount, class: className = '', onChange }: Props = $props();

	const safePageCount = $derived(Math.max(1, pageCount));
	const safeCurrentPage = $derived(Math.min(Math.max(currentPage, 1), safePageCount));

	const canGoBack = $derived(safeCurrentPage > 1);
	const canGoForward = $derived(safeCurrentPage < safePageCount);

	function goTo(page: number) {
		const nextPage = Math.min(Math.max(page, 1), safePageCount);
		if (nextPage === safeCurrentPage) return;
		onChange?.(nextPage);
	}
</script>

<div class={`flex flex-col items-center gap-2 md:flex-row ${className}`.trim()}>
	<div class="order-3 flex items-center justify-center text-sm font-medium whitespace-nowrap lg:order-1">
		<span
			>Page <strong>{safeCurrentPage.toLocaleString()}</strong> of
			<strong>{safePageCount.toLocaleString()}</strong></span
		>
	</div>
	<div class="order-2 flex items-center space-x-2">
		<Button variant="outline" class="size-8 p-0" disabled={!canGoBack} onclick={() => goTo(1)} type="button">
			<span class="sr-only">Go to first page</span>
			<ChevronsLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			disabled={!canGoBack}
			onclick={() => goTo(safeCurrentPage - 1)}
			type="button"
		>
			<span class="sr-only">Go to previous page</span>
			<ChevronLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			disabled={!canGoForward}
			onclick={() => goTo(safeCurrentPage + 1)}
			type="button"
		>
			<span class="sr-only">Go to next page</span>
			<ChevronRight />
		</Button>
		<Button
			variant="outline"
			class="size-8 p-0"
			disabled={!canGoForward}
			onclick={() => goTo(safePageCount)}
			type="button"
		>
			<span class="sr-only">Go to last page</span>
			<ChevronsRight />
		</Button>
	</div>
</div>
