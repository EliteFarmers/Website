<script lang="ts">
	import ProgressBar from '$comp/stats/progress-bar.svelte';
	import { getStatColor } from '$lib/format';
	import TooltipSimple from '$ui/tooltip/tooltip-simple.svelte';
	import Info from '@lucide/svelte/icons/info';
	import { STAT_ICONS, type EffectSummary } from 'farming-weight';

	interface Props {
		effects?: readonly EffectSummary[];
		compact?: boolean;
	}

	let { effects = [], compact = false }: Props = $props();

	function formatValue(effect: EffectSummary): string {
		if (effect.value === undefined) return '';
		if (effect.op === 'mul-rare' || effect.op === 'mul-drop') {
			const percent = (effect.value - 1) * 100;
			return `${percent > 0 ? '+' : ''}${(+percent.toFixed(2)).toLocaleString()}%`;
		}
		if (effect.valueDisplay === 'stat') {
			return `${effect.value > 0 ? '+' : ''}${(+effect.value.toFixed(2)).toLocaleString()}`;
		}
		if (effect.op === 'add-rare-pct') {
			return `+${(+effect.value.toFixed(2)).toLocaleString()}%`;
		}
		return (+effect.value.toFixed(2)).toLocaleString();
	}

	function formatReadable(effect: EffectSummary): string {
		const stat = effect.relatedStats?.[0];
		const icon = stat ? (STAT_ICONS[stat] ?? '') : '';
		return `${formatValue(effect)} ${icon}`.trim();
	}

	function formatExpanded(effect: EffectSummary): string {
		const value = formatValue(effect);
		return value
			? `${value} ${effect.relatedStats?.map((stat) => (STAT_ICONS[stat] ?? '') + ' ' + stat).join(' ')}`.trim()
			: (effect.description ?? '');
	}

	function formatNote(effect: EffectSummary): string {
		return effect.description ?? '';
	}

	function effectFillClass(effect: EffectSummary): string | undefined {
		const stat = effect.relatedStats?.[0];
		return stat ? (getStatColor(stat, 1) ?? undefined) : undefined;
	}

	function effectPercent(effect: EffectSummary): number {
		return effect.value === undefined ? 0 : 100;
	}

	function effectKey(effect: EffectSummary, index: number): string {
		return `${effect.source}|${effect.op}|${effect.value ?? ''}|${index}`;
	}
</script>

{#if effects.length > 0}
	<div class={compact ? 'flex flex-col gap-1' : 'flex w-full flex-col gap-1'}>
		{#each effects as effect, index (effectKey(effect, index))}
			<div class="flex w-full items-center gap-1">
				<ProgressBar
					percent={effectPercent(effect)}
					readable={formatReadable(effect)}
					expanded={formatExpanded(effect)}
					fillClass={effectFillClass(effect)}
					{compact}
				/>
				{#if formatNote(effect)}
					<TooltipSimple side="left">
						{#snippet trigger()}
							<span
								class="text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded-sm"
							>
								<Info size={14} />
								<span class="sr-only">Effect note</span>
							</span>
						{/snippet}
						<p class="max-w-64 text-sm">{formatNote(effect)}</p>
					</TooltipSimple>
				{/if}
			</div>
		{/each}
	</div>
{/if}
