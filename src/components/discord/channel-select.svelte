<script lang="ts">
	import type { components } from '$lib/api/api';
	import { ChannelType } from '$lib/utils';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import type { ComponentProps } from 'svelte';

	interface Props extends Omit<ComponentProps<typeof ComboBox>, 'options' | 'placeholder'> {
		name?: string;
		disabled?: boolean;
		value: string | undefined;
		channels?: components['schemas']['GuildChannelDto'][];
		placeholder?: string;
		class?: string;
	}

	let { name, disabled = false, value = $bindable<string | undefined>('_'), channels, ...rest }: Props = $props();

	const channelList = $derived(
		(channels ?? [])
			// Only allow text channels
			.filter((c) => c.id && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
			.sort((a, b) => b.position - a.position)
			.map((c) => ({
				value: c.id ?? '',
				label: '#' + (c.name ?? ''),
			}))
			.filter((c) => c.value)
	);
</script>

<ComboBox {disabled} bind:value placeholder="Select a channel" clear={true} {...rest} options={channelList} />
{#if name}
	<input type="hidden" {name} {value} />
{/if}
