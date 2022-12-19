<script lang="ts">
	import type { ProfileMember } from '$lib/skyblock';
	import { getLevelProgress } from '$lib/format';
	import Skillbar from './skillbar.svelte';

	export let member: ProfileMember | undefined;
	export let skillRanks: Record<string, number> | undefined;

	const skills = member?.skills;
</script>

<section id="Skills" class="md:flex justify-center align-middle">
	<div class="md:w-[40%]">
		<Skillbar name="Combat" rank={skillRanks?.combat} progress={getLevelProgress('combat', skills?.combat ?? 0)} />
		<Skillbar name="Mining" rank={skillRanks?.mining} progress={getLevelProgress('mining', skills?.mining ?? 0)} />
		<Skillbar name="Taming" rank={skillRanks?.taming} progress={getLevelProgress('taming', skills?.taming ?? 0)} />
		<Skillbar name="Alchemy" rank={skillRanks?.alchemy} progress={getLevelProgress('alchemy', skills?.alchemy ?? 0)} />
		<Skillbar name="Runecrafting" rank={skillRanks?.runecrafting} progress={getLevelProgress('runecrafting', skills?.runecrafting ?? 0)} />
	</div>
	<div class="md:w-[40%]">
		<Skillbar name="Fishing" rank={skillRanks?.fishing} progress={getLevelProgress('fishing', skills?.fishing ?? 0)} />
		<Skillbar name="Foraging" rank={skillRanks?.foraging} progress={getLevelProgress('foraging', skills?.foraging ?? 0)} />
		<Skillbar name="Enchanting" rank={skillRanks?.enchanting} progress={getLevelProgress('enchanting', skills?.enchanting ?? 0)} />
		<Skillbar name="Carpentry" rank={skillRanks?.carpentry} progress={getLevelProgress('carpentry', skills?.carpentry ?? 0)} />
		<Skillbar name="Social" rank={skillRanks?.social} progress={getLevelProgress('social', skills?.social ?? 0)} />
	</div>
</section>
