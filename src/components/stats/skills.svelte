<script lang="ts">
	import { getLevelProgress } from '$lib/format';
	import Skillbar from './skillbar.svelte';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import * as Collapsible from '$ui/collapsible';
	import { Button } from '$ui/button';
	import { getGardenLevel } from 'farming-weight';
	import { slide } from 'svelte/transition';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	const ctx = getStatsContext();

	const ranks = $derived(ctx.ranks);
	const skills = $derived(ctx.member.skills);
	const levelCaps = $derived((ctx.member.unparsed?.levelCaps ?? {}) as Record<string, number | undefined>);
	const gardenXp = $derived(ctx.garden?.experience ?? 0);
</script>

<Collapsible.Root bind:open class="mx-4 w-full">
	<div class="flex flex-row items-center justify-center">
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<div class="flex w-full flex-row items-end justify-center gap-4">
					<div class="flex w-full flex-1 flex-col items-end justify-center gap-4 md:flex-row">
						<Skillbar
							name="Farming"
							rank={ranks?.farming?.rank}
							progress={getLevelProgress('farming', skills?.farming ?? 0, 50 + (levelCaps?.farming ?? 0))}
						/>
						<Button variant="outline" class="-mb-1 hidden w-10 p-0 md:flex" {...props}>
							<ChevronsUpDown class="h-4 w-4" />
							<span class="sr-only">Skill Toggle</span>
						</Button>
						<Skillbar name="Garden" rank={ctx.ranks?.garden?.rank} progress={getGardenLevel(gardenXp)} />
					</div>
					<div class="md:hidden">
						<Button variant="outline" class="-mb-1 w-10 p-0" {...props}>
							<ChevronsUpDown class="h-4 w-4" />
							<span class="sr-only">Toggle</span>
						</Button>
					</div>
				</div>
			{/snippet}
		</Collapsible.Trigger>
	</div>
	<Collapsible.Content forceMount>
		{#snippet child({ props, open })}
			{#if open}
				<div {...props} transition:slide={{ duration: 150 }}>
					<div class="my-8 flex flex-col justify-center gap-8 align-middle md:flex-row">
						<div class="flex max-w-2xl flex-1 flex-col gap-2">
							<Skillbar
								name="Combat"
								rank={ranks?.combat?.rank}
								progress={getLevelProgress('combat', skills?.combat ?? 0)}
							/>
							<Skillbar
								name="Mining"
								rank={ranks?.mining?.rank}
								progress={getLevelProgress('mining', skills?.mining ?? 0)}
							/>
							<Skillbar
								name="Taming"
								rank={ranks?.taming?.rank}
								progress={getLevelProgress(
									'taming',
									skills?.taming ?? 0,
									50 + (levelCaps?.taming ?? 0)
								)}
							/>
							<Skillbar
								name="Alchemy"
								rank={ranks?.alchemy?.rank}
								progress={getLevelProgress('alchemy', skills?.alchemy ?? 0)}
							/>
							<Skillbar
								name="Runecrafting"
								rank={ranks?.runecrafting?.rank}
								progress={getLevelProgress('runecrafting', skills?.runecrafting ?? 0)}
							/>
						</div>
						<div class="flex max-w-2xl flex-1 flex-col gap-2">
							<Skillbar
								name="Fishing"
								rank={ranks?.fishing?.rank}
								progress={getLevelProgress('fishing', skills?.fishing ?? 0)}
							/>
							<Skillbar
								name="Foraging"
								rank={ranks?.foraging?.rank}
								progress={getLevelProgress('foraging', skills?.foraging ?? 0)}
							/>
							<Skillbar
								name="Enchanting"
								rank={ranks?.enchanting?.rank}
								progress={getLevelProgress('enchanting', skills?.enchanting ?? 0)}
							/>
							<Skillbar
								name="Carpentry"
								rank={ranks?.carpentry?.rank}
								progress={getLevelProgress('carpentry', skills?.carpentry ?? 0)}
							/>
							<Skillbar
								name="Social"
								rank={ranks?.social?.rank}
								progress={getLevelProgress('social', skills?.social ?? 0)}
							/>
						</div>
					</div>
				</div>
			{/if}
		{/snippet}
	</Collapsible.Content>
</Collapsible.Root>
