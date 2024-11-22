<script lang="ts">
	import { getLevelProgress } from '$lib/format';
	import Skillbar from './skillbar.svelte';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Collapsible from '$ui/collapsible';
	import { Button } from '$ui/button';
	import type { components } from '$lib/api/api';
	import { getGardenLevel } from 'farming-weight';
	import { slide } from 'svelte/transition';

	interface Props {
		open?: boolean;
		skills: components['schemas']['ProfileMemberDto']['skills'];
		ranks?: components['schemas']['LeaderboardPositionsDto'] | undefined;
		levelCaps?: Record<string, number | undefined> | undefined;
		gardenXp?: number;
	}

	let { open = $bindable(false), skills, ranks = undefined, levelCaps = undefined, gardenXp = 0 }: Props = $props();

	let skillRanks = $derived(ranks?.skills);
</script>

<Collapsible.Root bind:open class="mx-4 w-full">
	<div class="flex flex-row items-center justify-center">
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<div class="flex w-full flex-row items-end justify-center gap-4">
					<div class="flex w-full flex-1 flex-col items-end justify-center gap-4 md:flex-row">
						<Skillbar
							name="Farming"
							rank={skillRanks?.farming}
							progress={getLevelProgress('farming', skills?.farming ?? 0, 50 + (levelCaps?.farming ?? 0))}
						/>
						<Button variant="outline" class="-mb-1 hidden w-10 p-0 md:flex" {...props}>
							<ChevronsUpDown class="h-4 w-4" />
							<span class="sr-only">Skill Toggle</span>
						</Button>
						<Skillbar name="Garden" rank={ranks?.profile?.garden} progress={getGardenLevel(gardenXp)} />
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
	<Collapsible.Content transition={slide} transitionConfig={{ duration: 150 }}>
		<div class="my-8 flex flex-col justify-center gap-8 align-middle md:flex-row">
			<div class="flex max-w-2xl flex-1 flex-col gap-2">
				<Skillbar
					name="Combat"
					rank={skillRanks?.combat}
					progress={getLevelProgress('combat', skills?.combat ?? 0)}
				/>
				<Skillbar
					name="Mining"
					rank={skillRanks?.mining}
					progress={getLevelProgress('mining', skills?.mining ?? 0)}
				/>
				<Skillbar
					name="Taming"
					rank={skillRanks?.taming}
					progress={getLevelProgress('taming', skills?.taming ?? 0, 50 + (levelCaps?.taming ?? 0))}
				/>
				<Skillbar
					name="Alchemy"
					rank={skillRanks?.alchemy}
					progress={getLevelProgress('alchemy', skills?.alchemy ?? 0)}
				/>
				<Skillbar
					name="Runecrafting"
					rank={skillRanks?.runecrafting}
					progress={getLevelProgress('runecrafting', skills?.runecrafting ?? 0)}
				/>
			</div>
			<div class="flex max-w-2xl flex-1 flex-col gap-2">
				<Skillbar
					name="Fishing"
					rank={skillRanks?.fishing}
					progress={getLevelProgress('fishing', skills?.fishing ?? 0)}
				/>
				<Skillbar
					name="Foraging"
					rank={skillRanks?.foraging}
					progress={getLevelProgress('foraging', skills?.foraging ?? 0)}
				/>
				<Skillbar
					name="Enchanting"
					rank={skillRanks?.enchanting}
					progress={getLevelProgress('enchanting', skills?.enchanting ?? 0)}
				/>
				<Skillbar
					name="Carpentry"
					rank={skillRanks?.carpentry}
					progress={getLevelProgress('carpentry', skills?.carpentry ?? 0)}
				/>
				<Skillbar
					name="Social"
					rank={skillRanks?.social}
					progress={getLevelProgress('social', skills?.social ?? 0)}
				/>
			</div>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
