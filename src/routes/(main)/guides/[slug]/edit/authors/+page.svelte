<script lang="ts">
	import PlayerSearch from '$comp/player-search.svelte';
	import { getGuideEditContext, MAX_GUIDE_AUTHORS } from '$lib/guides/edit-state.svelte';
	import { Badge } from '$ui/badge';
	import { Button } from '$ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$ui/card';
	import Crown from '@lucide/svelte/icons/crown';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import X from '@lucide/svelte/icons/x';

	const edit = getGuideEditContext();
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Guide Authors</CardTitle>
			<CardDescription
				>Guides can have up to four visible authors. Editors can save and submit drafts.</CardDescription
			>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="bg-destructive/20 border-destructive/70 rounded-md border p-3 text-sm">
				Please note that despite being able to assign multiple authors, <strong
					>editing the guide simultaneously with others is not currently supported.</strong
				> To avoid losing changes, coordinate with your co-authors and only edit the guide when others are not making
				changes.
			</div>
			{#if edit.canManageGuide}
				<div class="grid gap-3">
					{#each edit.editableAuthors as author (author.id)}
						<div
							class="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
						>
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<p class="truncate font-medium">{author.name}</p>
									<Badge variant={author.isOwner ? 'default' : 'secondary'}
										>{author.isOwner ? 'Owner' : 'Editor'}</Badge
									>
								</div>
								<p class="text-muted-foreground mt-1 text-xs">{author.id}</p>
							</div>
							<div class="flex shrink-0 gap-2">
								{#if !author.isOwner}
									<Button size="sm" variant="outline" onclick={() => edit.makeOwner(author.id)}>
										<Crown class="mr-2 size-4" />
										Make owner
									</Button>
								{/if}
								<Button
									size="icon"
									variant="ghost"
									aria-label="Remove author"
									disabled={edit.editableAuthors.length <= 1}
									onclick={() => edit.removeAuthor(author.id)}
								>
									<X class="size-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>

				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<Button
						variant="outline"
						onclick={() => (edit.authorSearchOpen = true)}
						disabled={edit.isResolvingAuthor || edit.editableAuthors.length >= MAX_GUIDE_AUTHORS}
					>
						<UserPlus class="mr-2 size-4" />
						Add Player
					</Button>
					<p class="text-muted-foreground text-sm">
						{edit.editableAuthors.length} / {MAX_GUIDE_AUTHORS} authors
					</p>
				</div>

				<PlayerSearch
					useButton={false}
					bind:open={edit.authorSearchOpen}
					bind:search={edit.authorSearchValue}
					cmd={(username) => edit.addAuthorByUsername(username)}
				/>

				<div class="grid gap-3">
					{#if edit.authorError}
						<p class="text-destructive text-sm">{edit.authorError}</p>
					{/if}
					<Button
						onclick={() => edit.handleSaveAuthors()}
						disabled={edit.isSavingAuthors || !edit.editableOwnerId}
					>
						{edit.isSavingAuthors ? 'Saving...' : 'Save Authors'}
					</Button>
				</div>
			{:else}
				<div class="grid gap-2">
					{#each edit.guideAuthors as author (author.author.id)}
						<div class="flex items-center justify-between rounded-md border p-3">
							<div>
								<p class="font-medium">{author.author.name}</p>
								<p class="text-muted-foreground text-xs">{author.author.id}</p>
							</div>
							<Badge variant={author.isOwner ? 'default' : 'secondary'}
								>{author.isOwner ? 'Owner' : 'Editor'}</Badge
							>
						</div>
					{/each}
				</div>
				<p class="text-muted-foreground text-sm">Only the guide owner or an admin can change authors.</p>
			{/if}
		</CardContent>
	</Card>
</div>
