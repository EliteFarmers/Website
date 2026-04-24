<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$comp/head.svelte';
	import type { ManagedResourcePackDto } from '$lib/api';
	import { type Crumb, getPageCtx } from '$lib/hooks/page.svelte';
	import {
		formatManagedPackDate,
		getManagedPackStatusVariant,
		humanizeManagedPackValue,
	} from '$lib/managed-resource-packs';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import * as Table from '$ui/table';
	import { Textarea } from '$ui/textarea';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Plus from '@lucide/svelte/icons/plus';
	import Settings from '@lucide/svelte/icons/settings';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const pageCtx = getPageCtx();
	const crumbs: Crumb[] = [
		{
			name: 'Admin',
			href: '/admin',
		},
		{
			name: 'Textures',
		},
	];

	const liveCount = $derived.by(() => data.packs.filter((pack: ManagedResourcePackDto) => pack.liveVersion).length);
	const stagedCount = $derived.by(
		() => data.packs.filter((pack: ManagedResourcePackDto) => pack.stagedVersion).length
	);
	const createPackError = $derived(form?.action === 'createPack' ? form.error : undefined);

	let createPackModal = $state(false);
	let createLoading = $state(false);

	$effect.pre(() => {
		pageCtx.setBreadcrumbs(crumbs);
	});

	$effect(() => {
		if (createPackError) {
			createPackModal = true;
		}
	});

	function getLiveVersionLabel(pack: ManagedResourcePackDto) {
		if (!pack.liveVersion) return 'Not live';
		return `${pack.liveVersion.versionNumber} - ${pack.liveVersion.versionName}`;
	}

	function getStagedVersionLabel(pack: ManagedResourcePackDto) {
		if (!pack.stagedVersion) return 'Nothing staged';
		return `${pack.stagedVersion.versionNumber} - ${humanizeManagedPackValue(pack.stagedVersion.status)}`;
	}

	function getPackAuthorsLabel(pack: ManagedResourcePackDto) {
		return pack.authors.length ? pack.authors.join(', ') : 'None';
	}
</script>

<Head title="Texture Packs" description="Manage staged and live texture packs." />

