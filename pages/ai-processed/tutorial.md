# Tutorial

TLDR: One skill file turns Claude Code into a personal agent you can access from anywhere.
- Text it from Telegram or Slack
- Background tasks run while you sleep
- Interactive terminal UIs for everything
- 10 steps, done

## Intro

Clappie turns your Claude Code terminal into a personal agent you can hit up from anywhere — Telegram, Slack, SSH, whatever. It runs background tasks, sends you alerts, remembers stuff across sessions, and shows interactive UIs right in your terminal.

It's one skill file. No framework. No drama.

**Honestly?** Just clone the repo, open Claude Code, and ask it to walk you through setup. It'll figure out what you need and get you running. The steps below are here if you want to do it yourself, but Claude already knows how all of this works.

**How it works:** plain text files get tossed around. Chores are `.txt` files. Memory is `.txt` files. Notifications are `.txt` files. The AI reads them, acts on them, writes new ones. That's the whole architecture.

## Requirements

- **macOS** — probably works elsewhere but built for Mac
- **Ghostty** — terminal emulator
- **tmux** — terminal multiplexer
- **Bun** — JavaScript runtime
- **Claude Code** — the CLI

## Steps

### 1. Install Claude Code

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### 2. Install tmux

```bash
brew install tmux
```

### 3. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### 4. Clone the repo

```bash
cd ~
git clone https://github.com/whatnickcodes/clappie
```

### 5. Add the shell function

Add this to your `~/.zshrc`. This makes `clappie` work as a command — it starts a tmux session with Claude Code when run bare, and routes subcommands to the CLI.

```bash
clappie() {
  if [[ $# -eq 0 ]]; then
    cd ~/clappie && tmux new-session "claude"
  elif [[ -z "$TMUX" ]]; then
    echo "Start clappie first: clappie"
  else
    bun ~/clappie/.claude/skills/clappie/clappie.js "$@"
  fi
}
```

Then reload:

```bash
source ~/.zshrc
```

### 6. Open a terminal and run it

```bash
clappie
```

You're now in a Claude Code session inside tmux, with the clappie skill loaded.

### 7. Set up Tailscale

Tailscale is a zero-config VPN. You need it for two things: **webhooks** (so Telegram/Slack can talk to your machine) and **remote access** (so you can SSH in from anywhere).

```bash
brew install tailscale
tailscale up
```

Then enable Funnel on port 443 — this is what makes your machine reachable from the internet for webhooks:

```bash
tailscale funnel 443
```

Port 443 is reserved for webhooks. Projects use 8443+.

### 8. Set up your .env

Create a `.env` file in the clappie root with whatever integration keys you want:

```bash
# Telegram bot (get from @BotFather)
TELEGRAM_BOT_TOKEN=...

# Slack bot
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# OpenAI (for Whisper audio)
OPENAI_API_KEY=sk-...
```

Only add what you need. Nothing is required to start.

### 9. Start background services

Say "show me the background manager" — a display pops up showing all your services. Click the buttons to turn them on. Heartbeat, sidekick server, Tailscale — toggle what you need.

### 10. Text your bot

Open Telegram, message your bot. Watch the terminal light up — a sidekick spawns, processes your message, and replies. That's it. You're live.
