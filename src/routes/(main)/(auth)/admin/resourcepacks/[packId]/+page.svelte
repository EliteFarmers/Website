<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import FormattedText from '$comp/items/formatted-text.svelte';
	import type { ManagedResourcePackVersionDto, ManagedResourcePackVersionListItemDto } from '$lib/api';
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import {
		formatManagedPackBytes,
		formatManagedPackCountdown,
		formatManagedPackDate,
		getManagedPackStatusVariant,
		getManagedPackValidationVariant,
		humanizeManagedPackValue,
	} from '$lib/managed-resource-packs';
	import { buildManagedPreviewTexturePack } from '$lib/texture-packs';
	import { cn } from '$lib/utils';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Popover from '$ui/popover';
	import * as Table from '$ui/table';
	import { Textarea } from '$ui/textarea';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import Download from '@lucide/svelte/icons/download';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import X from '@lucide/svelte/icons/x';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { ActionData, PageData } from './$types';

	type ActionName =
		| 'updatePack'
		| 'assignOwner'
		| 'removeOwner'
		| 'downloadVersion'
		| 'submitVersion'
		| 'approveVersion'
		| 'rejectVersion';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const gbl = getGlobalContext();
	const pageCtx = getPageCtx();

	const crumbs = $derived.by<Crumb[]>(() => [
		{
			name: 'Admin',
			href: '/admin',
		},
		{
			name: 'Texture Packs',
			href: '/admin/resourcepacks',
		},
		{
			name: data.pack.displayName,
		},
	]);

	let selectedVersionId = $state('');
	let ownerAccountId = $state('_');
	let actionLoading = $state<ActionName | null>(null);
	let cooldownUntil = $state<number | null>(null);
	let now = $state(Date.now());

	const packOwnerOptions = $derived.by(() =>
		data.packOwnerCandidates.map((owner) => ({
			value: owner.id,
			label: owner.username ? `${owner.displayName} (@${owner.username})` : owner.displayName,
		}))
	);
	const assignedOwnerIds = $derived(data.pack.owners.map((owner) => owner.accountId));
	const remainingPackOwnerOptions = $derived.by(() =>
		packOwnerOptions.filter((owner) => !assignedOwnerIds.includes(owner.value))
	);
	const selectedVersion = $derived.by<ManagedResourcePackVersionListItemDto | null>(() => {
		return (
			data.versions.versions.find(
				(version: ManagedResourcePackVersionListItemDto) => version.versionId === selectedVersionId
			) ??
			data.versions.versions[0] ??
			null
		);
	});
	const pendingApproval = $derived(data.pack.stagedVersion?.status === 'pendingApproval');
	const canSubmit = $derived.by(() => {
		return data.pack.stagedVersion?.status === 'downloaded' && data.pack.stagedVersion.validationSucceeded;
	});
	const cooldownRemainingMs = $derived(cooldownUntil ? Math.max(0, cooldownUntil - now) : 0);
	const versionPage = $derived(Math.floor(data.versionOffset / data.versionLimit) + 1);
	const versionPageCount = $derived.by(() => Math.max(1, Math.ceil(data.versions.totalCount / data.versionLimit)));
	const logPage = $derived(Math.floor(data.logOffset / data.logLimit) + 1);
	const logPageCount = $derived.by(() => Math.max(1, Math.ceil(data.auditLogs.totalCount / data.logLimit)));
	const downloadMessage = $derived.by(() => {
		if (pendingApproval) {
			return 'A staged version is already waiting for approval.';
		}

		if (cooldownRemainingMs > 0) {
			return `Retry in ${formatManagedPackCountdown(cooldownRemainingMs)}.`;
		}

		return null;
	});
	const livePreviewPack = $derived.by(() =>
		data.pack.liveVersion ? buildManagedPreviewTexturePack(data.pack, data.pack.liveVersion) : null
	);
	const stagedPreviewPack = $derived.by(() =>
		data.pack.stagedVersion ? buildManagedPreviewTexturePack(data.pack, data.pack.stagedVersion) : null
	);
	const packAuthorsValue = $derived(data.pack.authors.join('\n'));

	$effect.pre(() => {
		pageCtx.setBreadcrumbs(crumbs);
	});

	$effect(() => {
		if (!data.versions.versions.length) {
			selectedVersionId = '';
			return;
		}

		if (
			!data.versions.versions.some(
				(version: ManagedResourcePackVersionListItemDto) => version.versionId === selectedVersionId
			)
		) {
			selectedVersionId = data.versions.versions[0]?.versionId ?? '';
		}
	});

	$effect(() => {
		const cooldownValue = form && 'cooldownUntil' in form ? form.cooldownUntil : undefined;

		if (typeof cooldownValue === 'number') {
			cooldownUntil = cooldownValue;
			return;
		}

		if (form?.action === 'downloadVersion' && form.success) {
			cooldownUntil = null;
		}
	});

	$effect(() => {
		if (form?.action === 'assignOwner' && form.success) {
			ownerAccountId = '_';
		}
	});

	$effect(() => {
		if (!cooldownUntil) return;

		now = Date.now();
		if (cooldownUntil <= now) {
			cooldownUntil = null;
			return;
		}

		const timer = setInterval(() => {
			now = Date.now();

			if (cooldownUntil && cooldownUntil <= now) {
				cooldownUntil = null;
			}
		}, 1000);

		return () => clearInterval(timer);
	});

	function withLoading(name: ActionName) {
		return () => {
			actionLoading = name;

			return async ({ update }: { update: () => Promise<void> }) => {
				await update();
				actionLoading = null;
			};
		};
	}

	function buildPageHref(versionOffset = data.versionOffset, logOffset = data.logOffset) {
		const params = new SvelteURLSearchParams();

		if (versionOffset > 0) {
			params.set('versionOffset', `${versionOffset}`);
		}

		if (logOffset > 0) {
			params.set('logOffset', `${logOffset}`);
		}

		const query = params.toString();
		return query ? `?${query}` : '';
	}

	function enablePreview(version: ManagedResourcePackVersionDto | null | undefined) {
		const previewPack = version ? buildManagedPreviewTexturePack(data.pack, version) : null;
		if (!previewPack) {
			return;
		}

		gbl.upsertLocalTexturePackOverride(previewPack, true);
	}

	function clearPreview(packId: string | null | undefined) {
		if (!packId) {
			return;
		}

		gbl.removeLocalTexturePackOverride(packId);
	}

	function isPreviewActive(packId: string | null | undefined) {
		return !!packId && gbl.hasPackEnabled(packId);
	}

	function isPreviewCached(packId: string | null | undefined) {
		return !!packId && gbl.hasLocalTexturePackOverride(packId);
	}
