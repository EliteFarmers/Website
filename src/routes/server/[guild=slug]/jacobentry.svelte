<script lang="ts">
	import type { components } from '$lib/api/api';
	import { getReadableSkyblockDate } from '$lib/format';
	import * as Accordion from '$ui/accordion';
	import { Button } from '$ui/button';
	import { ExternalLink } from 'lucide-svelte/icons';

	export let record: components['schemas']['GuildJacobLeaderboardEntry'];

	$: contest = record.record;
</script>

<Accordion.Root>
	<Accordion.Item value="contest">
		<Accordion.Trigger class="py-0">
			<div class="flex flex-col md:flex-row gap-2 justify-between p-2 items-center w-full">
				<div class="flex flex-row gap-2 items-center">
					<img
						class="w-8 pixelated"
						src="https://mc-heads.net/avatar/{record.uuid}/8"
						alt="{record.ign} Player Head"
					/>
					<p class="font-semibold">{record.ign}</p>
				</div>
				<p><strong>{contest?.collected?.toLocaleString()}</strong></p>
			</div>
		</Accordion.Trigger>
		<Accordion.Content>
			<div class="flex flex-col gap-4 justify-between items-center py-1">
				<div class="flex flex-col gap-1 items-center">
					<span class="font-semibold">{getReadableSkyblockDate(contest?.timestamp ?? 0)}</span>
					<span class="font-semibold">
						{new Date((contest?.timestamp ?? 0) * 1000).toLocaleString(undefined, {
							timeStyle: 'short',
							dateStyle: 'medium',
						})}
					</span>
				</div>
				<div class="flex flex-wrap align-middle gap-2">
					<Button size="sm" href="/@{record.uuid}" color="alternative">
						<div class="flex flex-row items-center gap-2">
							<span>Stats</span>
							<ExternalLink size={16} />
						</div>
					</Button>
					<Button size="sm" href="/contest/{contest?.timestamp}" color="alternative">
						<div class="flex flex-row items-center gap-2">
							<span>Contest</span>
							<ExternalLink size={16} />
						</div>
					</Button>
				</div>
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
