---
title: Recap Statistics
date: 2025-12-08
author: Kaeso
category: info
description: How the statistics in your yearly recap are calculated and what they represent.
blueprint: page
---

# Yearly Recap Statistics

Your yearly recap provides a fun overview of your farming journey over the past year! This page explains the statistics shown in your recap. The year interval is December 7th of the previous year to December 7th of the current year. We do this to get you your stats available to you during the holiday season, and include last December to shorten the year interval.

## Data Collection & Accuracy

The data for your recap is sourced from the Hypixel API when your stats are looked up through normal use of the website/bot. **Players are never polled for updates**. This means that the less a player uses the website/bot, the less accurate their recap will be.

- **Tracking Frequency**: Your player stats are only saved when normal use of the website/bot occurs to update your stats.
    - Cache times are variable, but have a minimum of 15 minutes.
- **Accuracy**: To get increases of stats, we use the 2 data points we have saved that are closest to the start and end of the year interval. This can vary a lot depending on the player.

## Activity Stats

### Active Days

This is simply a count of days that either have a jacob contest loaded in them, or have two data points that show an increase in your skill xp that day.

### Most Active Month

The same as above, but seeing how many "Active Days" are in each month, then grabbing the highest month. Nothing more complex than that.

### Longest Session

This is your longest continuous period of farming activity.

- A "session" is considered continuous as long as there are no gaps in data collection larger than **10 hours**.
- If you take a break longer than 10 hours, the session is considered "ended".
- An hour is counted as active the same way days are considered active. Either a jacob contest, or a logged increase in stats.
    - This by nature will not be very accurate, that's why there's 10 hours of leeway.

## Contests

### Rank & Medals

- **Participated**: The total number of Jacob's Farming Contests you took part in.
- **Contests Joined**: A list of the crops that you joined the contests for the most.
- **Best Placements**: Your top 5 highest leaderboard rankings achieved.

## Shop Purchase

This is just a yes or no if you've bought something from the [shop](/shop) within the past year.

> [!IMPORTANT]
> If you liked this recap, maybe checkout the [shop](/shop) :)

## Events

This page lists some Elite Events you participated in this year! Events are thrown by Discord servers on the website.
You can view some past events by clicking into Discord servers on the [browse page](/browse)!

## Stat Increases

Collections, pests, and skills all work off the same principle. Your first loaded non-zero datapoint in the year interval is compared
with your last.

If you have had collections or skills API off then there probably will not be much for you to see here.

The "vs Avg" numbers that you can see are your increase compared to the median increase of everyone tracked.

## Global Stats (Community Impact)

These stats represent the combined achievements of every player tracked by our system.

### Totals

These totals are gathered by getting the first and last non-zeroed saved stats for every profile member in the database, them summing them.
These are **very rough estimates**, and only include players in the database.

- **Total Crops Farmed**: The sum of crops farmed by the community.
- **Total Crops NPC Value**: The theoretical coin value of all of those crops if sold to NPCs.
- **Total Pests Killed**: The total number of pests exterminated by everyone.
- **Total XP Gained**: The total amount of skill xp gained by everyone.

### Other Stats

- **Ironman Conversions**: A count of Ironman profiles that converted to a Normal profile.
    - Profile conversions are relatively new as of the 2025 recap, so this number is likely much lower than reality.
    - A profile conversion is only tracked if someone in the profile got loaded before and after the conversion.
- **Wiped/Kicked Members**: A count of profile members that were either wiped, kicked, or had their profile deleted.

## Private vs. Public Recaps

By default, recaps are private. You can choose to make your recap public to share it with friends or the community.

- **Private**: Only you can view it when logged in.
- **Public**: Anyone with your IGN can view your recap.
