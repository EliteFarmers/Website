<script lang="ts">
	import { getBadges } from '$lib/remote';

	const badges = getBadges();
</script>

<div class="flex flex-col gap-4">
	{#each badges.current ?? [] as badge (badge.id)}
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
			<div class="flex shrink-0 gap-3">
				{#each [{ label: 'Default', image: badge.image }, { label: 'Alt', image: badge.altImage }] as option (option.label)}
					{#if option.image?.url}
						<div class="flex flex-col items-center gap-1">
							<img
								src={option.image.url}
								alt={`${badge.name} (${option.label})`}
								class="size-12 object-contain"
								width="48"
								height="48"
							/>
							{#if badge.altImage}<span class="text-xs text-muted-foreground">{option.label}</span>{/if}
						</div>
					{/if}
				{/each}
			</div>
			<div class="flex max-w-md flex-1 flex-col gap-1">
				<p class="text-lg font-semibold">{badge.name}</p>
				<p>{badge.description}</p>
			</div>
			<div class="flex max-w-md flex-1 flex-col gap-1">
				<p class="mt-1 font-semibold">Requirements</p>
				<p>{badge.requirements}</p>
			</div>
		</div>
	{/each}
</div>
