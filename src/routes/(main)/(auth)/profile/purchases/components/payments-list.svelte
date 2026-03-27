<script lang="ts">
	import type { UserOrderDto, UserOrdersResponseDto } from '$lib/api';
	import { GetUserOrdersList } from '$lib/remote/payments.remote';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import type { PaginationState } from '@tanstack/table-core';
	import { DEFAULT_PAYMENTS_PAGE_SIZE } from '../payments';
	import { getColumns } from './columns.js';
	import OrderDetailDialog from './order-detail-dialog.svelte';
	import PaymentsTable from './payments-table.svelte';

	interface Props {
		initialOrders: UserOrdersResponseDto | null;
		initialError?: string | null;
		initialPageIndex?: number;
		initialPageSize?: number;
	}

	let {
		initialOrders,
		initialError = null,
		initialPageIndex = 0,
		initialPageSize = DEFAULT_PAYMENTS_PAGE_SIZE,
	}: Props = $props();

	const columns = $derived(getColumns());

	let pageIndex = $state(0);
	let pageSize = $state(DEFAULT_PAYMENTS_PAGE_SIZE);
	let tableData = $state<UserOrdersResponseDto['orders']>([]);
	let totalCount = $state(0);
	let isLoading = $state(false);
	let errorMessage = $state<string | null>(null);
	let activeRequest = 0;
	let initialized = $state(false);
	let selectedOrderId = $state<string | null>(null);

	const pageCount = $derived.by(() => {
		if (!totalCount) {
			return Math.max(1, pageIndex + (tableData.length === pageSize ? 2 : 1));
		}

		return Math.max(1, Math.ceil(totalCount / pageSize));
	});

	function isReassignableOrder(order: UserOrderDto) {
		return order.items.some((item) => item.gift?.isReassignable);
	}

	async function loadOrders(nextPageIndex = pageIndex, nextPageSize = pageSize) {
		const requestId = ++activeRequest;

		isLoading = true;
		errorMessage = null;

		try {
			const response = await GetUserOrdersList({
				includeCheckoutStates: false,
				offset: nextPageIndex * nextPageSize,
				limit: nextPageSize,
			});

			if (requestId !== activeRequest) {
				return;
			}

			tableData = response.orders;
			totalCount = response.totalCount;
		} catch (error) {
			console.error('Failed to load payments', error);

			if (requestId === activeRequest) {
				errorMessage = 'Unable to load your purchases right now.';
			}
		} finally {
			if (requestId === activeRequest) {
				isLoading = false;
			}
		}
	}

	function handlePaginationChange(next: PaginationState) {
		pageIndex = next.pageIndex;
		pageSize = next.pageSize;
		loadOrders(next.pageIndex, next.pageSize);
	}

	$effect.pre(() => {
		if (initialized) {
			return;
		}

		initialized = true;
		pageIndex = initialPageIndex;
		pageSize = initialPageSize;
		tableData = initialOrders?.orders ?? [];
		totalCount = initialOrders?.totalCount ?? 0;
		errorMessage = initialError;
	});
</script>

<div class="flex flex-col gap-6">
	<Card>
		<CardHeader class="gap-4">
			<div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
				<div class="space-y-1">
					<CardTitle>Purchase History</CardTitle>
					<CardDescription>
						Review your Elite purchases, gift deliveries, and subscription checkouts in one place.
					</CardDescription>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button href="/shop" variant="outline">Browse Shop</Button>
					<Button href="/profile/settings" variant="outline">Manage Cosmetics</Button>
				</div>
			</div>

			{#if errorMessage}
				<div class="border-destructive/30 bg-destructive/5 rounded-lg border px-3 py-2 text-sm">
					<p class="text-destructive font-medium">{errorMessage}</p>
					<Button class="mt-2" variant="outline" size="sm" onclick={() => loadOrders()}>Retry</Button>
				</div>
			{/if}
		</CardHeader>

		<CardContent class="pt-0">
			<PaymentsTable
				data={tableData}
				{columns}
				{pageIndex}
				{pageSize}
				{pageCount}
				isRowEmphasized={(row) => isReassignableOrder(row as UserOrderDto)}
				loading={isLoading}
				onPaginationChange={handlePaginationChange}
				onRowClick={(row) => {
					selectedOrderId = (row as UserOrderDto).orderId;
				}}
				emptyMessage="No purchases yet. Your future checkouts will show up here."
			/>
		</CardContent>
	</Card>
</div>

<OrderDetailDialog
	orderId={selectedOrderId}
	onClose={() => {
		selectedOrderId = null;
	}}
/>
