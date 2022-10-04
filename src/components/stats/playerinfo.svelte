<script lang="ts">
	import type { AccountData, MemberData, PlayerInfo } from '$lib/skyblock';
	import { PUBLIC_HOST_URL } from '$env/static/public';
	import { getRankDefaults } from '$lib/format';
	import { page } from '$app/stores';

	import Dropdown from '$comp/generic/dropdown.svelte';
	import Tooltip from '$comp/generic/tooltip.svelte';

	export let account: AccountData;
	export let player: PlayerInfo;
	export let profileIds: { id: string; name: string }[];
	export let members: MemberData[] | undefined;
	export let linked: boolean;

	const profiles = profileIds.filter((p) => !$page.url.pathname.endsWith(p.name));

	const playerData = player.player;

	const rankName =
		playerData.rank ??
		(playerData.monthlyPackageRank !== 'NONE' ? playerData.monthlyPackageRank : playerData.newPackageRank);
	const rank = getRankDefaults(rankName);
	const plus = rank?.plus ?? undefined;
	const plusColor = rank?.plusColor;
</script>

<section class="md:flex justify-middle p-4 my-4 mx-0 sm:mx-4 bg-gray-100">
	<div class="flex w-full justify-items-middle justify-start sm:justify-center">
		<!-- Player avatar image -->
		<div class="hidden sm:flex justify-end align-middle lg:w-1/4">
			<div class="mx-8 mb-2">
				<img class="w-16" src={`https://mc-heads.net/body/${account.id}`} alt="User's Minecraft appearance" />
			</div>
		</div>
		<!-- Player name -->
		<div class="flex justify-start justify-items-center w-full lg:w-1/4">
			<div class="w-full sm:inline-block grid col-span-1">
				<div class="flex items-center -ml-1">
					<Dropdown hasItems={(members ?? []).length > 0}>
						<h1 slot="top" class="text-body-xl">
							{#if rank && plus}
								<span style="color: {rank.color};">{rank?.tag}</span><span style="color: {plusColor};"
									>{plus}</span
								>&nbsp;{account.name}
							{:else if rank}
								<span style="color: {rank.color};">{rank?.tag}</span>&nbsp;{account.name}
							{:else}
								{account.name}
							{/if}
						</h1>
						<div slot="rest" class="grid col-span-1">
							{#each members ?? [] as member}
								<a
									data-sveltekit-reload
									href={`${PUBLIC_HOST_URL}/stats/${member.ign ?? member.uuid}/${profileIds[0].id}`}
									class="p-1 text-body text-gray-600 hover:text-gray-900">{member.ign}</a
								>
							{/each}
						</div>
					</Dropdown>
					<Dropdown hasItems={(profiles ?? []).length > 0}>
						<h1 slot="top">{profileIds[0].name}</h1>
						<div slot="rest" class="grid col-span-1">
							{#each profiles ?? [] as pId}
								<a
									data-sveltekit-reload
									href={`${PUBLIC_HOST_URL}/stats/${account.name}/${pId.name}`}
									class="p-1 text-body text-gray-600 hover:text-gray-900">{pId.name}</a
								>
							{/each}
						</div>
					</Dropdown>
				</div>
				<div class="block xs:flex sm:block w-full justify-center align-middle">
					<div class="inline-block sm:hidden justify-center align-middle w-1/3 sm:w-1/2 mt-3">
						<div class="mx-8 mb-2">
							<img
								class="w-16"
								src={`https://mc-heads.net/body/${account.id}`}
								alt="User's Minecraft appearance"
							/>
						</div>
					</div>
					<div class="block w-2/3 sm:w-1/2">
						<div
							class="text-body-lg inline-block p-2 px-3 m-1 lg:mt-2 ml-0 rounded-md bg-gray-200 items-center"
						>
							<div class="flex items-center gap-2">
								{#if playerData.socialMedia?.links?.DISCORD}
									<h1>{playerData.socialMedia?.links?.DISCORD}</h1>
								{:else}
									<h1>Discord&nbsp;N/A</h1>
								{/if}
								<Tooltip text={linked ? 'Verified' : 'Unverified'}>
									{#if linked}
										<!-- Verified checkmark -->
										<svg
											class="mt-1 first-line:w-4 h-4 fill-current text-green-500 align-middle"
											viewBox="0 0 20 20"
										>
											<path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
										</svg>
									{:else}
										<!-- Unverified (x) -->
										<svg
											class="text-red-500"
											width="16"
											height="16"
											fill="currentColor"
											viewBox="0 0 16 16"
										>
											<path
												d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
											/>
											<path
												d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
											/>
										</svg>
									{/if}
								</Tooltip>
							</div>
						</div>
						<div class="flex justify-start -ml-1">
							<a
								class="p-2 px-3 m-1 text-body bg-gray-200 rounded-md"
								href="https://sky.shiiyu.moe{$page.url.pathname}"
								target="_blank">SkyCrypt</a
							>
							<a
								class="p-2 px-3 m-1 text-body bg-gray-200 rounded-md"
								href="https://plancke.io/hypixel/player/stats/{account.name}">Plancke</a
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<slot />
</section>
