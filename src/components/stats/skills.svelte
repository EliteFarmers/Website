<script lang="ts">
	import { getLevelProgress } from '$lib/format';
	import Skillbar from './skillbar.svelte';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Collapsible from '$ui/collapsible';
	import { Button } from '$ui/button';
	import type { components } from '$lib/api/api';
	import { getGardenLevel } from 'farming-weight';

	export let open = false;
	export let skills: components['schemas']['ProfileMemberDto']['skills'];
	export let skillRanks: components['schemas']['LeaderboardPositionsDto']['skills'];
	export let levelCaps: Record<string, number | undefined> | undefined = undefined;
	export let gardenXp = 0;
</script>

<Collapsible.Root bind:open class="w-full mx-4">
	<div class="flex flex-row items-center justify-center">
		<Collapsible.Trigger asChild let:builder>
			<div class="flex flex-row gap-4 items-end justify-center w-full">
				<div class="flex flex-col md:flex-row gap-4 items-end justify-center w-full flex-1">
					<Skillbar
						name="Farming"
						rank={skillRanks?.farming}
						progress={getLevelProgress('farming', skills?.farming ?? 0, 50 + (levelCaps?.farming ?? 0))}
					/>
					<Button builders={[builder]} variant="outline" class="w-10 p-0 -mb-1 hidden md:flex">
						<ChevronsUpDown class="h-4 w-4" />
						<span class="sr-only">Skill Toggle</span>
					</Button>
					<Skillbar name="Garden" progress={getGardenLevel(gardenXp)} />
				</div>
				<div class="md:hidden">
					<Button builders={[builder]} variant="outline" class="w-10 p-0 -mb-1">
						<ChevronsUpDown class="h-4 w-4" />
						<span class="sr-only">Toggle</span>
					</Button>
				</div>
			</div>
		</Collapsible.Trigger>
	</div>
	<Collapsible.Content>
		<div class="flex flex-col gap-8 md:flex-row justify-center align-middle my-8">
			<div class="flex flex-col gap-2 flex-1 max-w-2xl">
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
			<div class="flex flex-col gap-2 flex-1 max-w-2xl">
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
