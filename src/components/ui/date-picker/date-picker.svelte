<script lang="ts">
	import { Calendar as CalendarIcon } from 'lucide-svelte';
	import { type DateValue, DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$ui/button';
	import { Calendar } from '$ui/calendar';
	import * as Popover from '$ui/popover';

	const df = new DateFormatter('en-US', {
		dateStyle: 'long',
	});

	interface Props {
		value?: DateValue;
		minValue?: DateValue;
		maxValue?: DateValue;
		class?: string;
	}

	let {
		value = $bindable<DateValue | undefined>(),
		minValue = $bindable<DateValue | undefined>(undefined),
		maxValue = $bindable<DateValue | undefined>(undefined),
		class: className = '',
	}: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			buttonVariants({
				variant: 'outline',
				class: cn('w-[280px] justify-start text-left font-normal', className),
			}),
			!value && 'text-muted-foreground'
		)}
	>
		<CalendarIcon class="mr-2 h-4 w-4" />
		{value ? df.format(value.toDate(getLocalTimeZone())) : 'Select a date'}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar type="single" bind:value initialFocus {maxValue} {minValue} fixedWeeks={true} />
	</Popover.Content>
</Popover.Root>
