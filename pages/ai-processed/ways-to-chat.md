# Ways to Chat

TLDR: Four ways to talk to your AI.
- Terminal — you're already here
- Heartbeat — AI pings you on a schedule
- SSH — access from anywhere
- Messaging — Telegram, Slack

## Terminal

Your home base. Displays and direct chat, all in tmux.

Say "show me notifications" and a TUI pops up. Say "check my emails" and it just does it. Full mouse support, keyboard shortcuts, split panes.

## Heartbeat

The AI reaches out to YOU. You don't check in — it checks in on you.

### How it works

Write a plain text file describing what you want checked. Add when you want it to run. That's it — the AI spawns a sidekick on schedule, does the work, and pings you if something matters.

These are called "bot chores" and they live in `chores/bots/`. Each one is just a `.txt` file with instructions and a schedule.

### Example: morning check-in

```
Check my email and calendar for today.
Summarize anything I need to know.
If something's urgent, ping me on Telegram.

[heartbeat-meta]
interval: 1d
time: 09:00
model: haiku
```

Every morning at 9, a sidekick wakes up, reads your inbox, looks at your calendar, and sends you a summary. You didn't ask for it — it just shows up.

### Example: urgent monitoring

```
Check for any urgent alerts or errors.
If found, immediately ping Telegram with details.

[heartbeat-meta]
interval: 5m
model: haiku
```

Every 5 minutes. If something breaks, you hear about it before you'd ever think to check.

### The power move

Combine heartbeat with notifications. A bot chore processes your dirty notifications every 15 minutes, curates them into clean items, and only bothers you when something actually needs your attention. 20 emails become 4 items. You wake up to a summary, not a wall of noise.

### Disabling a bot

Prefix the filename with a dot: `.my-bot.txt` — stays in the folder but won't run. Remove the dot to re-enable.

### Settings

`recall/settings/heartbeat/`:

- `enabled.txt` — on or off
- `interval.txt` — how often (5m, 15m, 30m, 1h)
- `starting-model.txt` — which model heartbeat agents start with

## SSH

Tailscale + SSH. Access your AI from your phone, another laptop, a coffee shop — anywhere.

1. Install Tailscale on your machine
2. `tailscale up`
3. From another device: `ssh user@your-machine.tailnet-name.ts.net`
4. `tmux attach` — you're back in your session

Works great with mobile terminal apps like Blink or Termius.

## Messaging

Text your AI from Telegram or Slack. Each message spawns a sidekick — a full Claude Code session that processes your request and replies.

**Telegram** — two-way conversations from your pocket. Photos, voice notes, documents. Each thread maintains its own context.

**Slack** — threaded replies, each spawning its own terminal session. Mention your bot in any channel or DM it.

Ask Claude to set either one up — it handles the bot creation, webhook config, and settings.
