<script lang="ts">
	import type { GuildJacobLeaderboardEntry } from '$lib/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';

	interface Props {
		record: GuildJacobLeaderboardEntry;
	}

	let { record }: Props = $props();

	let contest = $derived(record.record);
</script>

<Accordion.Root type="single">
	<Accordion.Item value="contest">
		<Accordion.Trigger class="py-0">
			<div class="flex w-full flex-col items-center justify-between gap-2 p-2 md:flex-row">
				<div class="flex flex-row items-center gap-2">
					<img
						class="pixelated w-8"
						src="https://api.elitebot.dev/account/{record.uuid}/face.png"
						loading="lazy"
						alt="{record.ign} Player Head"
					/>
					<p class="font-semibold">{record.ign}</p>
				</div>
				<p><strong>{contest?.collected?.toLocaleString()}</strong></p>
			</div>
		</Accordion.Trigger>
		<Accordion.Content>
			<div class="flex flex-col items-center justify-between gap-4 py-1">
				<div class="flex flex-col items-center gap-1">
					<span class="font-semibold">{getReadableSkyblockDate(contest?.timestamp ?? 0)}</span>
					<span class="font-semibold">
						{new Date(Number(contest?.timestamp ?? 0) * 1000).toLocaleString(undefined, {
							timeStyle: 'short',
							dateStyle: 'medium',
						})}
					</span>
				</div>
				<div class="flex flex-wrap gap-2 align-middle">
					<Button size="sm" href="/@{record.uuid}" variant="secondary">
						<span>View Stats</span>
					</Button>
					<Button size="sm" href="/contest/{contest?.timestamp}" variant="secondary">
						<span>View Contest</span>
					</Button>
				</div>
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
