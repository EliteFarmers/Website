<script lang="ts">
	import type { WeightStyleWithDataDto } from '$lib/api';
	import ProfileTheme from '$comp/stats/profile-theme.svelte';

	interface Props {
		style: WeightStyleWithDataDto;
		ign: string;
	}

	let { style, ign }: Props = $props();
</script>

<ProfileTheme theme={style.page} imageRefs={style.imageRefs} class="aspect-video overflow-clip rounded-lg border">
	<div class="relative flex h-full flex-col gap-3 p-4 sm:p-6">
		<div class="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground sm:text-xs">
			<span>Profiles</span><span>/</span><span class="font-medium text-foreground">{ign}</span>
		</div>

		<div
			class="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-foreground shadow-sm sm:gap-4 sm:p-4"
		>
			<div class="size-10 shrink-0 rounded-md bg-muted sm:size-14"></div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold sm:text-lg">{ign}</p>
				<p class="text-[0.65rem] text-muted-foreground sm:text-xs">Farming Weight · 12,345</p>
			</div>
			<div class="rounded-md bg-primary/15 px-2 py-1 text-[0.65rem] font-semibold text-primary sm:text-xs">
				#3,113
			</div>
		</div>

		<div class="flex w-fit rounded-md border border-border p-1 text-[0.6rem] sm:text-xs">
			<span class="rounded-sm bg-muted px-2 py-1 font-medium">Stats</span>
			<span class="px-2 py-1 text-muted-foreground">Garden</span>
			<span class="px-2 py-1 text-muted-foreground">Fortune</span>
		</div>

		<div class="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3">
			<div class="rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm">
				<p class="text-[0.65rem] font-semibold sm:text-xs">Profile</p>
				<div class="mt-2 space-y-1.5">
					<div class="h-2 w-4/5 rounded-full bg-muted"></div>
					<div class="h-2 w-3/5 rounded-full bg-muted"></div>
				</div>
			</div>
			<div class="rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm">
				<p class="text-[0.65rem] font-semibold sm:text-xs">Recent activity</p>
				<div class="mt-2 space-y-1.5">
					<div class="h-2 w-2/3 rounded-full bg-primary/25"></div>
					<div class="h-2 w-5/6 rounded-full bg-muted"></div>
				</div>
			</div>
		</div>
	</div>
</ProfileTheme>
