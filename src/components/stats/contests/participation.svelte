<script lang="ts">
	import type { components } from '$lib/api/api';
	import * as Popover from '$ui/popover';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	interface Props {
		entry: components['schemas']['StrippedContestParticipationDto'];
	}

	let { entry }: Props = $props();
</script>

<a
	href="/@{entry.playerName}/{entry.profileUuid}"
	data-sveltekit-preload-data="tap"
	class="bg-card-primary rounded-md hover:bg-muted"
>
	<div class="flex justify-between gap-0 md:gap-2">
		<div
			class="mx-2 flex grow items-center justify-start gap-1 overflow-hidden text-ellipsis whitespace-nowrap align-middle sm:gap-2"
		>
			<p class="text-progress">
				{#if entry.position !== -1}
					<span class="xs:text-md text-sm sm:text-lg md:text-xl">#</span><span
						class="xs:text-xl text-lg sm:text-xl md:text-2xl">{(entry.position ?? 0) + 1}</span
					>
				{:else}
					<span class="xs:text-md text-sm sm:text-xl md:text-2xl">???</span>
				{/if}
			</p>
			{#if entry.removed}
				<Popover.Mobile>
					{#snippet trigger()}
						<div class="mt-2">
							<CircleAlert class="text-destructive" size={24} />
						</div>
					{/snippet}
					<div>
						<p class="text-lg font-semibold">This participation no longer exists!</p>
						<p class="max-w-xs whitespace-normal break-words">
							{entry.playerName} may have been banned or deleted their profile.
						</p>
					</div>
				</Popover.Mobile>
			{/if}
			<!-- <Face {ign} base={face?.base} overlay={face?.overlay} /> -->
			<div class="flex grow flex-col overflow-hidden text-ellipsis whitespace-nowrap">
				<p class="xs:text-xl inline-block max-w-60 truncate text-start text-sm font-semibold sm:text-2xl">
					{entry.playerName}
				</p>
			</div>
		</div>
		<div class="mr-2 flex items-center justify-end gap-2 p-1 align-middle md:mx-2">
			<div class="xs:text-xl font-mono text-sm sm:text-2xl">
				{entry.collected?.toLocaleString()}
			</div>
			{#if entry.medal && entry.medal !== 'none'}
				<img
					class="pixelated inline-block h-6 w-6"
					src="/images/medals/{entry.medal}.webp"
					alt="Earned Medal"
				/>
			{/if}
		</div>
	</div>
</a>
