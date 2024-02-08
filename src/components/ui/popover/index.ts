import { Popover as PopoverPrimitive } from 'bits-ui';
import Content from './popover-content.svelte';
import Mobile from './popover-mobile.svelte';

const Root = PopoverPrimitive.Root;
const Trigger = PopoverPrimitive.Trigger;

export {
	Root,
	Content,
	Trigger,
	Mobile,
	//
	Root as Popover,
	Content as PopoverContent,
	Trigger as PopoverTrigger,
	Mobile as PopoverMobile,
};
