<script lang="ts">
	import { page } from '$app/state';
	import Weight from '$comp/stats/player/weight.svelte';
	import Discord from '$comp/stats/player/discord.svelte';
	import PlayerName from '$comp/stats/player/playername.svelte';
	import Skyblocklevel from './player/skyblocklevel.svelte';
	import * as Popover from '$ui/popover';
	import Badge from './badge.svelte';
	import { OTHER_SITES } from '$content/othersites';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { getStatsContext } from '$lib/stores/stats.svelte';

	const ctx = getStatsContext();

	const badgeList = $derived(
		ctx.account.badges?.filter((b) => b.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? []
	);
</script>

<section class="mt-8 flex w-full flex-col items-center align-middle">
	<div class="mx-2 flex w-full max-w-7xl flex-col gap-8 rounded-lg bg-background p-4 md:flex-row md:gap-16 md:p-8">
		<div class="flex flex-1 flex-row items-center justify-center gap-6 md:justify-end">
			<img
				class="aspect-auto max-h-40 min-w-12 max-w-16 object-cover"
				src="https://mc-heads.net/body/{ctx.uuid}"
				alt="User's Minecraft appearance"
			/>
			<div class="flex flex-col items-start justify-start gap-1">
				<PlayerName />
				<div class="flex flex-wrap justify-start gap-1 md:flex-row">
					<Skyblocklevel />
					<Discord />
				</div>
				<div class="flex justify-start gap-1">
					<Popover.Mobile>
						{#snippet trigger()}
							<div class="rounded-md bg-card">
								<p class="p-2 px-2">External Sites</p>
							</div>
						{/snippet}
						<div class="flex flex-col gap-2" data-sveltekit-preload-data="tap">
							{#each OTHER_SITES as site (site.name)}
								<a
									href={site.url(
										ctx.uuid ?? page.params.id,
										ctx.selectedProfile?.profileName ?? page.params.profile
									)}
									class="flex flex-row items-center justify-between gap-2 rounded-md p-2 px-3 hover:bg-card"
									target="_blank"
									rel="noopener noreferrer nofollow"
								>
									<p>
										{site.name}
									</p>
									<ExternalLink size={16} />
								</a>
							{/each}
						</div>
					</Popover.Mobile>
				</div>
			</div>
		</div>
		<div class="flex flex-1 flex-row items-center justify-center gap-6 md:justify-start">
			<Weight />
		</div>
	</div>
	<div class="mx-4 flex w-full flex-wrap justify-center gap-2 align-middle">
		{#each badgeList as badge (badge.id)}
			<Badge {badge} />
		{/each}
	</div>
</section>
