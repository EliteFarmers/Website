<script lang="ts">
	import { page } from '$app/state';
	import EliteToast from '$comp/stats/player/elite-toast.svelte';
	import { env } from '$env/dynamic/public';
	import { ELITE_FARMER_GOLD_MEDAL_REQ, ELITE_FARMER_WEIGHT_REQ } from '$lib/constants/data';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { PersistedState, watch } from 'runed';
	import { toast } from 'svelte-sonner';
	const { PUBLIC_ELITE_BADGE_ID } = env;

	const ctx = getStatsContext();
	const closed = new PersistedState<{ state: 'ready' | 'open' | 'closed'; opened?: number }>('join-elite-toast', {
		state: 'ready',
	});

	watch(
		() => ctx.member.current,
		() => {
			if (closed.current.state === 'closed') return;

			if (closed.current.state === 'open' && closed.current.opened) {
				const elapsed = Date.now() - closed.current.opened;
				if (elapsed < 1000 * 60 * 60 * 24) return; // 24 hours
			}

			const earnedMedals = ctx.member.current?.jacob?.earnedMedals;
			const goldOrBetterMedals =
				(earnedMedals?.gold ?? 0) + (earnedMedals?.platinum ?? 0) + (earnedMedals?.diamond ?? 0);
			const eligible =
				(ctx.member.current?.farmingWeight?.totalWeight ?? 0) >= ELITE_FARMER_WEIGHT_REQ &&
				goldOrBetterMedals >= ELITE_FARMER_GOLD_MEDAL_REQ;
			const isOwnAccount = (page.data.session?.ign ?? undefined) === ctx.ign;
			const hasElite =
				ctx.account.badges?.some((badge) => badge.id !== undefined && badge.id === +PUBLIC_ELITE_BADGE_ID) ??
				false;

			if (isOwnAccount && eligible && !hasElite) {
				toast.custom(EliteToast, {
					duration: Number.POSITIVE_INFINITY,
				});

				closed.current = {
					state: 'open',
					opened: Date.now(),
				};
			}
		}
	);
</script>
