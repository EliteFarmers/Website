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
		onLoaded?: () => void;
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
		class: className = '',
	}: Props = $props();

	let searchValue = $state('');

	const profileOptions = $derived(profiles.map((p) => ({ value: p.id, label: p.name })));

	async function lookupPlayer(nameOrId: string) {
		if (!nameOrId.trim()) return;

		loading = true;
		error = '';
		playerUuid = '';
		profileUuid = '';
		playerName = '';
		profileName = '';
		profiles = [];

		try {
			const result = await getProfilesAccount({ id: nameOrId.trim() });
			if ('code' in result) {
				error = result.error ?? 'Player not found.';
				return;
			}
			if (result.noProfiles) {
				error = 'This player has no SkyBlock profiles.';
				return;
			}

			playerName = result.account.name ?? nameOrId;
			playerUuid = result.account.id ?? '';
			profileUuid = result.profile?.profileId ?? '';
			profileName = result.profile?.profileName ?? '';
			profiles = (result.profiles ?? []) as ProfileEntry[];

			onLoaded?.();
		} catch {
			error = 'Failed to look up player.';
		} finally {
			loading = false;
		}
	}

	function switchProfile(newProfileId: string) {
		profileUuid = newProfileId;
		const profile = profiles.find((p) => p.id === newProfileId);
		if (profile) profileName = profile.name;
		onLoaded?.();
	}
</script>

<div class="flex w-full max-w-md flex-col gap-3 {className}">
	<PlayerSearch bind:search={searchValue} cmd={lookupPlayer} useButton={true} />

	{#if loading}
		<div class="flex items-center gap-2">
			<Loader2 class="h-4 w-4 animate-spin" />
			<span class="text-muted-foreground text-sm">Loading...</span>
		</div>
	{/if}

	{#if profiles.length > 1}
		<div class="flex items-center gap-2">
			<Label class="text-xs">Profile:</Label>
			<Select.Simple
				options={profileOptions}
				value={profileUuid}
				size="sm"
				class="w-48 text-xs"
				change={(value) => {
					if (value) switchProfile(value);
				}}
			/>
		</div>
	{/if}

	{#if error}
		<p class="text-destructive text-sm">{error}</p>
	{/if}
</div>
