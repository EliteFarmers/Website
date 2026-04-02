<script lang="ts">
	import DateDisplay from '$comp/time/date-display.svelte';
	import { type DataExportStatusResponse } from '$lib/api';
	import { AdminGetDataExportDownloadUrl, AdminRequestDataExport } from '$lib/remote/admin.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Input } from '$ui/input';
	import Download from '@lucide/svelte/icons/download';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';

	let userId = $state('');
	let exportResult = $state<DataExportStatusResponse | null>(null);
	let requesting = $state(false);
	let fetchingUrl = $state(false);
	let pollInterval = $state<ReturnType<typeof setInterval> | null>(null);

	function startPolling() {
		stopPolling();
		if (!userId.trim()) return;
		const pollUserId = userId.trim();
		pollInterval = setInterval(async () => {
			try {
				const result = await AdminRequestDataExport({ userId: pollUserId });
				if (result.success && result.data) {
					exportResult = result.data;
				}
				if (exportResult?.status !== 'pending' && exportResult?.status !== 'processing') {
					stopPolling();
				}
			} catch {
				stopPolling();
			}
		}, 500);
	}

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	async function requestExport() {
		if (!userId.trim()) {
			toast.error('Please enter a user ID.');
			return;
		}
		requesting = true;
		try {
			const result = await AdminRequestDataExport({ userId: userId.trim() });
			if (result.success && result.data) {
				exportResult = result.data;
				toast.success('Data export requested!');
				if (exportResult.status === 'pending' || exportResult.status === 'processing') {
					startPolling();
				}
			} else {
				toast.error('Failed to request data export.');
			}
		} catch {
			toast.error('Failed to request data export.');
		} finally {
			requesting = false;
		}
	}

	async function getDownloadUrl() {
		if (!exportResult?.id) return;
		fetchingUrl = true;
		try {
			const result = await AdminGetDataExportDownloadUrl({ id: exportResult.id });
			if (result?.downloadUrl) {
				window.open(result.downloadUrl, '_blank');
			} else {
				toast.error('Failed to get download URL. The export may not be ready yet.');
			}
		} catch {
			toast.error('Failed to get download URL.');
		} finally {
			fetchingUrl = false;
		}
	}

	onDestroy(() => {
		stopPolling();
	});
</script>

<div class="my-16">
	<section class="my-8 flex w-full flex-col gap-4">
		<h1 class="mb-8 text-4xl">Data Exports</h1>

		<div class="bg-card flex w-full flex-col gap-4 rounded-lg border-2 p-4">
			<h2 class="text-xl font-medium">Request User Data Export</h2>
			<p class="text-muted-foreground text-sm">Request a data export for any user for support purposes.</p>

			<div class="flex flex-row gap-2">
				<Input bind:value={userId} placeholder="User Account ID" maxlength={64} />
				<Button onclick={requestExport} disabled={requesting} class="w-32">
					{#if requesting}
						<Loader2 class="size-4 animate-spin" />
					{/if}
					Export
				</Button>
			</div>

			{#if exportResult}
				<div class="bg-muted flex flex-col gap-3 rounded-lg p-4">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">Export ID:</span>
						<code class="text-sm">{exportResult.id}</code>
					</div>

					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">Status:</span>
						{#if exportResult.status === 'pending' || exportResult.status === 'processing'}
							<Badge variant="outline" class="gap-1">
								<Loader2 class="size-3 animate-spin" />
								{exportResult.status === 'pending' ? 'Pending' : 'Processing'}
							</Badge>
						{:else if exportResult.status === 'ready'}
							<Badge variant="default">Ready</Badge>
						{:else if exportResult.status === 'failed'}
							<Badge variant="destructive">Failed</Badge>
						{:else if exportResult.status === 'expired'}
							<Badge variant="secondary">Expired</Badge>
						{/if}
					</div>

					{#if exportResult.requestedAt}
						<div class="flex items-center gap-2 text-sm">
							<span class="font-medium">Requested:</span>
							<DateDisplay timestamp={new Date(exportResult.requestedAt).getTime()} />
						</div>
					{/if}

					{#if exportResult.completedAt}
						<div class="flex items-center gap-2 text-sm">
							<span class="font-medium">Completed:</span>
							<DateDisplay timestamp={new Date(exportResult.completedAt).getTime()} />
						</div>
					{/if}

					{#if exportResult.expiresAt}
						<div class="flex items-center gap-2 text-sm">
							<span class="font-medium">Expires:</span>
							<DateDisplay timestamp={new Date(exportResult.expiresAt).getTime()} />
						</div>
					{/if}

					{#if exportResult.failureReason}
						<p class="text-destructive text-sm">{exportResult.failureReason}</p>
					{/if}

					{#if exportResult.canDownload}
						<Button onclick={getDownloadUrl} disabled={fetchingUrl} class="w-fit">
							{#if fetchingUrl}
								<Loader2 class="size-4 animate-spin" />
							{:else}
								<Download class="size-4" />
							{/if}
							Download Export
						</Button>
					{/if}

					{#if exportResult.status === 'pending' || exportResult.status === 'processing'}
						<p class="text-muted-foreground text-sm">
							Export is being prepared. This page will update automatically.
						</p>
					{/if}
				</div>
			{/if}
		</div>
	</section>
</div>
