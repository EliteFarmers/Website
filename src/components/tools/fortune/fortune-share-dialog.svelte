<script lang="ts">
	import { Button } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import { Input } from '$ui/input';
	import { Label } from '$ui/label';
	import { Textarea } from '$ui/textarea';
	import type { FortuneSandboxPlayerGearSource } from '$lib/schemas/tool-settings/fortune-sandbox';

	interface Props {
		open: boolean;
		name: string;
		description: string;
		url: string;
		info: string;
		error: string;
		compareMode: boolean;
		sideAPlayerGear: FortuneSandboxPlayerGearSource | null;
		sideBPlayerGear: FortuneSandboxPlayerGearSource | null;
		sideAName?: string;
		sideBName?: string;
		sharingSetup: boolean;
		canNativeShare: boolean;
		onSave: () => void;
		onCopy: () => void;
		onNativeShare: () => void;
	}

	let {
		open = $bindable(),
		name = $bindable(),
		description = $bindable(),
		url,
		info,
		error,
		compareMode,
		sideAPlayerGear,
		sideBPlayerGear,
		sideAName = 'Side A',
		sideBName = 'Side B',
		sharingSetup,
		canNativeShare,
		onSave,
		onCopy,
		onNativeShare,
	}: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[560px]">
		<Dialog.Header>
			<Dialog.Title>Share Setup</Dialog.Title>
			<Dialog.Description>Set a name and description before creating a share link.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4 py-4">
			<div class="flex flex-col gap-2">
				<Label for="share-setup-name">Name</Label>
				<Input id="share-setup-name" bind:value={name} maxlength={128} placeholder="Fortune Sandbox Setup" />
			</div>
			<div class="flex flex-col gap-2">
				<Label for="share-setup-description">Description</Label>
				<Textarea
					id="share-setup-description"
					bind:value={description}
					maxlength={512}
					rows={4}
					placeholder="Shareable setup for the Farming Fortune Sandbox tool"
				/>
			</div>
			{#if compareMode}
				<div class="text-muted-foreground text-sm">
					<p class="font-medium">This saved setup includes:</p>
					{#if sideAPlayerGear}
						<p>
							{sideAName} player gear: {sideAPlayerGear.playerName}
							{#if sideAPlayerGear.profileName}
								({sideAPlayerGear.profileName})
							{/if}
						</p>
					{/if}
					{#if sideBPlayerGear}
						<p>
							{sideBName} player gear: {sideBPlayerGear.playerName}
							{#if sideBPlayerGear.profileName}
								({sideBPlayerGear.profileName})
							{/if}
						</p>
					{/if}
				</div>
			{:else if sideAPlayerGear}
				<p class="text-muted-foreground text-sm">
					This saved setup includes loaded gear from player {sideAPlayerGear.playerName}
					{#if sideAPlayerGear.profileName}
						({sideAPlayerGear.profileName})
					{/if}
				</p>
			{/if}
			{#if url}
				<div class="flex flex-col gap-2">
					<Label for="share-setup-url">Share URL</Label>
					<Input id="share-setup-url" value={url} readonly />
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" onclick={onCopy}>Copy Link</Button>
						{#if canNativeShare}
							<Button variant="outline" onclick={onNativeShare}>Share</Button>
						{/if}
					</div>
				</div>
			{/if}
			{#if info}
				<p class="text-muted-foreground text-sm">{info}</p>
			{/if}
			{#if error}
				<p class="text-destructive text-sm">{error}</p>
			{/if}
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={sharingSetup}>Cancel</Button>
			<Button onclick={onSave} disabled={sharingSetup}>{sharingSetup ? 'Saving...' : 'Save And Copy Link'}</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
