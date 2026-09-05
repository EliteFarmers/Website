<script lang="ts">
	import PlayerSearch from '$comp/player-search.svelte';
	import { getProfilesAccount } from '$lib/remote';
	import { Label } from '$ui/label';
	import * as Select from '$ui/select';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	interface ProfileEntry {
		id: string;
		name: string;
		selected: boolean;
	}

	interface Props {
		playerUuid: string;
		profileUuid: string;
		playerName: string;
		profileName: string;
		profiles: ProfileEntry[];
		loading: boolean;
		error: string;
		onLoaded?: () => void | Promise<void>;
		lookup?: (nameOrId: string) => void | Promise<void>;
		class?: string;
	}

	let {
		playerUuid = $bindable(),
		profileUuid = $bindable(),
		playerName = $bindable(),
		profileName = $bindable(),
		profiles = $bindable(),
		loading = $bindable(),
		error = $bindable(),
		onLoaded,
		lookup,
		class: className = '',
	}: Props = $props();

	let searchValue = $state('');
	let activeRequest = 0;

	const profileOptions = $derived(profiles.map((p) => ({ value: p.id, label: p.name })));

	async function lookupPlayer(nameOrId: string) {
		if (!nameOrId.trim()) return;
		const request = ++activeRequest;

		loading = true;
		error = '';
		playerUuid = '';
		profileUuid = '';
		playerName = '';
		profileName = '';
		profiles = [];

		try {
			const result = await getProfilesAccount({ id: nameOrId.trim() });
			if (request !== activeRequest) return;
			if ('code' in result) {
				error = result.error ?? 'Player not found.';
				return;
			}
			if ('noProfiles' in result && result.noProfiles) {
				error = 'This player has no SkyBlock profiles.';
				return;
			}
			if (!('profile' in result) || !('profiles' in result)) {
				error = 'This player has no available SkyBlock profile.';
				return;
			}

			playerName = result.account.name ?? nameOrId;
			playerUuid = result.account.id ?? '';
			profileUuid = result.profile?.profileId ?? '';
			profileName = result.profile?.profileName ?? '';
			profiles = (result.profiles ?? []) as ProfileEntry[];

			await onLoaded?.();
		} catch {
			if (request !== activeRequest) return;
			error = 'Failed to look up player.';
		} finally {
			if (request === activeRequest) loading = false;
		}
	}

	async function switchProfile(newProfileId: string) {
		profileUuid = newProfileId;
		const profile = profiles.find((p) => p.id === newProfileId);
		if (profile) profileName = profile.name;
		await onLoaded?.();
	}
</script>

<div class="flex w-full max-w-md flex-col gap-3 {className}">
	<PlayerSearch bind:search={searchValue} cmd={lookup ?? lookupPlayer} useButton={true} />

	{#if loading}
		<div class="flex items-center gap-2">
			<Loader2 class="h-4 w-4 animate-spin" />
			<span class="text-sm text-muted-foreground">Loading...</span>
		</div>
	{/if}

	{#if profiles.length > 1}
		<div class="flex items-center gap-2">
			<Label for="tool-profile" class="text-xs">Profile</Label>
			<Select.Simple
				id="tool-profile"
				options={profileOptions}
				value={profileUuid}
				size="sm"
				class="w-48 text-xs"
				change={(value) => {
					if (value) void switchProfile(value);
				}}
			/>
		</div>
	{/if}

	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>