</script>

<Head title="Texture Pack" description="Review staged texture pack versions and approvals." />

<div class="my-12 flex flex-col gap-8 sm:my-16">
	<div class="flex flex-col gap-4">
		<Button href="/admin/resourcepacks" variant="ghost" class="w-fit px-0">
			<ArrowLeft class="mr-2 size-4" />
			Back to texture packs
		</Button>

		<div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
			<div class="space-y-3">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-4xl">{data.pack.displayName}</h1>
					<Badge variant="outline" class="font-mono text-[11px]">{data.pack.slug}</Badge>
					{#if data.pack.stagedVersion}
						<Badge variant={getManagedPackStatusVariant(data.pack.stagedVersion.status)}>
							{humanizeManagedPackValue(data.pack.stagedVersion.status)}
						</Badge>
					{/if}
				</div>

				<p class="text-muted-foreground max-w-3xl text-sm leading-6">
					Review upstream releases, validate staged builds, and preview the current managed versions across
					the site.
				</p>
			</div>

			<Button
				href={data.pack.modrinthProjectUrl}
				target="_blank"
				rel="noreferrer"
				variant="outline"
				class="w-fit"
			>
				Open Modrinth Project
				<ExternalLink class="ml-2 size-4" />
			</Button>
		</div>
	</div>

	{#if form?.error || form?.message}
		<div
			class={cn(
				'rounded-md border px-4 py-3 text-sm',
				form?.error
					? 'border-destructive/40 bg-destructive/10 text-destructive'
					: 'border-primary/30 bg-primary/8'
			)}
		>
			{form?.error ?? form?.message}
		</div>
	{/if}

	<section class="py-5">
		<div class="space-y-5">
			<div class="space-y-1">
				<h2 class="text-2xl font-semibold">Pack overview</h2>
				<p class="text-muted-foreground text-sm">
					Core identifiers, project details, and the people attached to this managed pack.
				</p>
			</div>

			<div class="overflow-x-auto rounded-md border">
				<Table.Root>
					<Table.Body>
						<Table.Row>
							<Table.Cell class="text-muted-foreground w-48 text-sm">Directory name</Table.Cell>
							<Table.Cell class="font-mono text-sm">{data.pack.directoryName}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="text-muted-foreground text-sm">Modrinth slug</Table.Cell>
							<Table.Cell class="font-mono text-sm">{data.pack.modrinthProjectSlug}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="text-muted-foreground text-sm">Created</Table.Cell>
							<Table.Cell class="text-sm">{formatManagedPackDate(data.pack.createdAt)}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="text-muted-foreground text-sm">Updated</Table.Cell>
							<Table.Cell class="text-sm">{formatManagedPackDate(data.pack.updatedAt)}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="text-muted-foreground text-sm">Owners</Table.Cell>
							<Table.Cell>
								{#if data.pack.owners.length}
									<div class="flex flex-wrap gap-2">
										{#each data.pack.owners as owner (owner.accountId)}
											<Badge variant="outline">{owner.displayName}</Badge>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground text-sm">No pack owners are assigned yet.</span>
								{/if}
							</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Cell class="text-muted-foreground text-sm">Authors</Table.Cell>
							<Table.Cell>
								{#if data.pack.authors.length}
									<div class="flex flex-wrap gap-2">
										{#each data.pack.authors as author (author)}
											<Badge variant="outline">{author}</Badge>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground text-sm">No authors are set.</span>
								{/if}
							</Table.Cell>
						</Table.Row>
						{#if data.pack.notes}
							<Table.Row>
								<Table.Cell class="text-muted-foreground text-sm">Internal notes</Table.Cell>
								<Table.Cell class="text-muted-foreground text-sm leading-6">
									{data.pack.notes}
								</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	</section>

	<div class="space-y-8">
		<section class="py-5">
			<div class="space-y-1">
				<h2 class="text-2xl font-semibold">Live version</h2>
				<p class="text-muted-foreground text-sm">The version currently served by the renderer.</p>
			</div>

			{#if data.pack.liveVersion}
				<div class="mt-5 space-y-5">
					<div class="flex flex-wrap items-center gap-2">
						<h3 class="text-xl font-semibold">{data.pack.liveVersion.versionName}</h3>
						<Badge>{data.pack.liveVersion.versionNumber}</Badge>
						<Badge variant="secondary">
							{humanizeManagedPackValue(data.pack.liveVersion.versionType)}
						</Badge>
					</div>

					<dl class="grid gap-4 sm:grid-cols-2">
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Published</dt>
							<dd class="mt-1 text-sm">{formatManagedPackDate(data.pack.liveVersion.publishedAt)}</dd>
						</div>
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Approved</dt>
							<dd class="mt-1 text-sm">{formatManagedPackDate(data.pack.liveVersion.approvedAt)}</dd>
						</div>
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Pack name</dt>
							<dd class="mt-1 text-sm">{data.pack.liveVersion.packName ?? 'Unavailable'}</dd>
						</div>
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Pack version</dt>
							<dd class="mt-1 text-sm">{data.pack.liveVersion.packVersion ?? 'Unavailable'}</dd>
						</div>
					</dl>

					<div class="space-y-2">
						<p class="text-muted-foreground text-sm">Compatibility</p>
						<div class="flex flex-wrap gap-2">
							{#if data.pack.liveVersion.gameVersions.length}
								{#each data.pack.liveVersion.gameVersions as gameVersion (gameVersion)}
									<Badge variant="outline">{gameVersion}</Badge>
								{/each}
							{/if}
							{#if data.pack.liveVersion.loaders.length}
								{#each data.pack.liveVersion.loaders as loader (loader)}
									<Badge variant="outline">{loader}</Badge>
								{/each}
							{/if}
							{#if !data.pack.liveVersion.gameVersions.length && !data.pack.liveVersion.loaders.length}
								<p class="text-sm">No compatibility metadata was captured.</p>
							{/if}
						</div>
					</div>

					<div class="border-destructive rounded-md px-4 py-4">
						<div class="flex flex-col gap-3">
							<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div class="space-y-1">
									<h4 class="font-semibold">Website preview</h4>
									{#if livePreviewPack}
										<p class="text-muted-foreground text-sm leading-6">
											Adds an override to the texture pack selector across the site with this live
											version.
										</p>
									{:else}
										<p class="text-muted-foreground text-sm leading-6">
											This version does not have a preview pack ID yet.
										</p>
									{/if}
								</div>

								{#if livePreviewPack}
									<div class="flex flex-wrap gap-2">
										<Button
											type="button"
											size="sm"
											onclick={() => enablePreview(data.pack.liveVersion)}
										>
											{#if isPreviewActive(livePreviewPack.id)}
												Preview active
											{:else if isPreviewCached(livePreviewPack.id)}
												Enable preview
											{:else}
												Preview across site
											{/if}
										</Button>
										{#if isPreviewCached(livePreviewPack.id)}
											<Button
												type="button"
												size="sm"
												variant="outline"
												onclick={() => clearPreview(livePreviewPack.id)}
											>
												Clear preview
											</Button>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					</div>

					{#if data.pack.liveVersion.primaryFileUrl}
						<Button
							href={data.pack.liveVersion.primaryFileUrl}
							target="_blank"
							rel="noreferrer"
							variant="outline"
							class="w-full sm:w-fit"
						>
							View live file
							<ExternalLink class="ml-2 size-4" />
						</Button>
					{/if}
				</div>
			{:else}
				<p class="text-muted-foreground mt-5 text-sm">This pack does not have a live version yet.</p>
			{/if}
		</section>

		<section class="py-5">
			<div class="space-y-1">
				<h2 class="text-2xl font-semibold">Staged version</h2>
				<p class="text-muted-foreground text-sm">
					The current work-in-progress version, including validation and approval state.
				</p>
			</div>

			{#if data.pack.stagedVersion}
				<div class="mt-5 space-y-5">
					<div class="flex flex-wrap items-center gap-2">
						<h3 class="text-xl font-semibold">{data.pack.stagedVersion.versionName}</h3>
						<Badge>{data.pack.stagedVersion.versionNumber}</Badge>
						<Badge variant={getManagedPackStatusVariant(data.pack.stagedVersion.status)}>
							{humanizeManagedPackValue(data.pack.stagedVersion.status)}
						</Badge>
						<Badge variant={getManagedPackValidationVariant(data.pack.stagedVersion.validationSucceeded)}>
							{data.pack.stagedVersion.validationSucceeded ? 'Validation passed' : 'Validation failed'}
						</Badge>
					</div>

					<dl class="grid gap-4 sm:grid-cols-2">
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Downloaded</dt>
							<dd class="mt-1 text-sm">
								{formatManagedPackDate(data.pack.stagedVersion.downloadedAt)}
							</dd>
						</div>
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Published</dt>
							<dd class="mt-1 text-sm">
								{formatManagedPackDate(data.pack.stagedVersion.publishedAt)}
							</dd>
						</div>
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Pack name</dt>
							<dd class="mt-1 text-sm">{data.pack.stagedVersion.packName ?? 'Unavailable'}</dd>
						</div>
						<div class="rounded-md border px-4 py-3">
							<dt class="text-muted-foreground text-sm">Pack version</dt>
							<dd class="mt-1 text-sm">{data.pack.stagedVersion.packVersion ?? 'Unavailable'}</dd>
						</div>
					</dl>

					{#if data.pack.stagedVersion.packAuthors.length}
						<div class="space-y-2">
							<p class="text-muted-foreground text-sm">Authors</p>
							<div class="flex flex-wrap gap-2">
								{#each data.pack.stagedVersion.packAuthors as author (author)}
									<Badge variant="outline">{author}</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<div class="border-destructive rounded-md border px-4 py-4">
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div class="space-y-1">
								<h4 class="font-semibold">Website preview</h4>
								{#if stagedPreviewPack}
									<p class="text-muted-foreground text-sm leading-6">
										Adds an override to the texture pack selector across the site with this staged
										version.
									</p>
								{:else}
									<p class="text-muted-foreground text-sm leading-6">
										This staged version does not have a preview pack ID yet.
									</p>
								{/if}
							</div>

							{#if stagedPreviewPack}
								<div class="flex flex-wrap gap-2">
									<Button
										type="button"
										size="sm"
										onclick={() => enablePreview(data.pack.stagedVersion)}
									>
										{#if isPreviewActive(stagedPreviewPack.id)}
											Preview active
										{:else if isPreviewCached(stagedPreviewPack.id)}
											Enable preview
										{:else}
											Preview across site
										{/if}
									</Button>
									{#if isPreviewCached(stagedPreviewPack.id)}
										<Button
											type="button"
											size="sm"
											variant="outline"
											onclick={() => clearPreview(stagedPreviewPack.id)}
										>
											Clear preview
										</Button>
									{/if}
								</div>
							{/if}
						</div>
					</div>

					{#if data.pack.stagedVersion.validationMessage}
						<div
							class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
						>
							{data.pack.stagedVersion.validationMessage}
						</div>
					{/if}

					{#if data.pack.stagedVersion.submissionNotes}
						<div class="rounded-md border px-4 py-4">
							<h4 class="font-semibold">Submission notes</h4>
							<p class="text-muted-foreground mt-3 text-sm leading-6">
								{data.pack.stagedVersion.submissionNotes}
							</p>
						</div>
					{/if}

					{#if data.pack.stagedVersion.rejectionReason}
						<div
							class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
						>
							Rejected reason: {data.pack.stagedVersion.rejectionReason}
						</div>
					{/if}

					{#if canSubmit}
						<form
							method="POST"
							action="?/submitVersion"
							use:enhance={withLoading('submitVersion')}
							class="space-y-3 rounded-md border px-4 py-4"
						>
							<div class="space-y-2">
								<Label for="submissionNotes">Submission notes</Label>
								<Textarea
									id="submissionNotes"
									name="submissionNotes"
									rows={4}
									placeholder="Call out anything the reviewer should verify before this goes live."
								/>
							</div>

							<Button type="submit" disabled={actionLoading === 'submitVersion'}>
								{#if actionLoading === 'submitVersion'}
									<Loader2 class="mr-2 size-4 animate-spin" />
								{:else}
									<Check class="mr-2 size-4" />
								{/if}
								Submit for approval
							</Button>
						</form>
					{:else if data.pack.stagedVersion.status === 'pendingApproval'}
						<div class="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
							This staged version is waiting for an admin decision.
							{#if data.isAdmin}
								Approval controls are in the admin section below.
							{:else}
								No new download can be staged until it is approved or rejected.
							{/if}
						</div>
					{:else if data.pack.stagedVersion.status === 'rejected'}
						<div class="rounded-md border px-4 py-3 text-sm">
							Download another version from the browser to replace this rejected staging slot.
						</div>
					{:else if !data.pack.stagedVersion.validationSucceeded}
						<div
							class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
						>
							Validation needs to pass before this version can be submitted.
						</div>
					{/if}

					{#if data.pack.stagedVersion.primaryFileUrl}
						<Button
							href={data.pack.stagedVersion.primaryFileUrl}
							target="_blank"
							rel="noreferrer"
							variant="outline"
							class="w-full sm:w-fit"
						>
							View staged file
							<ExternalLink class="ml-2 size-4" />
						</Button>
					{/if}
				</div>
			{:else}
				<p class="text-muted-foreground mt-5 text-sm">
					No version is staged right now. Pick a release from the Modrinth browser to start a new update.
				</p>
			{/if}
		</section>

		<section class="py-5">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div class="space-y-1">
					<h2 class="text-2xl font-semibold">Available Modrinth versions</h2>
					<p class="text-muted-foreground text-sm">
						Pick a release to inspect its metadata, then stage it for validation.
					</p>
				</div>

				<p class="text-muted-foreground text-sm">
					Page {versionPage} of {versionPageCount}
				</p>
			</div>

			{#if data.versionsError}
				<div
					class="border-destructive/30 bg-destructive/10 text-destructive mt-5 rounded-md border px-4 py-3 text-sm"
				>
					{data.versionsError}
				</div>
			{/if}

			{#if selectedVersion}
				<div class="mt-5 rounded-md border px-4 py-4">
					<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<div class="space-y-3">
							<div class="flex flex-wrap items-center gap-2">
								<h3 class="text-xl font-semibold">{selectedVersion.versionName}</h3>
								<Badge variant="outline">{selectedVersion.versionNumber}</Badge>
								<Badge variant="secondary"
									>{humanizeManagedPackValue(selectedVersion.versionType)}</Badge
								>
								{#if selectedVersion.featured}
									<Badge>Featured</Badge>
								{/if}
							</div>

							<dl class="grid gap-3 sm:grid-cols-2">
								<div>
									<dt class="text-muted-foreground text-sm">Published</dt>
									<dd class="mt-1 text-sm">
										{formatManagedPackDate(selectedVersion.publishedAt)}
									</dd>
								</div>
								<div>
									<dt class="text-muted-foreground text-sm">Downloads</dt>
									<dd class="mt-1 text-sm">{selectedVersion.downloads.toLocaleString()}</dd>
								</div>
								<div>
									<dt class="text-muted-foreground text-sm">Primary file</dt>
									<dd class="mt-1 text-sm break-all">
										<FormattedText text={selectedVersion.primaryFileName} />
									</dd>
								</div>
								<div>
									<dt class="text-muted-foreground text-sm">File size</dt>
									<dd class="mt-1 text-sm">
										{formatManagedPackBytes(selectedVersion.primaryFileSize)}
									</dd>
								</div>
							</dl>

							{#if selectedVersion.gameVersions.length}
								<div class="space-y-2">
									<p class="text-muted-foreground text-sm">Game versions</p>
									<div class="flex flex-wrap gap-2">
										{#each selectedVersion.gameVersions as gameVersion (gameVersion)}
											<Badge variant="outline">{gameVersion}</Badge>
										{/each}
									</div>
								</div>
							{/if}

							{#if selectedVersion.loaders.length}
								<div class="space-y-2">
									<p class="text-muted-foreground text-sm">Loaders</p>
									<div class="flex flex-wrap gap-2">
										{#each selectedVersion.loaders as loader (loader)}
											<Badge variant="outline">{loader}</Badge>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<form
							method="POST"
							action="?/downloadVersion"
							use:enhance={withLoading('downloadVersion')}
							class="w-full lg:w-auto"
						>
							<input type="hidden" name="versionId" value={selectedVersion.versionId} />
							<Button
								type="submit"
								class="w-full lg:w-auto"
								disabled={pendingApproval ||
									cooldownRemainingMs > 0 ||
									actionLoading === 'downloadVersion'}
							>
								{#if actionLoading === 'downloadVersion'}
									<Loader2 class="mr-2 size-4 animate-spin" />
								{:else}
									<Download class="mr-2 size-4" />
								{/if}
								Download and validate
							</Button>
						</form>
					</div>

					{#if downloadMessage}
						<p class="text-muted-foreground mt-4 text-sm">{downloadMessage}</p>
					{/if}
				</div>
			{/if}

			<div class="mt-5">
				{#if !data.versions.versions.length}
					<div class="text-muted-foreground rounded-md border border-dashed px-4 py-8 text-center text-sm">
						No compatible Modrinth versions were found.
					</div>
				{:else}
					<div class="overflow-x-auto rounded-md border">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Version</Table.Head>
									<Table.Head class="min-w-36">Published</Table.Head>
									<Table.Head>File</Table.Head>
									<Table.Head class="w-24">Size</Table.Head>
									<Table.Head class="w-32 text-right">Action</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.versions.versions as version (version.versionId)}
									<Table.Row
										class={cn(
											'align-top',
											selectedVersionId === version.versionId && 'bg-primary/5'
										)}
									>
										<Table.Cell>
											<div class="space-y-2">
												<div class="flex flex-wrap items-center gap-2">
													<p class="font-semibold">{version.versionName}</p>
													<Badge variant="outline">{version.versionNumber}</Badge>
													<Badge variant="secondary">
														{humanizeManagedPackValue(version.versionType)}
													</Badge>
													{#if version.featured}
														<Badge>Featured</Badge>
													{/if}
												</div>
												{#if version.gameVersions.length || version.loaders.length}
													<Popover.Mobile>
														{#snippet trigger()}
															<span class="text-muted-foreground">Show details...</span>
														{/snippet}
														<div class="flex w-56 flex-wrap gap-2">
															<p>Versions</p>
															<div class="flex w-56 flex-wrap gap-2">
																{#each version.gameVersions as gameVersion (gameVersion)}
																	<Badge variant="outline">{gameVersion}</Badge>
																{/each}
															</div>
															<p>Loaders</p>
															<div class="flex w-56 flex-wrap gap-2">
																{#each version.loaders as loader (loader)}
																	<Badge variant="outline">{loader}</Badge>
																{/each}
															</div>
														</div>
													</Popover.Mobile>
												{/if}
											</div>
										</Table.Cell>
										<Table.Cell class="text-muted-foreground text-sm whitespace-nowrap">
											{formatManagedPackDate(version.publishedAt)}
										</Table.Cell>
										<Table.Cell>
											<p class="max-w-md text-sm break-all">
												<FormattedText text={version.primaryFileName} />
											</p>
										</Table.Cell>
										<Table.Cell class="text-muted-foreground text-sm whitespace-nowrap">
											{formatManagedPackBytes(version.primaryFileSize)}
										</Table.Cell>
										<Table.Cell class="text-right">
											<Button
												type="button"
												size="sm"
												variant={selectedVersionId === version.versionId
													? 'default'
													: 'outline'}
												onclick={() => {
													selectedVersionId = version.versionId;
												}}
											>
												{selectedVersionId === version.versionId ? 'Selected' : 'Inspect'}
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}
			</div>

			<div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="text-muted-foreground text-sm">
					Showing
					{#if data.versions.totalCount > 0}
						{data.versionOffset + 1}-{Math.min(
							data.versionOffset + data.versions.versions.length,
							data.versions.totalCount
						)}
					{:else}
						0
					{/if}
					of {data.versions.totalCount.toLocaleString()} versions
				</p>

				<div class="flex gap-2">
					{#if data.versionOffset > 0}
						<Button
							href={buildPageHref(Math.max(0, data.versionOffset - data.versionLimit), data.logOffset)}
							variant="outline"
						>
							Previous
						</Button>
					{:else}
						<Button variant="outline" disabled>Previous</Button>
					{/if}

					{#if data.versionOffset + data.versionLimit < data.versions.totalCount}
						<Button
							href={buildPageHref(data.versionOffset + data.versionLimit, data.logOffset)}
							variant="outline"
						>
							Next
						</Button>
					{:else}
						<Button variant="outline" disabled>Next</Button>
					{/if}
				</div>
			</div>
		</section>
	</div>

	{#if data.isAdmin}
		<section class="py-5">
			<div class="space-y-1">
				<h2 class="text-2xl font-semibold">Admin tools</h2>
				<p class="text-muted-foreground text-sm">
					Metadata changes, owner assignments, and approval controls live down here so the shared pack
					workflow stays cleaner for pack owners.
				</p>
			</div>

			<div class="mt-6 space-y-6">
				<div class="rounded-md border px-4 py-4">
					<div class="space-y-1">
						<h3 class="font-semibold">Pack definition</h3>
						<p class="text-muted-foreground text-sm">
							Update the managed pack metadata, directory, and Modrinth source.
						</p>
					</div>

					<form
						method="POST"
						action="?/updatePack"
						use:enhance={withLoading('updatePack')}
						class="mt-4 space-y-4"
					>
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for="slug">Slug</Label>
								<Input
									id="slug"
									name="slug"
									value={data.pack.slug}
									maxlength={64}
									disabled={actionLoading === 'updatePack'}
								/>
							</div>

							<div class="space-y-2">
								<Label for="displayName">Display name</Label>
								<Input
									id="displayName"
									name="displayName"
									value={data.pack.displayName}
									maxlength={128}
									disabled={actionLoading === 'updatePack'}
								/>
							</div>

							<div class="space-y-2">
								<Label for="directoryName">Directory name</Label>
								<Input
									id="directoryName"
									name="directoryName"
									value={data.pack.directoryName}
									maxlength={128}
									disabled={actionLoading === 'updatePack'}
								/>
							</div>

							<div class="space-y-2">
								<Label for="modrinthProjectUrl">Modrinth project URL</Label>
								<Input
									id="modrinthProjectUrl"
									name="modrinthProjectUrl"
									value={data.pack.modrinthProjectUrl}
									disabled={actionLoading === 'updatePack'}
								/>
							</div>
						</div>

						<div class="space-y-2">
							<Label for="authors">Authors</Label>
							<Textarea
								id="authors"
								name="authors"
								rows={3}
								value={packAuthorsValue}
								placeholder="One author per line, or separate with commas."
								disabled={actionLoading === 'updatePack'}
							/>
						</div>

						<div class="space-y-2">
							<Label for="notes">Notes</Label>
							<Textarea
								id="notes"
								name="notes"
								rows={4}
								value={data.pack.notes ?? ''}
								placeholder="Internal notes for reviewers or pack owners."
								disabled={actionLoading === 'updatePack'}
							/>
						</div>

						<Button type="submit" disabled={actionLoading === 'updatePack'}>
							{#if actionLoading === 'updatePack'}
								<Loader2 class="mr-2 size-4 animate-spin" />
							{:else}
								<Check class="mr-2 size-4" />
							{/if}
							Save metadata
						</Button>
					</form>
				</div>

				<div class="rounded-md border px-4 py-4">
					<div class="space-y-1">
						<h3 class="font-semibold">Pack owners</h3>
						<p class="text-muted-foreground text-sm">
							Assign PackOwner users so they can stage and submit versions.
						</p>
					</div>

					<div class="mt-4 space-y-3">
						{#if data.pack.owners.length}
							{#each data.pack.owners as owner (owner.accountId)}
								<div
									class="flex flex-col gap-3 rounded-md border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div class="space-y-1">
										<p class="font-medium">{owner.displayName}</p>
										<p class="text-muted-foreground font-mono text-xs">{owner.accountId}</p>
									</div>

									<form method="POST" action="?/removeOwner" use:enhance={withLoading('removeOwner')}>
										<input type="hidden" name="accountId" value={owner.accountId} />
										<Button
											type="submit"
											variant="destructive"
											disabled={actionLoading === 'removeOwner'}
										>
											{#if actionLoading === 'removeOwner'}
												<Loader2 class="mr-2 size-4 animate-spin" />
											{:else}
												<X class="mr-2 size-4" />
											{/if}
											Remove
										</Button>
									</form>
								</div>
							{/each}
						{:else}
							<p class="text-muted-foreground text-sm">
								No PackOwner users are assigned to this pack yet.
							</p>
						{/if}
					</div>

					<form
						method="POST"
						action="?/assignOwner"
						use:enhance={withLoading('assignOwner')}
						class="mt-5 space-y-3 rounded-md border px-4 py-4"
					>
						<div class="space-y-2">
							<Label>Assign pack owner</Label>

							{#if remainingPackOwnerOptions.length}
								<ComboBox
									disabled={actionLoading === 'assignOwner'}
									options={packOwnerOptions}
									exclude={assignedOwnerIds}
									bind:value={ownerAccountId}
									placeholder="Select a PackOwner"
									btnClass="w-full"
									popoverClass="w-full"
									triggerClass="w-full"
								/>
								<input type="hidden" name="accountId" bind:value={ownerAccountId} />
								<p class="text-muted-foreground text-sm">
									Only users who already have the <code>PackOwner</code> role can be assigned here.
								</p>
							{:else if data.packOwnerCandidates.length}
								<div class="rounded-md border px-4 py-3 text-sm">
									Every available PackOwner is already assigned to this pack.
								</div>
							{:else}
								<div class="rounded-md border px-4 py-3 text-sm">
									No PackOwner users are available yet. Grant the role on the admin users page first,
									then return here to assign them.
								</div>
							{/if}
						</div>

						{#if remainingPackOwnerOptions.length}
							<Button type="submit" disabled={ownerAccountId === '_' || actionLoading === 'assignOwner'}>
								{#if actionLoading === 'assignOwner'}
									<Loader2 class="mr-2 size-4 animate-spin" />
								{:else}
									<Check class="mr-2 size-4" />
								{/if}
								Assign owner
							</Button>
						{/if}
					</form>
				</div>

				<div class="rounded-md border px-4 py-4">
					<div class="space-y-1">
						<h3 class="font-semibold">Approval review</h3>
						<p class="text-muted-foreground text-sm">
							Make the final go-live decision for staged updates that are waiting on admin review.
						</p>
					</div>

					{#if data.pack.stagedVersion?.status === 'pendingApproval'}
						<div class="mt-4 space-y-4">
							<div class="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
								This staged version is ready for an admin decision.
							</div>

							<div class="flex flex-wrap gap-2">
								<form
									method="POST"
									action="?/approveVersion"
									use:enhance={withLoading('approveVersion')}
								>
									<Button type="submit" disabled={actionLoading === 'approveVersion'}>
										{#if actionLoading === 'approveVersion'}
											<Loader2 class="mr-2 size-4 animate-spin" />
										{:else}
											<Check class="mr-2 size-4" />
										{/if}
										Approve update
									</Button>
								</form>
							</div>

							<form
								method="POST"
								action="?/rejectVersion"
								use:enhance={withLoading('rejectVersion')}
								class="space-y-3 rounded-md border px-4 py-4"
							>
								<div class="space-y-2">
									<Label for="reason">Reject reason</Label>
									<Textarea
										id="reason"
										name="reason"
										rows={3}
										placeholder="Explain what needs to change before this version can be approved."
									/>
								</div>

								<Button
									type="submit"
									variant="destructive"
									disabled={actionLoading === 'rejectVersion'}
								>
									{#if actionLoading === 'rejectVersion'}
										<Loader2 class="mr-2 size-4 animate-spin" />
									{:else}
										<X class="mr-2 size-4" />
									{/if}
									Reject update
								</Button>
							</form>
						</div>
					{:else}
						<div
							class="text-muted-foreground mt-4 rounded-md border border-dashed px-4 py-8 text-center text-sm"
						>
							No staged update is waiting for review right now.
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<section class="py-5">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
			<div class="space-y-1">
				<h2 class="text-2xl font-semibold">Audit log</h2>
				<p class="text-muted-foreground text-sm">Recent activity for this pack, newest first.</p>
			</div>

			<p class="text-muted-foreground text-sm">
				Page {logPage} of {logPageCount}
			</p>
		</div>

		{#if data.auditLogsError}
			<div
				class="border-destructive/30 bg-destructive/10 text-destructive mt-5 rounded-md border px-4 py-3 text-sm"
			>
				{data.auditLogsError}
			</div>
		{/if}

		<div class="mt-5">
			{#if !data.auditLogs.logs.length}
				<div class="text-muted-foreground rounded-md border border-dashed px-4 py-8 text-center text-sm">
					No audit entries have been recorded yet.
				</div>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="min-w-36">Time</Table.Head>
								<Table.Head class="min-w-44">Actor</Table.Head>
								<Table.Head class="min-w-32">Action</Table.Head>
								<Table.Head>Details</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.auditLogs.logs as log (`${log.id}`)}
								<Table.Row class="align-top">
									<Table.Cell class="text-muted-foreground text-sm whitespace-nowrap">
										{formatManagedPackDate(log.createdAt)}
									</Table.Cell>
									<Table.Cell>
										<div class="space-y-1">
											<p class="font-medium">{log.actorDisplayName}</p>
											<p class="text-muted-foreground font-mono text-xs">
												{log.actorAccountId}
											</p>
										</div>
									</Table.Cell>
									<Table.Cell>
										<Badge variant="outline">{humanizeManagedPackValue(log.action)}</Badge>
									</Table.Cell>
									<Table.Cell>
										<p class="max-w-2xl text-sm leading-6">
											{log.details ?? 'No details were provided.'}
										</p>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</div>

		<div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-muted-foreground text-sm">
				Showing
				{#if data.auditLogs.totalCount > 0}
					{data.logOffset + 1}-{Math.min(
						data.logOffset + data.auditLogs.logs.length,
						data.auditLogs.totalCount
					)}
				{:else}
					0
				{/if}
				of {data.auditLogs.totalCount.toLocaleString()} entries
			</p>

			<div class="flex gap-2">
				{#if data.logOffset > 0}
					<Button
						href={buildPageHref(data.versionOffset, Math.max(0, data.logOffset - data.logLimit))}
						variant="outline"
					>
						Previous
					</Button>
				{:else}
					<Button variant="outline" disabled>Previous</Button>
				{/if}

				{#if data.logOffset + data.logLimit < data.auditLogs.totalCount}
					<Button href={buildPageHref(data.versionOffset, data.logOffset + data.logLimit)} variant="outline">
						Next
					</Button>
				{:else}
					<Button variant="outline" disabled>Next</Button>
				{/if}
			</div>
		</div>
	</section>
</div>
