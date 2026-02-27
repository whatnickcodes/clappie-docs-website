# Features

TLDR: Sidekicks, chores, displays, notifications, recall, parties, projects, and background.
- Sidekicks spawn independent Claude Code sessions
- Chores queue risky actions for your approval
- Parties run AI swarm simulations
- Everything is plain text files

## Sidekicks

The core feature. Sidekicks are full, independent Claude Code terminal sessions that spin up on demand.

**Not subagents.** Each sidekick is its own context window that can do anything — spawn more sidekicks, run subagents, hold conversations, whatever.

### How it works

1. Something triggers a sidekick (Telegram message, Slack thread, cron job, or you asking)
2. A new Claude Code session opens in a background tmux pane
3. The sidekick does its thing — reads emails, writes code, checks APIs
4. It reports back (Telegram reply, notification, log entry) and cleans up

### Examples

- You text your Telegram bot "check my emails" → terminal pops open, reads inbox, sends you a summary
- You ping the bot 3 times in 3 separate threads → 3 separate terminal windows open
- A heartbeat cron catches something urgent → spawns a sidekick → Telegrams you a warning
- You say "complete sidekick" and it wraps up and closes

### Fire and forget

Some sidekicks are one-shot — spawn, do the thing, send a message, close. Others stick around for a back-and-forth conversation. Up to you.

### Settings

`recall/settings/sidekicks/`:

- `default-model.txt` — which Claude model (opus, sonnet, haiku)
- `port.txt` — HTTP server port
- `prompt-mode.txt` — how prompts get passed in
- `allowed-send-file-paths.txt` — what files sidekicks can send out

## Chores

The safety net. Two types:

**Robot chores** (`chores/bots/`) — automated tasks that run on heartbeat schedule. The stuff from the section above.

**Human chores** (`chores/humans/`) — actions the AI wants to take but needs your approval first.

### How it works

1. AI wants to do something risky (send email, delete file, post publicly)
2. It drafts a chore file in `chores/humans/` with all the details
3. You review it in the chores display
4. Approve, reject, or edit and then approve

### Example

The AI drafts an email reply. You open the chores display, read it — don't like the tone? Edit it right there. Or tell the AI "make it shorter" or "sound less formal" and it revises the draft in real time. When it looks right, hit approve. It sends exactly what you approved.

The beauty is every chore is just a draft. Nothing happens until you say so. And you can keep going back and forth with the AI to get it perfect before it ever touches the real world.

### Inline approval

If you're already chatting and the AI creates a chore, you can just say "yes send it" right there. No need to open the display.

## Displays

Interactive terminal UIs that show your actual data. Notifications, email inbox, chore queue, background manager — all rendered in your terminal with mouse clicks and keyboard shortcuts.

### How it works

Say "show me my notifications" or "open chores" and a TUI pops up in a split pane. Click buttons, scroll lists, fill forms. Never leave your terminal.

### Built-in displays

- **Background** — toggle services on/off
- **Heartbeat** — manage scheduled tasks
- **Sidekicks** — view active sessions
- **Notifications** — your curated inbox
- **Chores** — approve/reject pending actions
- **Projects** — start/stop served projects

### Settings

`recall/settings/theme/`:

- `mode.txt` — dark or light
- `colors.txt` — color palette
- `animations.txt` — on or off
- `dog.txt` — your ASCII dog
- `crab.txt` — the Claude crab
- `scene.txt` — background scene

## Notifications

Dump unstructured data into a folder. AI sorts it into something useful.

### How it works

1. Raw data lands in `notifications/dirty/` — emails, alerts, whatever format
2. The `clean-notifications` heartbeat bot processes it
3. Curated items appear in `notifications/clean/`
4. 20 emails become 4 actionable items

### Urgent handling

Set rules in `notifications/instructions.txt`. Example: "if from mom → spin up a sidekick and Telegram me immediately."

### Bidirectional

Read something on your phone? It disappears from the display. No duplicate processing.

## Recall

Your AI's memory. Plain text files you can read and edit yourself.

- `recall/memory/` — facts about you, your preferences, people you know
- `recall/logs/` — conversation logs, sidekick logs, chore logs
- `recall/settings/` — all configuration
- `recall/files/` — media, attachments
- `recall/profile.txt` — synthesized profile from all memory files

No database. Just files.

## Parties

AI swarm simulations. The fun one.

### How it works

1. Write a "rules" file — plain text describing the game, teams, roles, and win conditions
2. Launch it — multiple AI agents spawn as sidekicks, each with their own identity
3. A shared ledger tracks everything — actions, scores, events, state changes
4. The agents interact with each other according to the rules you wrote

The rules file is everything. It defines teams, player roles, how turns work, what actions are available, scoring — all in plain English. Change the rules, get a completely different game.

### Shared ledger

Every agent reads from and writes to the same ledger. This is how they coordinate — agent A takes an action, it hits the ledger, agent B sees it and reacts. It creates emergent behavior you didn't explicitly program. Alliances form, strategies shift, agents develop grudges or trust based on what happened earlier in the game.

### Emergents

The wildest part is what you didn't plan for. Agents develop personalities, remember betrayals, form coalitions, bluff. None of that is in the rules — it just emerges from multiple AIs reading the same shared state and making decisions. You set the stage, they write the play.

### Examples

- **Council** — AIs debate and vote on proposals
- **Red vs Blue** — two teams competing
- **Startup Sim** — simulate a company
- **Dungeon Crawl** — collaborative adventure

### Game commands

During a game, agents can move resources and items between each other using three commands:

- `give` — hand something to another agent
- `take` — claim something from the shared pool or another agent
- `transfer` — move resources between two agents

These work through the shared ledger — every give, take, or transfer gets recorded so all agents can see what changed and react accordingly.

Say "show me party games" to see what's available, or "launch a party" to kick one off.

### Settings

`recall/settings/parties/`:

- `sidekick-prompt.txt` — base prompt for party agents

## Projects

A workspace for building and serving apps, sites, APIs — whatever.

### How it works

1. Build stuff in `projects/`
2. Serve locally through Tailscale on custom ports (8443+)
3. The projects display shows everything with one-click start/stop

Port 443 is reserved for webhooks. Projects never touch it.

### Sidekick builds

Tell your AI to build a website — it spawns a sidekick, creates the project, and serves it. Autonomously.

Projects with their own `.git/` get listed in `projects/.gitignore` so they don't mess with the outer repo.

## Background

Say "open background manager" and you get a display with all your services — heartbeat, sidekick server, Tailscale, whatever you've configured. Toggle them on and off with a click. That's it.
