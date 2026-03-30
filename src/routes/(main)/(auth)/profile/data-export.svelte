<script lang="ts">
	import DateDisplay from '$comp/time/date-display.svelte';
	import { type DataExportStatusResponse } from '$lib/api';
	import {
		GetDataExportDownloadUrl,
		GetLatestDataExport,
		PollDataExportStatus,
		RequestDataExport,
	} from '$lib/remote/data-exports.remote';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import Download from '@lucide/svelte/icons/download';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let exportStatus = $state<DataExportStatusResponse | null>(null);
	let loading = $state(true);
	let requesting = $state(false);
	let downloading = $state(false);
	let pollInterval = $state<ReturnType<typeof setInterval> | null>(null);

	const isPending = $derived(exportStatus?.status === 'pending' || exportStatus?.status === 'processing');
	const isReady = $derived(exportStatus?.status === 'ready');
	const isFailed = $derived(exportStatus?.status === 'failed');
	const isExpired = $derived(exportStatus?.status === 'expired');

	async function loadLatestExport() {
		loading = true;
		try {
			exportStatus = await GetLatestDataExport();
		} catch {
			// No export found
		} finally {
			loading = false;
		}

		if (isPending) {
			startPolling();
		}
	}

	function startPolling() {
		stopPolling();
		pollInterval = setInterval(async () => {
			if (!exportStatus?.id) return;
			try {
				const result = await PollDataExportStatus({ id: exportStatus.id });
				if (result) {
					exportStatus = result;
				}
				if (exportStatus?.status !== 'pending' && exportStatus?.status !== 'processing') {
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
		requesting = true;
		try {
			const result = await RequestDataExport();
			if (result.success && result.data) {
				exportStatus = result.data;
				toast.success('Data export requested!');

				startPolling();
			} else {
				toast.error('Failed to request data export.');
			}
		} catch {
			toast.error('Failed to request data export.');
		} finally {
			requesting = false;
		}
	}

	async function downloadExport() {
		if (!exportStatus?.id) return;
		downloading = true;
		try {
			const result = await GetDataExportDownloadUrl({ id: exportStatus.id });
			if (result?.downloadUrl) {
				window.open(result.downloadUrl, '_blank');
			} else {
				toast.error('Failed to get download URL.');
			}
		} catch {
			toast.error('Failed to get download URL.');
		} finally {
			downloading = false;
		}
	}

	function formatBytes(bytes: bigint | number | null | undefined): string {
		if (!bytes) return '0 B';
		const num = Number(bytes);
		if (num < 1024) return `${num} B`;
		if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
		return `${(num / (1024 * 1024)).toFixed(1)} MB`;
	}

	onMount(() => {
		loadLatestExport();

		return () => {
			stopPolling();
		};
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-2">
		<FileArchive class="size-5" />
		<h2 class="scroll-mt-20 text-2xl" id="data-export">Data Export</h2>
	</div>
	<p class="text-muted-foreground max-w-2xl text-sm">
		Request a copy of all data we have stored about your account. Exports are limited to one request every 30 days
		and expire after 7 days.
	</p>

	{#if loading}
		<div class="flex items-center gap-2">
			<Loader2 class="size-4 animate-spin" />
			<span class="text-muted-foreground text-sm">Loading export status...</span>
		</div>
	{:else if exportStatus}
		<div class="flex flex-col gap-1 rounded-lg border p-4">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">Status:</span>
				{#if isPending}
					<Badge variant="outline" class="gap-1">
						<Loader2 class="size-3 animate-spin" />
						{exportStatus.status === 'pending' ? 'Pending' : 'Processing'}
					</Badge>
				{:else if isReady}
					<Badge variant="default">Ready</Badge>
				{:else if isFailed}
					<Badge variant="destructive">Failed</Badge>
				{:else if isExpired}
					<Badge variant="secondary">Expired</Badge>
				{/if}
			</div>

			{#if exportStatus.requestedAt}
				<div class="flex items-center gap-2 text-sm">
					<span class="font-medium">Requested:</span>
					<DateDisplay timestamp={new Date(exportStatus.requestedAt).getTime()} />
				</div>
			{/if}

			{#if exportStatus.completedAt && isReady}
				<div class="flex items-center gap-2 text-sm">
					<span class="font-medium">Completed:</span>
					<DateDisplay timestamp={new Date(exportStatus.completedAt).getTime()} />
				</div>
			{/if}

			{#if exportStatus.expiresAt && isReady}
				<div class="flex items-center gap-2 text-sm">
					<span class="font-medium">Expires:</span>
					<DateDisplay timestamp={new Date(exportStatus.expiresAt).getTime()} />
				</div>
			{/if}

			{#if exportStatus.archiveByteCount && isReady}
				<div class="flex items-center gap-2 text-sm">
					<span class="font-medium">Size:</span>
					<span>{formatBytes(exportStatus.archiveByteCount)}</span>
				</div>
			{/if}

			{#if isFailed && exportStatus.failureReason}
				<p class="text-destructive text-sm">{exportStatus.failureReason}</p>
			{/if}

			{#if exportStatus.canDownload && isReady}
				<Button onclick={downloadExport} disabled={downloading} class="mt-2 w-fit">
					{#if downloading}
						<Loader2 class="size-4 animate-spin" />
					{:else}
						<Download class="size-4" />
					{/if}
					Download Export
				</Button>
				<span
					class="bg-destructive/80 text-destructive-foreground mt-1 w-fit rounded-sm p-1 text-xs wrap-break-word"
				>
					Warning: The exported file may contain sensitive information. Do not share it with anyone.
				</span>
			{/if}

			{#if isPending}
				<p class="text-muted-foreground text-sm">
					Your export is being prepared. This may take a few minutes. You can leave this page and come back
					later.
				</p>
			{/if}
		</div>

		{#if exportStatus.canRequestNewExport}
			<Button onclick={requestExport} disabled={requesting} variant="secondary" class="w-fit">
				{#if requesting}
					<Loader2 class="size-4 animate-spin" />
				{/if}
				Request New Export
			</Button>
		{:else if exportStatus.nextEligibleAt}
			<div class="text-muted-foreground flex items-center text-sm">
				<span>You can request a new export after</span>
				<DateDisplay timestamp={new Date(exportStatus.nextEligibleAt).getTime()} />
			</div>
		{/if}
	{:else}
		<p class="text-muted-foreground text-sm">No previous exports found.</p>
		<Button onclick={requestExport} disabled={requesting} class="w-fit">
			{#if requesting}
				<Loader2 class="size-4 animate-spin" />
			{/if}
			Request My Data
		</Button>
	{/if}

	<p class="text-muted-foreground max-w-2xl text-sm">
		To request deletion of your data, please
		<a href="/contact" class="text-foreground underline underline-offset-4">contact us</a>.
	</p>
</div>
