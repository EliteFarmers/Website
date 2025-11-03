<script lang="ts">
	import { CREDITS } from '$content/credits';
	import * as Card from '$ui/card';
</script>

{#each CREDITS as credit, i (i)}
	<Card.Root class="my-2 w-full flex-1 gap-0">
		<Card.Header class="pb-4"><p class="text-xl font-semibold">{credit.name}</p></Card.Header>
		<Card.Content>
			<div class="flex flex-col items-start">
				<p class="text-lg">{credit.role}</p>
				<div class="flex flex-row gap-4">
					{#each credit.links as link, i (i)}
						<a class="my-3 text-lg underline" href={link.url}>{link.name}</a>
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{/each}
