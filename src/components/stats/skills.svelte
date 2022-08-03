<script lang="ts">
	import type { ProfileMember } from "$lib/skyblock";
	import { getLevelProgress, getSkillLevel } from '$lib/format';
	import Skillbar from "./skillbar.svelte";
	import { DEFAULT_SKILL_CAPS } from "$lib/constants/levels";

	export let member: ProfileMember;

	const { 
		experience_skill_alchemy: alchemy, 
		experience_skill_carpentry: carpentry,
		experience_skill_combat: combat,
		experience_skill_enchanting: enchanting,
		experience_skill_farming: farming,
		experience_skill_fishing: fishing,
		experience_skill_foraging: foraging,
		experience_skill_mining: mining,
		experience_skill_runecrafting: runecrafting,
		experience_skill_taming: taming
	} = member;

</script>

<section class="flex justify-center align-middle">
	<div class="w-[40%]">
		<Skillbar name="Combat" progress={getLevelProgress('combat', combat)}/>
		<Skillbar name="Mining" progress={getLevelProgress('mining', mining)}/>
		<Skillbar name="Taming" progress={getLevelProgress('taming', taming)}/>
		<Skillbar name="Alchemy" progress={getLevelProgress('alchemy', alchemy)}/>
		<Skillbar name="Carpentry" progress={getLevelProgress('carpentry', carpentry)}/>
	</div>
	<div class="w-[40%]">
		<Skillbar name="Farming" progress={getLevelProgress('farming', farming, member.jacob2.perks.farming_level_cap + DEFAULT_SKILL_CAPS.farming)}/>
		<Skillbar name="Fishing" progress={getLevelProgress('fishing', fishing)}/>
		<Skillbar name="Foraging" progress={getLevelProgress('foraging', foraging)}/>
		<Skillbar name="Enchanting" progress={getLevelProgress('enchanting', enchanting)}/>
		<Skillbar name="Runecrafting" progress={getLevelProgress('runecrafting', runecrafting)}/>
	</div>
</section>