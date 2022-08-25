<script lang="ts">
	import type { ProfileMember } from "$lib/skyblock";
	import { getLevelProgress, getSkillLevel } from '$lib/format';
	import Skillbar from "./skillbar.svelte";
	import { DEFAULT_SKILL_CAPS } from "$lib/constants/levels";

	export let member: ProfileMember | undefined;

	const skills = member?.skills;
</script>

<section id="Skills" class="md:flex justify-center align-middle">
	<div class="md:w-[40%]">
		<Skillbar name="Combat" progress={getLevelProgress('combat', skills?.combat ?? 0)}/>
		<Skillbar name="Mining" progress={getLevelProgress('mining', skills?.mining ?? 0)}/>
		<Skillbar name="Taming" progress={getLevelProgress('taming', skills?.taming ?? 0)}/>
		<Skillbar name="Alchemy" progress={getLevelProgress('alchemy', skills?.alchemy ?? 0)}/>
		<Skillbar name="Runecrafting" progress={getLevelProgress('runecrafting', skills?.runecrafting ?? 0)}/>
	</div>
	<div class="md:w-[40%]">
		<Skillbar name="Fishing" progress={getLevelProgress('fishing', skills?.fishing ?? 0)}/>
		<Skillbar name="Foraging" progress={getLevelProgress('foraging', skills?.foraging ?? 0)}/>
		<Skillbar name="Enchanting" progress={getLevelProgress('enchanting', skills?.enchanting ?? 0)}/>
		<Skillbar name="Carpentry" progress={getLevelProgress('carpentry', skills?.carpentry ?? 0)}/>
		<Skillbar name="Social" progress={getLevelProgress('social', skills?.social ?? 0)}/>
	</div>
</section>