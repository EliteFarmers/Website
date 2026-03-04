<script lang="ts">
	import {
		FARMING_LEVEL_50_BONUS,
		FARMING_LEVEL_60_BONUS,
		MAX_MEDAL_BONUS,
		MINION_REWARD_AT_TIER,
		MINION_REWARD_WEIGHT,
	} from '$lib/constants/weights';
</script>

<div class="scrollbar-none flex w-full overflow-x-auto">
	<table class="w-full max-w-4xl min-w-48 grow">
		<thead>
			<tr class="bg-muted-variant">
				<th class="text-left">Source</th>
				<th class="text-left">Notes</th>
				<th class="text-left">Reward</th>
			</tr>
		</thead>
		<tbody>
			<tr class="bg-muted">
				<td>Farming 50</td>
				<td>One time reward obtained upon reaching farming level 50.</td>
				<td>{FARMING_LEVEL_50_BONUS}</td>
			</tr>
			<tr class="bg-muted">
				<td>Farming 60</td>
				<td>Additional weight rewarded after reaching both the XP required and unlocking the level cap.</td>
				<td class="whitespace-nowrap">{FARMING_LEVEL_60_BONUS - FARMING_LEVEL_50_BONUS} (250 total)</td>
			</tr>
			<tr class="bg-muted">
				<td>Anita Bonus</td>
				<td>For each level of Anita Bonus unlocked, you'll get 2 more weight.</td>
				<td>2 (Max 30)</td>
			</tr>
			<tr class="bg-muted">
				<td>Contest Medals</td>
				<td
					>Your best Gold/Platinum/Diamond medals are counted at rates of 0.25/0.5/0.75 weight respectively,
					up to {MAX_MEDAL_BONUS}
					medals.</td
				>
				<td>(Max 750)</td>
			</tr>
			<tr class="bg-muted">
				<td>Farming Minions</td>
				<td
					>For each unlocked tier {MINION_REWARD_AT_TIER} farming minion, you'll earn {MINION_REWARD_WEIGHT} bonus
					weight.</td
				>
				<td>{MINION_REWARD_WEIGHT} (Max 50)</td>
			</tr>
		</tbody>
	</table>
</div>

<style lang="postcss">
	@reference '$css';

	td,
	th {
		@apply p-1 px-2;
	}

	tbody > tr:nth-child(odd) {
		@apply bg-muted/50;
	}
</style>
