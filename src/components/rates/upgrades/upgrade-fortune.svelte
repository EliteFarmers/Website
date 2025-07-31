<script lang="ts">
	import FortuneBreakdown from '$comp/items/tools/fortune-breakdown.svelte';
	import { type FortuneUpgrade } from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
	}

	let { upgrade }: Props = $props();
</script>

{#if upgrade.increase > 0}
	<FortuneBreakdown
		total={upgrade.increase}
		breakdown={upgrade.improvements?.reduce<Record<string, number>>((acc, curr) => {
			acc[curr.name] = curr.fortune;
			return acc;
		}, {})}
	/>
{:else if upgrade.increase < 0}
	<FortuneBreakdown
		total={upgrade.increase}
		breakdown={upgrade.improvements?.reduce<Record<string, number>>((acc, curr) => {
			acc[curr.name] = curr.fortune;
			return acc;
		}, {})}
	>
		{#snippet child()}
			<p class="max-w-sm text-sm">
				This upgrade is suggested despite lower fortune because it increases profit per hour.
			</p>
		{/snippet}
	</FortuneBreakdown>
{:else if upgrade.max && upgrade.max > 0}
	<FortuneBreakdown total={upgrade.max} enabled={false}>
		{#snippet child()}
			<p class="max-w-sm text-sm">
				This upgrade gives no fortune right away, but maxes out at {(upgrade.max ?? 0).toLocaleString()} fortune
				as you upgrade it later.
			</p>
		{/snippet}
	</FortuneBreakdown>
{/if}
