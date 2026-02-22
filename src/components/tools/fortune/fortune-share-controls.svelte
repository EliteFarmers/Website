<script lang="ts">
	import { goto } from '$app/navigation';
	import FortuneShareDialog from '$comp/tools/fortune/fortune-share-dialog.svelte';
	import { saveFortuneSandboxShareCommand } from '$lib/remote';
	import type {
		FortuneSandboxPlayerGearSource,
		FortuneSandboxToolSettingData,
	} from '$lib/schemas/tool-settings/fortune-sandbox';
	import { Button } from '$ui/button';

	interface Props {
		authorized: boolean;
		loginRedirectHref: string;
		compareMode: boolean;
		sideAPlayerGear: FortuneSandboxPlayerGearSource | null;
		sideBPlayerGear: FortuneSandboxPlayerGearSource | null;
		createSharePayload: () => FortuneSandboxToolSettingData;
	}

	let { authorized, loginRedirectHref, compareMode, sideAPlayerGear, sideBPlayerGear, createSharePayload }: Props = $props();

	let shareMessage = $state('');
	let shareDialogOpen = $state(false);
	let shareDialogError = $state('');
	let shareDialogInfo = $state('');
	let shareDialogName = $state('Fortune Sandbox Setup');
	let shareDialogDescription = $state('Shareable setup for the Farming Fortune Sandbox tool');
	let shareDialogUrl = $state('');
	let sharingSetup = $state(false);

	const canNativeShare = $derived.by(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function');

	async function openShareDialog() {
		if (!authorized) {
			await goto(loginRedirectHref);
			return;
		}
		shareDialogError = '';
		shareDialogInfo = '';
		shareDialogUrl = '';
		shareDialogOpen = true;
	}

	async function copyShareDialogUrl() {
		if (!shareDialogUrl) return;
		try {
			await navigator.clipboard.writeText(shareDialogUrl);
			shareDialogInfo = 'Copied share URL';
			shareDialogError = '';
		} catch {
			shareDialogError = 'Failed to copy share URL';
		}
	}

	async function nativeShareDialogUrl() {
		if (!shareDialogUrl || typeof navigator === 'undefined' || typeof navigator.share !== 'function') return;
		try {
			await navigator.share({
				title: shareDialogName.trim() || 'Fortune Sandbox Setup',
				text: shareDialogDescription.trim() || undefined,
				url: shareDialogUrl,
			});
		} catch {
			// Ignore cancellation and share target failures.
		}
	}

	async function saveShareSetup() {
		if (!authorized) {
			await goto(loginRedirectHref);
			return;
		}

		sharingSetup = true;
		shareDialogError = '';
		shareDialogInfo = '';
		try {
			const saved = await saveFortuneSandboxShareCommand({
				name: shareDialogName.trim() || null,
				description: shareDialogDescription.trim() || null,
				data: createSharePayload(),
			});
			if (saved.error === 'Unauthorized') {
				await goto(loginRedirectHref);
				return;
			}
			if (saved.error || !saved.settingId) {
				shareDialogError = saved.error ?? 'Failed to save setup';
				return;
			}

			const url = new URL(window.location.href);
			url.searchParams.set('share', saved.settingId);
			window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
			shareDialogUrl = url.toString();
			try {
				await navigator.clipboard.writeText(shareDialogUrl);
				shareDialogInfo = 'Saved setup and copied share URL';
				shareMessage = 'Copied share URL';
			} catch {
				shareDialogInfo = 'Saved setup. Copy or share the link below.';
				shareMessage = 'Saved share URL';
			}
			setTimeout(() => (shareMessage = ''), 2500);
		} catch {
			shareDialogError = 'Failed to save setup';
		} finally {
			sharingSetup = false;
		}
	}
</script>

<div class="flex items-center gap-3">
	{#if shareMessage}
		<span class="text-muted-foreground text-sm">{shareMessage}</span>
	{/if}
	<Button onclick={openShareDialog}>Share Setup</Button>
</div>

<FortuneShareDialog
	bind:open={shareDialogOpen}
	bind:name={shareDialogName}
	bind:description={shareDialogDescription}
	url={shareDialogUrl}
	info={shareDialogInfo}
	error={shareDialogError}
	compareMode={compareMode}
	sideAPlayerGear={sideAPlayerGear}
	sideBPlayerGear={sideBPlayerGear}
	sharingSetup={sharingSetup}
	canNativeShare={canNativeShare}
	onSave={saveShareSetup}
	onCopy={copyShareDialogUrl}
	onNativeShare={nativeShareDialogUrl}
/>
