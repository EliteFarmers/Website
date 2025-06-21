import { Popover as PopoverPrimitive } from 'bits-ui';
import Content from './popover-content.svelte';
import Mobile from './popover-mobile.svelte';
import Trigger from './popover-trigger.svelte';
const Root = PopoverPrimitive.Root;
const Close = PopoverPrimitive.Close;

export {
	Root,
	Content,
	Trigger,
	Close,
	Mobile,
	//
	Root as Popover,
	Content as PopoverContent,
	Trigger as PopoverTrigger,
	Close as PopoverClose,
	Mobile as PopoverMobile,
};
