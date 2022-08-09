<script lang="ts">
	import type { ProfileMember } from "$lib/skyblock";
	import { getLevelProgress, getSkillLevel } from '$lib/format';
	import Skillbar from "./skillbar.svelte";
	import { DEFAULT_SKILL_CAPS } from "$lib/constants/levels";

	export let member: ProfileMember;

	const skills = member.skills;
</script>

<section class="flex justify-center align-middle">
	<div class="w-[40%]">
		<Skillbar name="Combat" progress={getLevelProgress('combat', skills?.combat ?? 0)}/>
		<Skillbar name="Mining" progress={getLevelProgress('mining', skills?.mining ?? 0)}/>
		<Skillbar name="Taming" progress={getLevelProgress('taming', skills?.taming ?? 0)}/>
		<Skillbar name="Alchemy" progress={getLevelProgress('alchemy', skills?.alchemy ?? 0)}/>
		<Skillbar name="Carpentry" progress={getLevelProgress('carpentry', skills?.carpentry ?? 0)}/>
	</div>
	<div class="w-[40%]">
		<Skillbar name="Farming" progress={getLevelProgress('farming', skills?.farming ?? 0, (member.jacob?.perks?.farming_level_cap ?? 0) + DEFAULT_SKILL_CAPS.farming)}/>
		<Skillbar name="Fishing" progress={getLevelProgress('fishing', skills?.fishing ?? 0)}/>
		<Skillbar name="Foraging" progress={getLevelProgress('foraging', skills?.foraging ?? 0)}/>
		<Skillbar name="Enchanting" progress={getLevelProgress('enchanting', skills?.enchanting ?? 0)}/>
		<Skillbar name="Runecrafting" progress={getLevelProgress('runecrafting', skills?.runecrafting ?? 0)}/>
	</div>
</section>