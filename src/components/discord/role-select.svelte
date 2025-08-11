<script lang="ts">
	import type { GuildRoleDto } from '$lib/api';
	import ComboBox from '$ui/combobox/combo-box.svelte';
	import type { ComponentProps } from 'svelte';

	interface Props extends Omit<ComponentProps<typeof ComboBox>, 'options' | 'placeholder'> {
		name?: string;
		disabled?: boolean;
		value: string | undefined;
		roles?: GuildRoleDto[];
		placeholder?: string;
	}

	let { name, disabled = false, value = $bindable<string | undefined>('_'), roles, ...rest }: Props = $props();

	const roleList = $derived(
		(roles ?? [])
			.sort((a, b) => b.position - a.position)
			.map((r) => ({
				value: r.id ?? '',
				label: '@' + (r.name ?? ''),
			}))
			.filter((r) => r.value && r.label !== '@@everyone')
	);
</script>

<ComboBox {disabled} bind:value placeholder="Select a role" clear={true} {...rest} options={roleList} />
{#if name}
	<input type="hidden" {name} {value} />
{/if}
