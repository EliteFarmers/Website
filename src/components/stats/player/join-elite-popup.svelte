<script lang="ts">
	import { page } from '$app/state';
	import EliteToast from '$comp/stats/player/elite-toast.svelte';
	import { PUBLIC_ELITE_BADGE_ID, PUBLIC_WEIGHT_REQ } from '$env/static/public';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { PersistedState } from 'runed';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	const ctx = getStatsContext();
	const closed = new PersistedState<{ state: 'ready' | 'open' | 'closed'; opened?: number }>('join-elite-toast', {
		state: 'ready',
	});

	onMount(async () => {
		await tick();

		if (closed.current.state === 'closed') return;

		if (closed.current.state === 'open' && closed.current.opened) {
			const elapsed = Date.now() - closed.current.opened;
			if (elapsed < 1000 * 60 * 60 * 24) return; // 24 hours
		}

		const eligible = (ctx.member.farmingWeight?.totalWeight ?? 0) >= Number(PUBLIC_WEIGHT_REQ);
		const isOwnAccount = (page.data.session?.ign ?? undefined) === ctx.ign;
		const hasElite =
			ctx.account.badges?.some((badge) => badge.id !== undefined && badge.id === +PUBLIC_ELITE_BADGE_ID) ?? false;

		if (isOwnAccount && eligible && !hasElite) {
			toast.custom(EliteToast, {
				duration: Number.POSITIVE_INFINITY,
			});

			closed.current = {
				state: 'open',
				opened: Date.now(),
			};
		}
	});
</script>
