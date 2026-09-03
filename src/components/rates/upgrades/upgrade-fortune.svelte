<script lang="ts">
	import { getStatColor } from '$lib/format';
	import { cn } from '$lib/utils';
	import * as Popover from '$ui/popover';
	import PawPrint from '@lucide/svelte/icons/paw-print';
	import {
		FARMING_MECHANIC_INFO,
		STAT_ICONS,
		STAT_NAMES,
		Stat,
		type EffectSummary,
		type FortuneUpgrade,
	} from 'farming-weight';

	interface Props {
		upgrade: FortuneUpgrade;
		class?: string;
	}

	let { upgrade, class: className }: Props = $props();

	const CROP_FORTUNE_STATS = new Set([
		Stat.CactusFortune,
		Stat.CarrotFortune,
		Stat.CocoaBeanFortune,
		Stat.MelonFortune,
		Stat.MushroomFortune,
		Stat.NetherWartFortune,
		Stat.PotatoFortune,
		Stat.PumpkinFortune,
		Stat.SugarCaneFortune,
		Stat.WheatFortune,
		Stat.SunflowerFortune,
		Stat.MoonflowerFortune,
		Stat.WildRoseFortune,
	]);

	const primaryStat = $derived.by(() => {
		if (!upgrade.stats) return { stat: Stat.FarmingFortune, value: upgrade.increase ?? 0 };
		const ff = upgrade.stats[Stat.FarmingFortune];
		// Prefer FarmingFortune only when it's a positive contributor; otherwise
		// pick the stat that best represents what the upgrade actually gives.
		if (ff !== undefined && ff > 0) return { stat: Stat.FarmingFortune, value: ff };

		for (const [statKey, value] of Object.entries(upgrade.stats)) {
			const stat = statKey as Stat;
			if (CROP_FORTUNE_STATS.has(stat) && (value as number) > 0) {
				return { stat, value: value as number };
			}
		}

		let bestPositive: { stat: Stat; value: number } | undefined;
		for (const [statKey, value] of Object.entries(upgrade.stats)) {
			const numeric = value as number;
			if (!numeric || numeric <= 0) continue;
			if (!bestPositive || numeric > bestPositive.value) {
				bestPositive = { stat: statKey as Stat, value: numeric };
			}
		}
		if (bestPositive) return bestPositive;

		let best: { stat: Stat; value: number } | undefined;
		for (const [statKey, value] of Object.entries(upgrade.stats)) {
			if (!value) continue;
			if (!best || Math.abs(value as number) > Math.abs(best.value)) {
				best = { stat: statKey as Stat, value: value as number };
			}
		}
		if (best) return best;
		return { stat: Stat.FarmingFortune, value: upgrade.increase ?? 0 };
	});

	const primaryEffect = $derived.by<EffectSummary | undefined>(() => upgrade.effects?.[0]);
	const primaryEffectIcon = $derived.by(() => {
		const stat = primaryEffect?.relatedStats?.[0];
		if (stat) return STAT_ICONS[stat] ?? '?';
		return primaryEffect?.mechanic ? FARMING_MECHANIC_INFO[primaryEffect.mechanic].icon : '?';
	});
	const primaryEffectName = $derived.by(() => {
		const stat = primaryEffect?.relatedStats?.[0];
		if (stat) return STAT_NAMES[stat] ?? stat;
		return primaryEffect?.mechanic ? FARMING_MECHANIC_INFO[primaryEffect.mechanic].name : 'Effect';
	});
	const primaryEffectValue = $derived.by(() => {
		if (!primaryEffect || primaryEffect.value === undefined) return '';
		if (primaryEffect.op === 'mul-rare' || primaryEffect.op === 'mul-drop') {
			const percent = (primaryEffect.value - 1) * 100;
			return `${percent > 0 ? '+' : ''}${(+percent.toFixed(2)).toLocaleString()}%`;
		}
		if (primaryEffect.op === 'add-rare-pct') {
			if (primaryEffect.relatedStats?.includes(Stat.Overbloom)) {
				return (+primaryEffect.value.toFixed(2)).toLocaleString();
			}
			return `+${(+primaryEffect.value.toFixed(2)).toLocaleString()}%`;
		}
		if (primaryEffect.valueDisplay === 'percent') {
			return `${primaryEffect.value > 0 ? '+' : ''}${(+primaryEffect.value.toFixed(2)).toLocaleString()}%`;
		}
		if (primaryEffect.valueDisplay === 'stat') {
			return `${primaryEffect.value > 0 ? '+' : ''}${(+primaryEffect.value.toFixed(2)).toLocaleString()}`;
		}
		return (+primaryEffect.value.toFixed(2)).toLocaleString();
	});

	const otherStats = $derived.by(() => {
		if (!upgrade.stats) return [];
		return Object.entries(upgrade.stats)
			.filter(([statKey, value]) => {
				const stat = statKey as Stat;
				if (stat === primaryStat.stat) return false;
				if (value === 0) return false;
				return true;
			})
			.map(([statKey, value]) => ({ stat: statKey as Stat, value: value as number }))
			.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
	});

	const headerValue = $derived(
		primaryStat.stat !== Stat.FarmingFortune && primaryStat.value !== 0
			? primaryStat.value
			: (upgrade.increase ?? primaryStat.value)
	);

	const hasEffects = $derived((upgrade.effects?.length ?? 0) > 0);
	const isAtomicUpgrade = $derived(upgrade.group?.atomic === true);
	const isPetPurchase = $derived(upgrade.group?.kind === 'pet-purchase');
	const isLoadoutUpgrade = $derived(upgrade.group?.kind === 'loadout');
	const isNegative = $derived(headerValue < 0);
	const maxOnly = $derived(!hasEffects && headerValue === 0 && upgrade.max && upgrade.max > 0);
	const forCompletion = $derived(!isAtomicUpgrade && upgrade.stats === undefined && !hasEffects && headerValue === 0);
	const statBackground = $derived(
		getStatColor(primaryEffect?.relatedStats?.[0] ?? primaryStat.stat, 1) ?? 'bg-progress'
	);

	const background = $derived.by(() => {
		if (maxOnly || forCompletion) return 'bg-progress/40';
		if (isNegative) return 'bg-destructive/60';
		if (isPetPurchase || isLoadoutUpgrade) return 'bg-progress';
		return statBackground;
	});
