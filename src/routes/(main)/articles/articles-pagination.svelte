<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRight from '@lucide/svelte/icons/chevrons-right';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	interface Props {
		currentPage: number;
		maxPage: number;
	}

	let { currentPage, maxPage }: Props = $props();

	const queryParams = $derived.by(() => {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.delete('page');
		return params;
	});
</script>

<div class="flex flex-col items-center gap-2 @3xl:flex-row">
	<div class="order-3 flex items-center justify-center text-sm font-medium whitespace-nowrap lg:order-1">
		<span
			>Page <strong>{currentPage.toLocaleString()}</strong> of
			<strong>{maxPage.toLocaleString()}</strong></span
		>
	</div>
	<div class="order-2 flex items-center space-x-2">
		<Button
			variant="outline"
			class="size-8 p-0"
			href="/articles?{queryParams ? queryParams + '&' : ''}page=1"
			disabled={currentPage === 1}
		>
			<span class="sr-only">Go to first page</span>
			<ChevronsLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			href="/articles?{queryParams ? queryParams + '&' : ''}page={currentPage - 1}"
			disabled={currentPage === 1}
		>
			<span class="sr-only">Go to previous page</span>
			<ChevronLeft />
		</Button>
		<Button
			variant="outline"
			class="h-8 w-12 p-0"
			href="/articles?{queryParams ? queryParams + '&' : ''}page={currentPage + 1}"
			disabled={currentPage === maxPage}
		>
			<span class="sr-only">Go to next page</span>
			<ChevronRight />
		</Button>
		<Button
			variant="outline"
			class="size-8 p-0"
			href="/articles?{queryParams ? queryParams + '&' : ''}page={maxPage}"
			disabled={currentPage === maxPage}
		>
			<span class="sr-only">Go to last page</span>
			<ChevronsRight />
		</Button>
	</div>
</div>
