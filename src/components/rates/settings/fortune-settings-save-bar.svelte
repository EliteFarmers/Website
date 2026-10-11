<script lang="ts">
	import { getGlobalContext } from '$lib/hooks/global.svelte';
	import { saveFortuneSettings } from '$lib/remote/fortune-settings.remote';
	import { getRatesData } from '$lib/stores/ratesData';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import { toast } from 'svelte-sonner';

	const ratesData = getRatesData();
	const gbl = getGlobalContext();
	const ctx = getStatsContext();

	const owned = $derived(gbl.authorized && gbl.ownsAccount(ctx.uuid));
	let saving = $state(false);

	async function save() {
		const profileUuid = ctx.selectedProfile?.profileId;
		if (!profileUuid) return;

		saving = true;
		try {
			const result = await saveFortuneSettings({
				playerUuid: ctx.uuid,
				profileUuid,
				settings: {
					communityCenter: Math.round($ratesData.communityCenter ?? 0),
					strength: Math.round($ratesData.strength ?? 0),
					speed: Math.round($ratesData.speed ?? 0),
					rosewaterFlasks: Math.round($ratesData.rosewaterFlasks ?? 0),
					feastBurgers: Math.round($ratesData.feastBurgers ?? 0),
					chipRarities: $ratesData.chipRarities ?? {},
				},
			});

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success('Saved your settings to your profile!');
			}
		} catch {
			toast.error('Failed to save your settings.');
		} finally {
			saving = false;
		}
	}
</script>

{#if owned || ctx.fortuneSettings}
	<div class="h-16"></div>
	<div
		class="fixed right-0 bottom-0 left-0 z-50 flex w-full flex-col items-center justify-center gap-2 border-t bg-background p-4 text-foreground"
	>
		{#if ctx.fortuneSettings && !owned}
			<p class="px-1 text-sm text-muted-foreground">
				Loaded saved settings from {ctx.ignMeta}!
			</p>
		{/if}
		{#if owned}
			<div class="flex flex-row items-center justify-between gap-4">
				<p class="max-w-sm text-sm text-muted-foreground">
					Garden fortune, strength, speed, flasks, feast burgers, and chip rarities can be saved to your
					profile!
				</p>
				<Button onclick={save} disabled={saving}>Save</Button>
			</div>
		{/if}
	</div>
{/if}
