<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$ui/input';
	import { Button } from '$ui/button';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import SettingSeperator from '$comp/settings/setting-seperator.svelte';
	import Trash_2 from '@lucide/svelte/icons/trash-2';
</script>

<div class="my-16">
	<section class="my-8 flex w-full flex-col gap-4">
		<h1 class="mb-16 text-4xl">Actions</h1>

		<div class="bg-card flex w-full flex-col rounded-lg border-2 p-4">
			<SettingListItem
				title="Refresh Website Cache"
				description="Fetch new data for the website cache. This will update the website with the latest data from the API."
			>
				<form method="post" action="?/refreshWebsite" class="flex flex-row gap-2" use:enhance>
					<Button type="submit">Refresh Cache</Button>
				</form>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem
				title="Clear Player Cooldowns"
				description="Clear cooldowns for a player. This will allow their stats to be fetched again right away."
			>
				<form method="post" action="?/resetCooldowns" class="flex flex-row gap-2" use:enhance>
					<Input name="player" placeholder="Player name/uuid" maxlength={64} required />
					<Button type="submit">Reset</Button>
				</form>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem
				title="Refresh Discord Guild"
				description="Fetch new data for a discord guild. This will update the guild data with the latest data from Discord."
			>
				<form method="post" action="?/refreshGuild" class="flex flex-row gap-2" use:enhance>
					<Input name="guild" placeholder="Discord Server ID" maxlength={64} required />
					<Button type="submit">Fetch</Button>
				</form>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem title="Link Account" description="Link a Minecraft account to a Discord account.">
				<form method="post" action="?/linkAccount" class="flex flex-row gap-2" use:enhance>
					<Input name="player" placeholder="Player name/uuid" maxlength={64} required />
					<Input name="discord" placeholder="Discord ID" maxlength={64} required />
					<Button type="submit">Link</Button>
				</form>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem title="Unlink Account" description="Unlink a Minecraft account from a Discord account.">
				<form method="post" action="?/unlinkAccount" class="flex flex-row gap-2" use:enhance>
					<Input name="player" placeholder="Player name/uuid" maxlength={64} required />
					<Input name="discord" placeholder="Discord ID" maxlength={64} required />
					<Button type="submit" variant="destructive">Unlink</Button>
				</form>
			</SettingListItem>
			<SettingSeperator />
			<SettingListItem
				title="Clear Upcoming Constests"
				description="Clear upcoming jacob's contests if wrong data was submitted."
			>
				<form method="post" action="?/clearcontests" class="flex flex-col gap-2" use:enhance>
					<Button type="submit" variant="destructive">Clear<Trash_2 /></Button>
				</form>
			</SettingListItem>
		</div>
	</section>
</div>
