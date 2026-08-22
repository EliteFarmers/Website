<script lang="ts">
	import ItemName from '$comp/items/item-name.svelte';
	import { buttonVariants } from '$ui/button';
	import * as Dialog from '$ui/dialog';
	import Info from '@lucide/svelte/icons/info';
	import type { PestRateMetricDetails } from './pest-rate-breakdown-model';

	interface Props {
		value: string;
		details: PestRateMetricDetails;
	}

	let { value, details }: Props = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger
		type="button"
		class={buttonVariants({
			variant: 'ghost',
			size: 'sm',
			class: 'h-8 shrink-0 px-2',
		})}
	>
		<Info class="size-4" />
		Details
	</Dialog.Trigger>
	<Dialog.ScrollContent parentClass="w-[calc(100vw-1rem)] max-w-2xl sm:w-full" class="p-0">
		<div class="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
			<div class="min-w-0">
				<Dialog.Title class="text-lg leading-tight font-semibold">{details.title}</Dialog.Title>
			</div>
			<p class="font-mono text-lg leading-tight font-semibold whitespace-nowrap tabular-nums sm:text-right">
				{value}
			</p>
		</div>

		<div class="flex flex-col gap-4 p-4 sm:p-6">
			{#each details.groups as group (group.label)}
				<section class="overflow-hidden rounded-md border">
					<header class="border-b bg-muted/30 px-3 py-2">
						<h3 class="text-sm font-semibold">{group.label}</h3>
					</header>
					<div class="divide-y">
						{#each group.lines as line (line.label)}
							<div class="flex items-start justify-between gap-4 px-3 py-2.5 text-sm">
								<div class="min-w-0">
									<p class={line.emphasis ? 'font-semibold text-foreground' : 'text-foreground'}>
										{#if line.itemName}
											<ItemName name={line.label} />
										{:else}
											{line.label}
										{/if}
									</p>
									{#if line.detail}
										<p class="mt-0.5 text-xs leading-tight text-muted-foreground">{line.detail}</p>
									{/if}
								</div>
								<p
									class="font-mono whitespace-nowrap tabular-nums {line.emphasis
										? 'font-semibold text-foreground'
										: 'text-muted-foreground'}"
								>
									{line.value}
								</p>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</Dialog.ScrollContent>
</Dialog.Root>
