<script context="module" lang="ts">
	throw new Error("@migration task: Check code was safely removed (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292722)");

	// import type { AccountInfo, Profiles } from '$lib/skyblock';
	// import type { Load } from './$types';

	// export const load: Load = async ({ params, fetch }) => {

	// 	let uuid = params.id;
	// 	let ign; 

	// 	if (uuid.length < 17) {
	// 		const account = await fetch(`/api/account/${uuid}`);
	// 		const info: AccountInfo = await account.json();

	// 		uuid = account.ok ? info.account.id : uuid;
	// 		ign = account.ok ? info.account.name : undefined;
	// 	}

	// 	const response = await fetch(`/api/profiles/${uuid}`);

	// 	const data: Profiles = response.ok && (await response.json());

	// 	// Get latest profile
	// 	data?.profiles?.sort((a, b) => b.member.last_save - a.member.last_save);
	// 	const name = data?.profiles?.[0]?.cute_name;

	// 	if (ign && name) {
	// 		return {
	// 			status: 302,
	// 			redirect: `/stats/${ign}/${name}`,
	// 		};
	// 	}

	// 	return {
	// 		status: 302,
	// 		redirect: '/',
	// 	}
	// }
</script>