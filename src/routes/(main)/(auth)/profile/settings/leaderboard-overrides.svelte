<script lang="ts">
	import type {
		CosmeticSelection,
		DictionaryOfStringAndLeaderboardAppearanceOverride,
		LeaderboardAppearanceOverride,
	} from '$lib/api';
	import { CosmeticSelectionMode } from '$lib/api/schemas/CosmeticSelectionMode';
	import type { LeaderboardInfo } from '$lib/constants/leaderboards';
	import { Input } from '$ui/input';
	import Search from '@lucide/svelte/icons/search';

	interface StyleOption {
		label: string;
		value: string;
	}

	interface Props {
		leaderboards: Record<string, LeaderboardInfo>;
		overrides: DictionaryOfStringAndLeaderboardAppearanceOverride;
		styleOptions: StyleOption[];
		frameOptions: StyleOption[];
		showFrameOptions?: boolean;
		disabled?: boolean;
		onchange: (overrides: DictionaryOfStringAndLeaderboardAppearanceOverride) => void;
	}

	let {
		leaderboards,
		overrides,
		styleOptions,
		frameOptions,
		showFrameOptions = true,
		disabled = false,
		onchange,
	}: Props = $props();

	const searchId = $props.id();
	let search = $state('');

	const orderedLeaderboards = $derived.by(() =>
		Object.values(leaderboards).sort((left, right) =>
			leaderboardName(left).localeCompare(leaderboardName(right), undefined, { sensitivity: 'base' })
		)
	);
	const configuredLeaderboards = $derived(
		orderedLeaderboards.filter((leaderboard) => hasConfiguredOverride(leaderboard.id))
	);
	const normalizedSearch = $derived(search.trim().toLocaleLowerCase());
	const searchResults = $derived.by(() => {
		if (!normalizedSearch) return [];

		return orderedLeaderboards.filter((leaderboard) => {
			if (hasConfiguredOverride(leaderboard.id)) return false;

			return `${leaderboardName(leaderboard)} ${leaderboard.short ?? ''} ${leaderboard.id}`
				.toLocaleLowerCase()
				.includes(normalizedSearch);
		});
	});

	function leaderboardName(leaderboard: LeaderboardInfo) {
		return `${leaderboard.title}${leaderboard.suffix}`;
	}

	function hasConfiguredOverride(id: string) {
		const override = overrides[id];
		return (
			!!override &&
			(override.style.mode !== CosmeticSelectionMode.Inherit ||
				(showFrameOptions && override.frame.mode !== CosmeticSelectionMode.Inherit))
		);
	}

	function selectionValue(selection: CosmeticSelection | undefined) {
		if (selection?.mode === CosmeticSelectionMode.None) return 'none';
		if (selection?.mode === CosmeticSelectionMode.Selected && selection.id != null) return String(selection.id);
		return 'inherit';
	}

	function parseSelection(value: string): CosmeticSelection {
		if (value === 'none') return { mode: CosmeticSelectionMode.None };
		if (value === 'inherit') return { mode: CosmeticSelectionMode.Inherit };
		return { mode: CosmeticSelectionMode.Selected, id: Number(value) };
	}

	function updateOverride(id: string, target: 'style' | 'frame', value: string) {
		const current: LeaderboardAppearanceOverride = overrides[id] ?? {
			style: { mode: CosmeticSelectionMode.Inherit },
			frame: { mode: CosmeticSelectionMode.Inherit },
		};
		const nextOverride: LeaderboardAppearanceOverride = {
			style: target === 'style' ? parseSelection(value) : current.style,
			frame: target === 'frame' ? parseSelection(value) : current.frame,
		};
		const nextOverrides = { ...overrides };

		if (
			nextOverride.style.mode === CosmeticSelectionMode.Inherit &&
			nextOverride.frame.mode === CosmeticSelectionMode.Inherit
		) {
			delete nextOverrides[id];
		} else {
			nextOverrides[id] = nextOverride;
		}

		onchange(nextOverrides);
	}
</script>

<details class="rounded-md border p-3">
	<summary class="cursor-pointer font-medium">Per-leaderboard overrides</summary>
	<div class="mt-4 space-y-5">
		{#if configuredLeaderboards.length > 0}
			<div class="space-y-2">
				<p class="text-sm text-muted-foreground">Configured</p>
				{#each configuredLeaderboards as leaderboard (leaderboard.id)}
					{@render overrideRow(leaderboard)}
				{/each}
			</div>
		{/if}

		<div class="space-y-2">
			<label for={searchId} class="text-sm font-medium">Add an override</label>
			<div class="relative">
				<Search class="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
				<Input
					id={searchId}
					class="pl-9"
					placeholder="Search by leaderboard name or slug"
					bind:value={search}
				/>
			</div>

			{#if !normalizedSearch}
				<p class="text-sm text-muted-foreground">Search to choose another leaderboard.</p>
			{:else if searchResults.length > 0}
				<div class="space-y-2">
					{#each searchResults as leaderboard (leaderboard.id)}
						{@render overrideRow(leaderboard)}
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No matching leaderboards without an override.</p>
			{/if}
		</div>
	</div>
</details>
<input type="hidden" name="leaderboardOverrides" value={JSON.stringify(overrides)} />

{#snippet overrideRow(leaderboard: LeaderboardInfo)}
	{@const name = leaderboardName(leaderboard)}
	<div
		class="grid gap-2 rounded-md border p-2 sm:items-center {showFrameOptions
			? 'sm:grid-cols-[minmax(0,1fr)_12rem_12rem]'
			: 'sm:grid-cols-[minmax(0,1fr)_12rem]'}"
	>
		<div class="min-w-0">
			<p class="truncate text-sm font-medium">{name}</p>
			<p class="truncate text-xs text-muted-foreground">{leaderboard.id}</p>
		</div>
		<select
			class="h-9 min-w-0 rounded-md border bg-background px-2 text-sm"
			value={selectionValue(overrides[leaderboard.id]?.style)}
			onchange={(event) => updateOverride(leaderboard.id, 'style', event.currentTarget.value)}
			aria-label={`${name} style`}
			{disabled}
		>
			<option value="inherit">Inherit style</option>
			<option value="none">No style</option>
			{#each styleOptions as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		{#if showFrameOptions}
			<select
				class="h-9 min-w-0 rounded-md border bg-background px-2 text-sm"
				value={selectionValue(overrides[leaderboard.id]?.frame)}
				onchange={(event) => updateOverride(leaderboard.id, 'frame', event.currentTarget.value)}
				aria-label={`${name} frame`}
				{disabled}
			>
				<option value="inherit">Inherit frame</option>
				<option value="none">No frame</option>
				{#each frameOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		{/if}
	</div>
{/snippet}
