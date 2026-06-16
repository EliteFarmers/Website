<script lang="ts">
	import { browser } from '$app/environment';
	import SettingListItem from '$comp/settings/setting-list-item.svelte';
	import {
		DeleteNotificationPushSubscription,
		GetNotificationPreferences,
		GetNotificationPushPublicKey,
		UpdateNotificationPreferences,
		UpsertNotificationPushSubscription,
		type NotificationPreference,
	} from '$lib/remote/notifications.remote';
	import { Switch } from '$ui/switch';

	const preferenceQuery = GetNotificationPreferences();
	const publicKeyQuery = GetNotificationPushPublicKey();

	const types = [
		{ type: 'newComment', label: 'Comments on your guides' },
		{ type: 'newReply', label: 'Replies to your comments' },
		{ type: 'auctionSold', label: 'Auction sales' },
	] as const;

	const channels = [
		{ channel: 'browserPush', label: 'Browser' },
		{ channel: 'discordDm', label: 'Discord DM' },
	] as const;

	let saving = $state(false);
	let preferences = $derived.by(() => preferenceQuery.current?.preferences ?? []);
	let publicKey = $derived(publicKeyQuery.current?.publicKey ?? '');
	let pushSupported = $state(false);
	let browserPermission = $state<NotificationPermission>('default');

	$effect(() => {
		if (!browser) return;
		pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
		browserPermission = pushSupported ? Notification.permission : 'denied';
	});

	function isEnabled(type: string, channel: string) {
		return preferences.some((p) => p.type === type && p.channel === channel && p.enabled);
	}

	async function toggle(type: string, channel: string, enabled: boolean) {
		saving = true;
		try {
			let next = preferences.map((p) => ({ type: p.type, channel: p.channel, enabled: p.enabled }));
			const index = next.findIndex((p) => p.type === type && p.channel === channel);
			if (index >= 0) {
				next[index] = { type, channel, enabled } as NotificationPreference;
			} else {
				next = [...next, { type, channel, enabled } as NotificationPreference];
			}

			if (channel === 'browserPush' && enabled) {
				const ok = await ensureBrowserPushSubscription();
				if (!ok) return;
			}

			await UpdateNotificationPreferences(next);
			await preferenceQuery.refresh();

			if (channel === 'browserPush' && !next.some((p) => p.channel === 'browserPush' && p.enabled)) {
				await disableBrowserPushSubscription();
			}
		} finally {
			saving = false;
		}
	}

	async function ensureBrowserPushSubscription() {
		if (!pushSupported || !publicKey) return false;

		const permission = await Notification.requestPermission();
		browserPermission = permission;
		if (permission !== 'granted') return false;

		const registration = await navigator.serviceWorker.register('/service-worker.js');
		const existing = await registration.pushManager.getSubscription();
		const subscription =
			existing ??
			(await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(publicKey),
			}));
		const json = subscription.toJSON();
		const result = await UpsertNotificationPushSubscription({
			endpoint: json.endpoint ?? subscription.endpoint,
			keys: {
				p256Dh: json.keys?.p256dh ?? '',
				auth: json.keys?.auth ?? '',
			},
			deviceName: navigator.userAgent.slice(0, 128),
		});

		if (result.data?.id) {
			localStorage.setItem('elite_push_subscription_id', result.data.id.toString());
		}

		return result.ok;
	}

	async function disableBrowserPushSubscription() {
		if (!pushSupported) return;
		const registration = await navigator.serviceWorker.getRegistration('/service-worker.js');
		const subscription = await registration?.pushManager.getSubscription();
		await subscription?.unsubscribe();
		const id = Number(localStorage.getItem('elite_push_subscription_id'));
		if (Number.isFinite(id) && id > 0) {
			await DeleteNotificationPushSubscription(id);
		}
		localStorage.removeItem('elite_push_subscription_id');
	}

	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}
</script>

<div class="flex w-full flex-col gap-3">
	<h2 class="text-2xl">Notifications</h2>
	<div class="flex w-full flex-col divide-y">
		{#each types as item (item.type)}
			<SettingListItem title={item.label}>
				{#snippet subtitle()}
					<span class="text-muted-foreground block max-w-md text-sm"
						>Choose where this alert is delivered.</span
					>
				{/snippet}
				<div class="flex flex-wrap gap-5">
					{#each channels as option (option)}
						<label class="flex items-center gap-2 text-sm">
							<Switch
								checked={isEnabled(item.type, option.channel)}
								disabled={saving ||
									(option.channel === 'browserPush' && (!pushSupported || !publicKey))}
								onCheckedChange={(enabled) => toggle(item.type, option.channel, enabled)}
							/>
							<span>{option.label}</span>
						</label>
					{/each}
				</div>
			</SettingListItem>
		{/each}
	</div>
	{#if pushSupported && browserPermission === 'denied'}
		<p class="text-muted-foreground text-sm">Browser notifications are blocked in this browser.</p>
	{/if}
</div>