<div class="my-16 flex flex-col gap-6">
	<section class="my-8 flex w-full flex-col gap-4">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<h1 class="mb-4 text-4xl">Texture Packs</h1>
				<p class="text-muted-foreground text-sm">Manage resource packs here!</p>
			</div>

			{#if data.isAdmin}
				<Button
					onclick={() => {
						createPackModal = true;
					}}
					class="w-fit"
				>
					<Plus class="mr-2 size-4" />
					New Pack
				</Button>
			{/if}
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<Badge variant="outline">{data.totalCount} accessible</Badge>
			<Badge variant="outline">{liveCount} live</Badge>
			<Badge variant="outline">{stagedCount} staged</Badge>

			{#if data.isAdmin}
				<Button href="/admin/resourcepacks" size="sm" variant={data.pendingOnly ? 'outline' : 'secondary'}>
					All packs
				</Button>
				<Button
					href="/admin/resourcepacks?view=pending"
					size="sm"
					variant={data.pendingOnly ? 'secondary' : 'outline'}
				>
					Approval queue
					<Badge variant={data.pendingCount > 0 ? 'destructive' : 'secondary'} class="ml-2">
						{data.pendingCount}
					</Badge>
				</Button>
			{/if}
		</div>

		{#if data.pendingOnly}
			<div class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
				Showing packs with staged versions waiting for review.
			</div>
		{/if}

		<div class="overflow-x-auto rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="min-w-56">Pack</Table.Head>
						<Table.Head class="w-32 text-right">Actions</Table.Head>
						<Table.Head class="min-w-44">Owners</Table.Head>
						<Table.Head class="min-w-44">Authors</Table.Head>
						<Table.Head class="min-w-52">Live Version</Table.Head>
						<Table.Head class="min-w-52">Staged Version</Table.Head>
						<Table.Head class="min-w-36">Updated</Table.Head>
						<Table.Head class="min-w-56">Notes</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if !data.packs.length}
						<Table.Row>
							<Table.Cell colspan={8} class="h-24 text-center">
								{data.pendingOnly ? 'No packs are waiting for approval.' : 'No packs are assigned yet.'}
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.packs as pack (pack.id)}
							<Table.Row class="align-top">
								<Table.Cell>
									<a class="space-y-2" href="/admin/resourcepacks/{pack.id}">
										<div class="flex flex-wrap items-center gap-2">
											<p class="font-semibold">{pack.displayName}</p>
											{#if pack.stagedVersion?.status === 'pendingApproval'}
												<Badge variant="destructive">Needs review</Badge>
											{/if}
										</div>
										<div class="text-muted-foreground flex flex-col gap-1 text-xs">
											<span class="font-mono">{pack.slug}</span>
											<span class="font-mono">{pack.directoryName}</span>
										</div>
									</a>
								</Table.Cell>
								<Table.Cell>
									<div class="flex justify-end gap-2">
										<Button
											href={pack.modrinthProjectUrl}
											target="_blank"
											rel="noreferrer"
											variant="ghost"
											size="sm"
											aria-label="Open Modrinth project"
										>
											<ExternalLink class="size-4" />
										</Button>
										<Button
											href="/admin/resourcepacks/{pack.id}"
											size="sm"
											aria-label="Manage pack"
										>
											<Settings class="size-4" />
										</Button>
									</div>
								</Table.Cell>
								<Table.Cell>
									{#if pack.owners.length}
										<div class="flex flex-wrap gap-1.5">
											{#each pack.owners as owner (owner.accountId)}
												<Badge variant="outline">{owner.displayName}</Badge>
											{/each}
										</div>
									{:else}
										<span class="text-muted-foreground text-sm">None</span>
									{/if}
								</Table.Cell>
								<Table.Cell>
									<p
										class="text-muted-foreground max-w-56 truncate text-sm"
										title={getPackAuthorsLabel(pack)}
									>
										{getPackAuthorsLabel(pack)}
									</p>
								</Table.Cell>
								<Table.Cell>
									<div class="space-y-1">
										<Badge variant={pack.liveVersion ? 'default' : 'outline'}>
											{pack.liveVersion ? 'Live' : 'Not live'}
										</Badge>
										<p class="text-muted-foreground max-w-64 text-sm">
											{getLiveVersionLabel(pack)}
										</p>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="space-y-1">
										{#if pack.stagedVersion}
											<Badge variant={getManagedPackStatusVariant(pack.stagedVersion.status)}>
												{humanizeManagedPackValue(pack.stagedVersion.status)}
											</Badge>
										{:else}
											<Badge variant="outline">None</Badge>
										{/if}
										<p class="text-muted-foreground max-w-64 text-sm">
											{getStagedVersionLabel(pack)}
										</p>
									</div>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground text-sm whitespace-nowrap">
									{formatManagedPackDate(pack.updatedAt)}
								</Table.Cell>
								<Table.Cell>
									<p class="text-muted-foreground max-w-72 truncate text-sm" title={pack.notes ?? ''}>
										{pack.notes ?? '-'}
									</p>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	</section>
</div>

<Dialog.Root bind:open={createPackModal}>
	<Dialog.Content class="sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Create Managed Pack</Dialog.Title>
			<Dialog.Description>
				Set up a new managed texture pack definition backed by a Modrinth project URL.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/createPack"
			class="space-y-4"
			use:enhance={() => {
				createLoading = true;

				return async ({ result, update }) => {
					createLoading = false;
					if (result.type !== 'failure') {
						createPackModal = false;
					}
					await update();
				};
			}}
		>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="pack-slug">Slug</Label>
					<Input id="pack-slug" name="slug" placeholder="hyware" maxlength={64} disabled={createLoading} />
				</div>

				<div class="space-y-2">
					<Label for="pack-display-name">Display Name</Label>
					<Input
						id="pack-display-name"
						name="displayName"
						placeholder="Hyware"
						maxlength={128}
						disabled={createLoading}
					/>
				</div>

				<div class="space-y-2">
					<Label for="pack-directory-name">Directory Name</Label>
					<Input
						id="pack-directory-name"
						name="directoryName"
						placeholder="hyware"
						maxlength={128}
						disabled={createLoading}
					/>
				</div>

				<div class="space-y-2">
					<Label for="pack-modrinth-url">Modrinth Project URL</Label>
					<Input
						id="pack-modrinth-url"
						name="modrinthProjectUrl"
						placeholder="https://modrinth.com/resourcepack/hyware"
						maxlength={256}
						disabled={createLoading}
					/>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="pack-authors">Authors</Label>
				<Textarea
					id="pack-authors"
					name="authors"
					rows={3}
					placeholder="One author per line, or separate with commas."
					disabled={createLoading}
				/>
			</div>

			<div class="space-y-2">
				<Label for="pack-notes">Internal Notes</Label>
				<Textarea
					id="pack-notes"
					name="notes"
					rows={4}
					placeholder="Optional context for moderators and pack owners."
					disabled={createLoading}
				/>
			</div>

			{#if createPackError}
				<p class="text-destructive text-sm">{createPackError}</p>
			{/if}

			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (createPackModal = false)}
					disabled={createLoading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={createLoading}>
					{#if createLoading}
						<Loader2 class="mr-2 size-4 animate-spin" />
					{:else}
						<Plus class="mr-2 size-4" />
					{/if}
					Create pack
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
