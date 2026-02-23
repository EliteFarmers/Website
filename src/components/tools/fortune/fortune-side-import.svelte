<script lang="ts">
	import PlayerSearch from '$comp/player-search.svelte';
	import { Button } from '$ui/button';
	import * as Select from '$ui/select';

	type SideKey = 'A' | 'B';

	interface SideImportState {
		searchOpen: boolean;
		searchValue: string;
		loadState: 'idle' | 'loading' | 'loaded' | 'error';
		loadMessage: string;
		loadedPlayerName: string;
		loadedPlayerUuid: string;
		profileOptions: { value: string; label: string }[];
		selectedProfileId: string;
	}

	interface Props {
		sideKey: SideKey;
		sideName?: string;
		state: SideImportState;
		loadPlayer: (nameOrId: string, targetSide: SideKey) => Promise<void> | void;
		reloadSelectedProfile: (targetSide: SideKey) => Promise<void> | void;
		showHeading?: boolean;
		class?: string;
	}

	// eslint-disable-next-line svelte/no-unused-props
	let {
		sideKey,
		sideName = `Side ${sideKey}`,
		state = $bindable(),
		loadPlayer,
		reloadSelectedProfile,
		showHeading = true,
		class: className = '',
	}: Props = $props();

	const displaySideName = $derived.by(() => {
		const trimmed = sideName.trim();
		return trimmed || `Side ${sideKey}`;
	});
</script>

<section class={`bg-card flex flex-col gap-3 rounded-lg border p-4 ${className}`.trim()}>
	{#if showHeading}
		<div class="flex flex-col gap-1">
			<h3 class="text-base font-semibold">Import {displaySideName} from Player</h3>
			<p class="text-muted-foreground text-sm">
				Loading a player replaces this side's pet, tools, armor, equipment, and stats.
			</p>
		</div>
	{/if}
	<div class="flex flex-wrap items-center gap-3">
		<PlayerSearch
			useButton={true}
			class="w-72"
			bind:open={state.searchOpen}
			bind:search={state.searchValue}
			cmd={(player) => {
				state.searchValue = player;
				void loadPlayer(player, sideKey);
			}}
		/>
		<Button
			variant="outline"
			onclick={() => void loadPlayer(state.searchValue, sideKey)}
			disabled={state.loadState === 'loading'}
		>
			{state.loadState === 'loading' ? 'Loading...' : `Load ${displaySideName}`}
		</Button>
		{#if state.profileOptions.length > 0}
			<div class="flex flex-wrap items-center gap-2">
				<Select.Simple
					options={state.profileOptions}
					value={state.selectedProfileId}
					change={(value) => {
						if (value) state.selectedProfileId = value;
					}}
				/>
				<Button
					variant="outline"
					onclick={() => void reloadSelectedProfile(sideKey)}
					disabled={state.loadState === 'loading'}
				>
					Load Profile
				</Button>
			</div>
		{/if}
	</div>
	{#if state.loadMessage}
		<p class="text-sm {state.loadState === 'error' ? 'text-destructive' : 'text-muted-foreground'}">
			{state.loadMessage}
		</p>
	{/if}
</section>
