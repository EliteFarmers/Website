<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$ui/input';
	import { Button } from '$ui/button';
</script>

<div class="my-16">
	<section class="my-8 flex w-full flex-col gap-4">
		<h1 class="mb-16 text-4xl">Actions</h1>

		<div class="flex w-full flex-row flex-wrap gap-4">
			<div class="flex max-w-sm flex-col justify-between gap-2 rounded-md border-2 bg-card p-4">
				<p>Clear upcoming jacob's contests if wrong data was submitted.</p>
				<form method="post" action="?/clearcontests" class="flex w-fit flex-col gap-2" use:enhance>
					<Button type="submit" variant="destructive">Clear Upcoming Contests</Button>
				</form>
			</div>

			<div class="flex max-w-sm flex-col justify-between gap-2 rounded-md border-2 bg-card p-4">
				<p>Clear cooldowns for a player</p>
				<form method="post" action="?/resetCooldowns" class="flex w-fit flex-row gap-2" use:enhance>
					<Input name="player" placeholder="Player name/uuid" maxlength={64} required />
					<Button type="submit">Reset</Button>
				</form>
			</div>

			<div class="flex max-w-sm flex-col justify-between gap-2 rounded-md border-2 bg-card p-4">
				<p>Fetch new data for a discord guild</p>
				<form method="post" action="?/refreshGuild" class="flex w-fit flex-row gap-2" use:enhance>
					<Input name="guild" placeholder="Discord Server ID" maxlength={64} required />
					<Button type="submit">Fetch</Button>
				</form>
			</div>

			<div class="flex max-w-sm flex-col justify-between gap-2 rounded-md border-2 bg-card p-4">
				<p>Fetch new data for website cache</p>
				<form method="post" action="?/refreshWebsite" class="flex w-fit flex-row gap-2" use:enhance>
					<Button type="submit">Fetch</Button>
				</form>
			</div>
		</div>
	</section>
</div>
