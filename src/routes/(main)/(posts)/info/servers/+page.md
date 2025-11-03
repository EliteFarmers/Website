---
title: Server Management
date: 2025-11-03
author: Kaeso
category: help
description: What bot settings are available to server owners!
blueprint: page
---

# Server Management

Manage Discord server settings for the Elite Bot!

## Setup

To get started with managing server settings you need to do the following:

- Add the Elite Bot to your Discord server. [Invite Now](/invite)
- Be the owner of the server, or have **Administrator** permissions.
- Wait ~10 minutes for the server to show up on your [server list](/profile/servers).
    - It may take longer than this! If it's been over an hour please [contact us](/contact)!
    - Logging out and back in might help too!

Once you can see your server in your [server list](/profile/servers) you're good to go!
Click on the gear icon to open up the settings for your server.

## Contest Pings

As of now, the only free feature you can setup in your own server are upcoming contest pings.

Contest pings are alerts that send in your Discord server's channel of choice that always send 5 minutes
before the next [Jacob Contest](https://wiki.hypixel.net/Jacob%27s_Farming_Contest).

You're also able to configure specific roles that are pinged for each crop!

![Preview of an upcoming ping image](/images/md/contest-ping.png)

The ping message itself contains the following information:

- The next 3 crops in the upcoming contest.
- Expected difficulty of each crop, for both diamond and gold brackets.
    - In the above image, a gold placement in Nether Wart is expected to take 789,775 collection, or averaging 19.8 blocks broken per second with 1,230 farming fortune.
- Next contest crops.

> [!NOTE]
> Upcoming contests are loaded from [SkyHanni](https://modrinth.com/mod/skyhanni) users that volunteered to send their calendar data at the start of a SkyBlock year!
> For that reason, the very first contest of a year is often not loaded in time for the alert.

## Premium Server Offerings

You'll immediately see a notice like this on your server management page:

> **Want to unlock a feature?**  
> Subscribe to the appropriate package in the [support server](/support)'s
> built-in Discord Shop and/or open a ticket in the support server to discuss options!

If you reach out and end up subscribing, you'll unlock the following:

- Jacob Leaderboards
- Events
- Public Page

## Jacob Leaderboards

Jacob leaderboards are leaderboards for the best Jacob Contest performances of the members in your server.

![Example of a jacob leaderboard showing the submit scores button](/images/md/jacob-leaderboard-bottom.png)

![Example of a jacob leaderboard alert](/images/md/jacob-leaderboard-alert.png)

When you make a new Jacob leaderboard you configure several settings:

- Leaderboard name
- Channel to display leaderboard in
- If update messages should be sent
    - Where to send update messages
    - What role to ping for updates
    - If small improvements should be pinged for
- Role required to submit scores
- Role blocked from submitting scores
- Start and end timestamp of leaderboard
    - These timestamps apply to the contest score a user is submitting, not when they're allowed to submit.
      To block submitting scores use an **Excluded Time Span** or delete the leaderboard.

#### Excluded Time Spans

On the Jacob Leaderboard management page you're able to exclude any time spans! These exclusions apply to the
timestamps of a contest participation, not when the user is submitting scores. The reason is shown to the user.

#### Deleting a leaderboard

When you delete a Jacob Leaderboard it's permanently deleted! But it doesn't delete the message in Discord.
You're able to delete the leaderboard in your server management portal, then click "Submit Scores" in Discord to
essentially archive the leaderboard message in that channel.

## Server Events

Server events are events you can throw for your Discord server members! Anyone that is a member of your Discord server and has their accounts
linked is able to join the event on one of their profiles!

### Event Modes

- Solo Event
    - It's a free for all! This is the simple event type.
- Custom Team Event
    - All users can create a team with a name of choice (composed of allowed words in the word list).
    - Teams can have as many members as you set when making the event.
    - Users are responsible for sending their join code for other members to join their team.

### Event Types

- Farming Weight
    - Most farming weight collected for the duration of the event.
    - Has protections against counting minion collections.
    - You can customize the weight of each crop!
- Medals
    - Most Jacob Medals earned for the duration of the event.
    - Medals don't need to be claimed to be counted (but should be anyway).
    - You can customize the value of each medal!
- Pests
    - Most pests vacuumed during the event!
    - You can customize the points gained from each pest type!
- Collections
    - Most of any arbitrary collection collected during the event.
    - Has no protections against minion use.
    - You can customize the value of each collection!

### Event Setup

After filling out the basic information for your event you're taken to the management page!

From here you can customize the values/weights of the event, manage members, and upload a banner image!

> [!NOTE]
> Events must be approved by [us](/contact) before they go live on the site. Please plan accordingly by
> setting up your event well in advance! You usually want your event live a few days to a week before it starts
> for members to join!

### Event Management

During events, admins of your server are able to moderate the members.

- Ban Member
    - Removes them from the leaderboard.
    - Displays a ban message to the user.
    - Is reversible if needed.
- Delete Team
    - Deletes a team and removes all members from the team.
- Set as Owner
    - Sets a team member to be owner, replacing the current owner.
- Add to Team
    - Add a team member to specific team.

- Force Add Member
    - Add a player to the event if they're unable to themselves for whatever reason.
- Delete Member Entry
    - Only use if absolutely necessary, like if a player signed up with the wrong profile.

## Public Page

Your Discord server will be listed on [/browse](/browse)!

## Any Questions?

Feel free to [contact us](/contact)!
