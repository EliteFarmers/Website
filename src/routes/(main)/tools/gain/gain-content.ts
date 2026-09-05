import type { Step } from '$ui/walkthrough/ctx';
import { GEXP_PER_HOUR } from './gain-tracker.svelte';

export const walkthroughSteps: Step[] = [
	{
		target: 'gain-player-search',
		title: 'Search for a Player',
		description: 'Type an IGN to fill in their farming data.',
		position: 'bottom',
	},
	{
		target: 'gain-date-window',
		title: 'Pick a Date Window',
		description: 'Choose the start of a 9-day range. Use the arrows or pick a specific start date.',
		position: 'bottom',
	},
	{
		target: 'gain-tabs',
		title: 'Switch Between Tabs',
		description: 'View Crop gains, Skill XP, or estimated uptime from guild XP history.',
		position: 'top',
	},
];

export const faqItems = [
	{
		question: 'Where does this data come from?',
		answer: 'When your stats are loaded into the website, it will save your current crop collection and skill XP to build a history. If your profile is new or rarely loaded, there may be gaps in the data. The website does not automatically fetch your Hypixel data.',
	},
	{
		question: 'Why is there no data for a day?',
		answer: "A day may be blank if no profile data was saved for that period or your Collections API is disabled in SkyBlock. Guild EXP data may also be unavailable if you aren't in a guild.",
	},
	{
		question: 'How accurate is the uptime estimate?',
		answer: `The estimate assumes you earn about ${GEXP_PER_HOUR.toLocaleString()} guild EXP per hour of active play. Different activities, especially different games on the Hypixel Network earn EXP at different rates, so your actual playtime may vary.`,
	},
];