</script>

<Popover.Mobile>
	{#snippet trigger()}
		<div
			class={cn(
				'relative flex h-full min-h-4 flex-row items-center gap-1.5 rounded-md px-1',
				background,
				className
			)}
		>
			{#if isPetPurchase}
				<PawPrint class="size-4 shrink-0" aria-hidden="true" />
			{:else}
				<span
					>{isLoadoutUpgrade
						? 'Set'
						: hasEffects
							? primaryEffectIcon
							: (STAT_ICONS[primaryStat.stat] ?? '?')}</span
				>
			{/if}
			<span class="text-md relative z-10 pr-1 font-mono leading-none md:text-lg">
				{#if isPetPurchase}
					Pet
				{:else if isLoadoutUpgrade}
					Set
				{:else if hasEffects && primaryEffectValue}
					{primaryEffectValue}
				{:else}
					{headerValue !== 0 ? (+headerValue.toFixed(2)).toLocaleString() : '0'}
				{/if}
			</span>
		</div>
	{/snippet}
	<div class="flex max-w-xs flex-col gap-2">
		<p class="font-semibold">
			{isPetPurchase ? 'Pet Purchase' : isLoadoutUpgrade ? 'Loadout Upgrade' : 'Upgrade Stats'}
		</p>
		{#if isPetPurchase}
			<p class="text-sm text-muted-foreground">
				This gain includes purchasing and, when required, configuring a max-level pet.
			</p>
		{:else if isLoadoutUpgrade}
			<p class="text-sm text-muted-foreground">
				This gain comes from using a separate physical armor set in the recommended phases.
			</p>
		{/if}

		<div class="flex flex-col gap-1">
			{#if primaryEffect}
				<div
					class="flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none even:bg-card"
				>
					<p class="flex items-center gap-1">
						<span>{primaryEffectIcon}</span>
						{primaryEffectName}
					</p>
					<p>{primaryEffectValue}</p>
				</div>
			{/if}
			{#if primaryStat.value !== 0}
				<div
					class="flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none even:bg-card"
				>
					<p class="flex items-center gap-1">
						<span>{STAT_ICONS[primaryStat.stat] ?? '?'}</span>
						{STAT_NAMES[primaryStat.stat] ?? primaryStat.stat}
					</p>
					<p class={primaryStat.value < 0 ? 'text-destructive' : ''}>
						{primaryStat.value > 0 ? '+' : ''}{(+primaryStat.value.toFixed(2)).toLocaleString()}
					</p>
				</div>
			{/if}
			{#each otherStats as { stat, value } (stat)}
				<div
					class="flex flex-row justify-between gap-8 rounded-sm p-0.5 pb-1 text-base leading-none even:bg-card"
				>
					<p class="flex items-center gap-1">
						<span>{STAT_ICONS[stat] ?? ''}</span>
						{STAT_NAMES[stat] ?? stat}
					</p>
					<p class={value < 0 ? 'text-destructive' : ''}>
						{value > 0 ? '+' : ''}{(+value.toFixed(2)).toLocaleString()}
					</p>
				</div>
			{/each}
		</div>

		{#if primaryEffect?.description}
			<p class="max-w-sm text-sm text-muted-foreground">{primaryEffect.description}</p>
		{/if}

		{#if isNegative}
			<p class="max-w-sm text-sm text-muted-foreground">
				This upgrade is suggested despite lower stats because it increases profit per hour.
			</p>
		{:else if forCompletion}
			<p class="max-w-sm text-sm text-muted-foreground">This upgrade is shown for completion.</p>
		{/if}
	</div>
</Popover.Mobile>
