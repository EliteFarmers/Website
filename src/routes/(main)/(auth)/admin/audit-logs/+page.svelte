<script lang="ts">
	import Head from '$comp/head.svelte';
	import { type AuditLogDto, type AuditLogFiltersResponse } from '$lib/api';
	import { GetAuditLogFilters, GetAuditLogs } from '$lib/remote/admin.remote';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import * as Table from '$ui/table';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Search from '@lucide/svelte/icons/search';
	import { onMount } from 'svelte';

	let logs = $state<AuditLogDto[]>([]);
	let totalCount = $state(0);
	let loading = $state(false);

	let offset = $state(0);
	let limit = $state(20);

	// Filters
	let filters = $state<AuditLogFiltersResponse>({ actions: [], targetTypes: [] });
	let selectedAction = $state<string>('all');
	let selectedTargetType = $state<string>('all');
	let adminUserId = $state<string>('');
	let fromDate = $state<string>('');
	let toDate = $state<string>('');

	// Load filters on mount
	onMount(async () => {
		try {
			const res = await GetAuditLogFilters();
			if (res) {
				filters = res;
			}
		} catch (e) {
			console.error('Failed to load filters', e);
		}
		loadLogs();
	});

	async function loadLogs() {
		loading = true;
		try {
			const res = await GetAuditLogs({
				offset,
				limit,
				action: selectedAction === 'all' ? undefined : selectedAction,
				targetType: selectedTargetType === 'all' ? undefined : selectedTargetType,
				adminUserId: adminUserId || undefined,
				fromDate: fromDate || undefined,
				toDate: toDate || undefined,
			});

			if (res) {
				logs = res.logs;
				totalCount = res.totalCount;
			}
		} catch (e) {
			console.error('Failed to load audit logs', e);
		} finally {
			loading = false;
		}
	}

	function resetFilters() {
		selectedAction = 'all';
		selectedTargetType = 'all';
		adminUserId = '';
		fromDate = '';
		toDate = '';
		offset = 0;
		loadLogs();
	}

	function onPageChange(newOffset: number) {
		if (newOffset < 0 || (newOffset >= totalCount && totalCount > 0)) return;
		offset = newOffset;
		loadLogs();
	}

	function search() {
		offset = 0;
		loadLogs();
	}
</script>

<Head title="Audit Logs" description="View system audit logs." />

<div class="container mx-auto py-10">
	<div class="mb-8 flex flex-col gap-4">
		<h1 class="text-3xl font-bold">Audit Logs</h1>

		<!-- Filters -->
		<div
			class="grid grid-cols-1 gap-4 rounded-lg border p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
		>
			<div class="flex flex-col gap-2">
				<Label>Action</Label>
				<Select.Root type="single" value={selectedAction} onValueChange={(v) => (selectedAction = v)}>
					<Select.Trigger>{selectedAction === 'all' ? 'All Actions' : selectedAction}</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Actions</Select.Item>
						{#each filters.actions as action (action)}
							<Select.Item value={action}>{action}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex flex-col gap-2">
				<Label>Target Type</Label>
				<Select.Root type="single" value={selectedTargetType} onValueChange={(v) => (selectedTargetType = v)}>
					<Select.Trigger>{selectedTargetType === 'all' ? 'All Types' : selectedTargetType}</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Types</Select.Item>
						{#each filters.targetTypes as type (type)}
							<Select.Item value={type}>{type}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex flex-col gap-2">
				<Label>Admin User ID</Label>
				<Input placeholder="User ID" bind:value={adminUserId} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>From Date</Label>
				<Input type="date" bind:value={fromDate} />
			</div>

			<div class="flex flex-col gap-2">
				<Label>To Date</Label>
				<Input type="date" bind:value={toDate} />
			</div>

			<div class="flex items-end gap-2">
				<Button onclick={search} class="flex-1" disabled={loading}>
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

	<!-- Table -->
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Admin</Table.Head>
					<Table.Head>Action</Table.Head>
					<Table.Head>Target Type</Table.Head>
					<Table.Head>Target ID</Table.Head>
					<Table.Head>Details</Table.Head>
					<Table.Head>Date</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading && logs.length === 0}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">
							<Loader2 class="mx-auto size-6 animate-spin" />
						</Table.Cell>
					</Table.Row>
				{:else if logs.length === 0}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">No logs found.</Table.Cell>
					</Table.Row>
				{:else}
					{#each logs as log (log.id)}
						<Table.Row>
							<Table.Cell>{log.id}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col">
									<span class="font-medium">{log.adminUserName}</span>
									<span class="text-muted-foreground text-xs">{log.adminUserId}</span>
								</div>
							</Table.Cell>
							<Table.Cell>
								<span class="bg-secondary rounded-full px-2 py-0.5 text-xs font-semibold">
									{log.action}
								</span>
							</Table.Cell>
							<Table.Cell>{log.targetType}</Table.Cell>
							<Table.Cell class="font-mono text-xs">{log.targetId ?? '-'}</Table.Cell>
							<Table.Cell class="max-w-xs truncate" title={log.details ?? ''}>
								{log.details ?? '-'}
							</Table.Cell>
							<Table.Cell class="whitespace-nowrap">
								{new Date(log.createdAt).toLocaleString()}
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between py-4">
		<div class="text-muted-foreground text-sm">
			Showing {logs.length > 0 ? offset + 1 : 0} to {Math.min(offset + limit, totalCount)} of {totalCount} entries
		</div>
		<div class="flex items-center space-x-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPageChange(offset - limit)}
				disabled={offset === 0 || loading}
			>
				<ChevronLeft class="mr-2 size-4" />
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => onPageChange(offset + limit)}
				disabled={offset + limit >= totalCount || loading}
			>
				Next
				<ChevronRight class="ml-2 size-4" />
			</Button>
		</div>
	</div>
</div>
