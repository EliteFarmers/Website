<script lang="ts">
	import Head from '$comp/head.svelte';
	import { type AdminOrderSummaryDto } from '$lib/api';
	import { GetAdminOrders } from '$lib/remote/admin.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Table from '$ui/table';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Search from '@lucide/svelte/icons/search';
	import { onMount } from 'svelte';

	const PAGE_SIZE = 20;

	let orders = $state<AdminOrderSummaryDto[]>([]);
	let totalCount = $state(0);
	let loading = $state(false);
	let offset = $state(0);

	// Filters
	let search = $state('');
	let statusFilter = $state('');
	let providerFilter = $state('');
	let providerStatusFilter = $state('');
	let transactionIdFilter = $state('');
	let basketIdentFilter = $state('');
	let recurringRefFilter = $state('');
	let buyerIdFilter = $state('');
	let recipientIdFilter = $state('');

	onMount(() => {
		loadOrders();
	});

	async function loadOrders() {
		loading = true;
		try {
			const res = await GetAdminOrders({
				offset,
				limit: PAGE_SIZE,
				search: search || undefined,
				status: statusFilter || undefined,
				provider: providerFilter || undefined,
				providerStatus: providerStatusFilter || undefined,
				transactionId: transactionIdFilter || undefined,
				basketIdent: basketIdentFilter || undefined,
				recurringReference: recurringRefFilter || undefined,
				buyerId: buyerIdFilter ? Number(buyerIdFilter) : undefined,
				recipientId: recipientIdFilter ? Number(recipientIdFilter) : undefined,
			});

			if (res) {
				orders = res.orders;
				totalCount = res.totalCount;
			}
		} catch (e) {
			console.error('Failed to load orders', e);
		} finally {
			loading = false;
		}
	}

	function doSearch() {
		offset = 0;
		loadOrders();
	}

	function resetFilters() {
		search = '';
		statusFilter = '';
		providerFilter = '';
		providerStatusFilter = '';
		transactionIdFilter = '';
		basketIdentFilter = '';
		recurringRefFilter = '';
		buyerIdFilter = '';
		recipientIdFilter = '';
		offset = 0;
		loadOrders();
	}

	function onPageChange(newOffset: number) {
		if (newOffset < 0 || (newOffset >= totalCount && totalCount > 0)) return;
		offset = newOffset;
		loadOrders();
	}

	function getDisplayId(orderId: string) {
		return orderId.length > 12 ? orderId.slice(-12).toUpperCase() : orderId.toUpperCase();
	}

	function getStatusVariant(status?: string | null): 'default' | 'destructive' | 'secondary' | 'outline' {
		const s = status?.trim().toLowerCase() ?? '';
		if (s.includes('refund') || s.includes('cancel') || s.includes('dispute') || s.includes('chargeback'))
			return 'destructive';
		if (s.includes('complete') || s.includes('paid') || s.includes('success')) return 'default';
		if (s.includes('pending') || s.includes('open') || s.includes('processing')) return 'secondary';
		return 'outline';
	}

	function humanize(value?: string | null) {
		if (!value) return 'Unknown';
		return value
			.replace(/[_-]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function formatCurrency(amount: number, currency: string) {
		try {
			return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(
				amount
			);
		} catch {
			return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
		}
	}

	function formatDate(value?: string | null) {
		if (!value) return '-';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '-';
		return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
	}

	const pageNum = $derived(Math.floor(offset / PAGE_SIZE) + 1);
	const pageCount = $derived(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));
</script>

<Head title="Admin Orders" description="Manage store orders." />

<div class="container mx-auto py-10">
	<div class="mb-8 flex flex-col gap-4">
		<h1 class="text-3xl font-bold">Order Management</h1>

		<!-- Filters -->
		<div
			class="grid grid-cols-1 gap-4 rounded-lg border p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
		>
			<div class="flex flex-col gap-2">
				<Label>Search</Label>
				<Input
					placeholder="Order ID, transaction, basket..."
					bind:value={search}
					onkeydown={(e) => e.key === 'Enter' && doSearch()}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<Label>Status</Label>
				<Input placeholder="e.g. complete, refunded" bind:value={statusFilter} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>Provider</Label>
				<Input placeholder="e.g. tebex" bind:value={providerFilter} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>Provider Status</Label>
				<Input placeholder="Provider-specific status" bind:value={providerStatusFilter} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>Transaction ID</Label>
				<Input placeholder="Transaction ID" bind:value={transactionIdFilter} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>Basket Ident</Label>
				<Input placeholder="Basket identifier" bind:value={basketIdentFilter} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>Recurring Ref</Label>
				<Input placeholder="Recurring reference" bind:value={recurringRefFilter} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>Buyer ID</Label>
				<Input placeholder="Discord user ID" bind:value={buyerIdFilter} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>Recipient ID</Label>
				<Input placeholder="Recipient Discord ID" bind:value={recipientIdFilter} />
			</div>

			<div class="flex items-end gap-2">
				<Button onclick={doSearch} class="flex-1" disabled={loading}>
					{#if loading}
						<Loader2 class="mr-2 size-4 animate-spin" />
					{:else}
						<Search class="mr-2 size-4" />
					{/if}
					Search
				</Button>
				<Button variant="outline" onclick={resetFilters}>Reset</Button>
			</div>
		</div>
	</div>

	<!-- Results count -->
	<div class="mb-4 flex items-center justify-between">
		<p class="text-muted-foreground text-sm">
			{#if totalCount > 0}
				Showing {offset + 1}-{Math.min(offset + orders.length, totalCount)} of {totalCount.toLocaleString()} orders
			{:else}
				No orders found
			{/if}
		</p>
	</div>

	<!-- Table -->
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Order</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Buyer</Table.Head>
					<Table.Head>Total</Table.Head>
					<Table.Head>Date</Table.Head>
					<Table.Head>Items</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading && orders.length === 0}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">
							<Loader2 class="mx-auto size-6 animate-spin" />
						</Table.Cell>
					</Table.Row>
				{:else if orders.length === 0}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">No orders found.</Table.Cell>
					</Table.Row>
				{:else}
					{#each orders as order (order.orderId)}
						<Table.Row>
							<Table.Cell>
								<div class="min-w-48 space-y-1">
									<p class="font-medium">#{getDisplayId(order.orderId)}</p>
									<p class="text-muted-foreground font-mono text-xs break-all">{order.orderId}</p>
									{#if order.transactionId}
										<p class="text-muted-foreground text-xs">TXN: {order.transactionId}</p>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="flex min-w-32 flex-col gap-1.5">
									<Badge variant={getStatusVariant(order.status)}>{humanize(order.status)}</Badge>
									<Badge variant="secondary" class="text-[11px]">{humanize(order.provider)}</Badge>
									{#if order.providerStatus}
										<span class="text-muted-foreground text-xs"
											>{humanize(order.providerStatus)}</span
										>
									{/if}
									{#if order.purchaseMode}
										<Badge variant="outline" class="text-[11px]"
											>{humanize(order.purchaseMode)}</Badge
										>
									{/if}
									{#if order.recurringReference}
										<Badge variant="outline" class="text-[11px]">Recurring</Badge>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<div class="min-w-28 space-y-1">
									<p class="font-mono text-xs">{order.buyerId}</p>
									{#if order.recipientId}
										<p class="text-muted-foreground text-xs">To: {order.recipientId}</p>
									{/if}
									{#if order.recipientGuildId}
										<p class="text-muted-foreground text-xs">Guild: {order.recipientGuildId}</p>
									{/if}
									{#if order.recipientResolutionStatus}
										<Badge variant="outline" class="text-[11px]"
											>{humanize(order.recipientResolutionStatus)}</Badge
										>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<p class="font-medium whitespace-nowrap">
									{formatCurrency(order.totalPrice, order.currency)}
								</p>
							</Table.Cell>
							<Table.Cell>
								<div class="min-w-36 space-y-1">
									<p class="text-sm whitespace-nowrap">{formatDate(order.orderDate)}</p>
									{#if order.completedAt}
										<p class="text-muted-foreground text-xs">
											Completed: {formatDate(order.completedAt)}
										</p>
									{/if}
									{#if order.refundedAt}
										<p class="text-destructive text-xs">Refunded: {formatDate(order.refundedAt)}</p>
									{/if}
									{#if order.disputedAt}
										<p class="text-destructive text-xs">Disputed: {formatDate(order.disputedAt)}</p>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<p class="text-sm">{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button href="/admin/orders/{order.orderId}" variant="outline" size="sm">View</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-muted-foreground text-sm">
				Page {pageNum} of {pageCount}
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={offset === 0 || loading}
					onclick={() => onPageChange(offset - PAGE_SIZE)}
				>
					<ChevronLeft class="mr-1 size-4" />
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={offset + PAGE_SIZE >= totalCount || loading}
					onclick={() => onPageChange(offset + PAGE_SIZE)}
				>
					Next
					<ChevronRight class="ml-1 size-4" />
				</Button>
			</div>
		</div>
	{/if}
</div>
