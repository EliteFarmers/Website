<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$ui/input';
	import { Button } from '$ui/button';
</script>

<main class="my-16">
	<section class="my-8 flex w-full max-w-2xl flex-col gap-4">
		<h1 class="mb-16 text-4xl">Actions</h1>

		<div class="flex w-full flex-col gap-2">
			<p>Clear upcoming jacob's contests if wrong data was submitted.</p>
			<form method="post" action="?/clearcontests" class="flex w-fit flex-col gap-2" use:enhance>
				<Button type="submit" variant="destructive">Clear Upcoming Contests</Button>
			</form>
		</div>

		<div class="flex w-full flex-col gap-2">
			<p>Clear cooldowns for a player</p>
			<form method="post" action="?/resetCooldowns" class="flex w-fit flex-row gap-2" use:enhance>
				<Input name="player" placeholder="Player name/uuid" maxlength={64} required />
				<Button type="submit">Reset</Button>
			</form>
		</div>
	</section>
</main>
