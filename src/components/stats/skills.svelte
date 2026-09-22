<script lang="ts">
	import { page } from '$app/state';
	import { getStatsContext } from '$lib/stores/stats.svelte';
	import { Button } from '$ui/button';
	import * as Collapsible from '$ui/collapsible';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { slide } from 'svelte/transition';
	import Skillbar from './skillbar.svelte';

	const ctx = getStatsContext();
	let open = $state(page.url.href.includes('#Skills'));

	const skillColumns = [
		['combat', 'mining', 'taming', 'alchemy', 'runecrafting', 'social'],
		['fishing', 'foraging', 'enchanting', 'carpentry', 'hunting'],
	] as const;
</script>

<section class="my-2 mb-16 flex items-center justify-center" id="Skills">
	<div class="flex w-full max-w-7xl flex-1">
		<Collapsible.Root bind:open class="mx-4 w-full">
			<div class="flex flex-row items-center justify-center">
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<div class="flex w-full flex-row items-end justify-center gap-4">
							<div class="flex w-full flex-1 flex-col items-end justify-center gap-4 md:flex-row">
								<Skillbar skill="farming" />
								<Button
									variant="outline"
									class="-mb-1 hidden w-10 bg-background! p-0 md:flex"
									{...props}
								>
									<ChevronsUpDown class="h-4 w-4" />
									<span class="sr-only">Skill Toggle</span>
								</Button>
								<Skillbar skill="garden" />
							</div>
							<div class="md:hidden">
								<Button variant="outline" class="-mb-1 w-10 bg-background! p-0" {...props}>
									<ChevronsUpDown class="h-4 w-4" />
									<span class="sr-only">Toggle</span>
								</Button>
							</div>
						</div>
					{/snippet}
				</Collapsible.Trigger>
			</div>
			<Collapsible.Content forceMount>
				{#snippet child({ props, open })}
					{#if open}
						<div {...props} transition:slide={{ duration: 150 }}>
							<div class="my-8 flex flex-col justify-center gap-8 align-middle md:flex-row">
								{#each skillColumns as skills, column (column)}
									<div class="flex max-w-2xl flex-1 flex-col gap-2">
										{#each skills as skill (skill)}
											<Skillbar {skill} />
										{/each}
										{#if column === 1}
											{#if (ctx.selectedProfile?.members?.length ?? 0) > 1}
												<Skillbar skill="coop-social" />
											{:else}
												<div class="flex-1"></div>
											{/if}
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/snippet}
			</Collapsible.Content>
		</Collapsible.Root>
	</div>
</section>
