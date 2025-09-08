<script lang="ts">
	import type { ItemResponse } from '$lib/api';
	import { getSkillLevel } from '$lib/format';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import Check from '@lucide/svelte/icons/check';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import OctagonAlert from '@lucide/svelte/icons/octagon-alert';
	import X from '@lucide/svelte/icons/x';
	import { getGardenLevel } from 'farming-weight';

	interface Props {
		itemData: ItemResponse;
	}

	let { itemData }: Props = $props();

	const ctx = getStatsContext();

	const requirements = $derived(
		(itemData.requirements ?? []).map(
			(req) =>
				({
					...req,
					completed: isCompleted(req),
				}) as Exclude<ItemResponse['requirements'], null | undefined>[number] & {
					completed: boolean | undefined;
				}
		)
	);
	const allCompleted = $derived(requirements.every((req) => req.completed !== undefined && req.completed));

	function isCompleted(requirement: Exclude<ItemResponse['requirements'], null | undefined>[number]) {
		if (requirement.type === 'GARDEN_LEVEL') {
			if (!ctx.garden?.experience) return undefined; // Garden level not available
			const { level } = getGardenLevel(ctx.garden?.experience ?? 0);
			return level >= requirement.level;
		}
		if (!requirement.skill || !requirement.level) return undefined;

		if (ctx.member.current) {
			const skillName = requirement.skill.toLowerCase() as keyof typeof ctx.member.current.skills;
			if (!ctx.member.current.skills || !(skillName in ctx.member.current.skills)) return undefined; // Skill not found, requirement not met

			const skill =
				ctx.member.current.skills?.[requirement.skill.toLowerCase() as keyof typeof ctx.member.current.skills];
			if (skill === undefined) return undefined; // Skill not found, requirement not met

			const { level } = getSkillLevel(skillName, ctx.member.current.skills[skillName]);
			return level >= requirement.level;
		} else {
			return undefined; // Member data not available
		}
	}
</script>

{#if requirements.length > 0}
	<div class="flex flex-col gap-1">
		<p class="text-xs">
			{#if allCompleted}
				<CircleCheckBig size={18} class="text-progress -mt-1 mr-0.5 inline-block" />
			{:else}
				<OctagonAlert size={18} class="dark:text-completed -mt-1 mr-0.5 inline-block" />
			{/if}
			Requires
			{#each requirements as requirement, i (i)}
				<!-- Remove under scores and capitalize first letter of each word -->
				{@const requirementName = (requirement.skill ?? requirement.type)
					.toLocaleLowerCase()
					.replace(/_/g, ' ')
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')}
				<span class="bg-background mx-0.5 inline-flex items-center gap-1 rounded-sm border px-1">
					<span class="font-semibold">
						{requirementName}
						{#if requirement.skill}
							<span>Level</span>
						{/if}
					</span>
					{#if requirement.tier}
						<span>{requirement.tier}</span>
					{/if}
					{#if requirement.level}
						<span>{requirement.level}</span>
					{/if}
					{#if requirement.completed === false}
						<X size={16} class="text-destructive" />
					{:else if requirement.completed === true}
						<Check size={16} class="text-progress" />
					{/if}
				</span>
			{/each}
		</p>
	</div>
{/if}
