
# Features

each section prob needs sub-h3s, they're all pretty beefy. examples are king — show actual usage not abstract descriptions

## Sidekicks

- THE feature. whole point of this thing
- spawn full CC terminal sessions whenever
- NOT subagents — own context, own window, can do literally anything
- telegram your bot → terminal pops open. watching it work real-time is sick
- 3 threads = 3 windows. that's the demo moment
- cron catches urgent thing → sidekick → telegrams you
- fire and forget or keep chatting w it
- self-close when done, "complete sidekick" to end
- can spawn more sidekicks from inside a sidekick lol
- need to elaborate more prob

settings (recall/settings/sidekicks/):
- default-model.txt — which claude model sidekicks use
- port.txt — HTTP server port
- prompt-mode.txt — how prompts get passed in
- allowed-send-file-paths.txt — what files sidekicks can send out

## Heartbeat (cron)

- set interval, burn tokens how you want
- tasks = robot chores in chores/bots/
- check emails, process notifs, run reports, whatever
- explain folder structure

settings (recall/settings/heartbeat/):
- enabled.txt — on/off
- interval.txt — how often it runs
- starting-model.txt — which model for heartbeat agents

## Chores

- HUGE. the safety net thing
- robot chores = auto. human chores = wait for approval
- ex: AI drafts email → human chore → you review/approve/revise
- ex: AI wants to delete something scary → chore. you decide
- dot prefix on bots = disabled
- display UI for reviewing
- recall/settings

## Displays

- TUIs in your terminal, interact w real data
- never leave terminal vibes
- dynamic views, clickable, keyboard shortcuts, mouse
- full UI kit — buttons forms toggles inputs lists
- dark/light mode
- examples: notifs, email, chores, background manager

settings (recall/settings/theme/):
- mode.txt — dark or light
- colors.txt — color palette
- animations.txt — on/off
- dog.txt — your ascii dog config
- crab.txt — the claude crab
- scene.txt — background scene
- toggle.txt — theme toggle behavior

## Notifications

- dump garbage into notifications/dirty/ — emails alerts whatever format who cares
- bot chore cleans it up into notifications/clean/
- NOT hooking into APIs — just throw files in folder, AI sorts it
- 20 emails → 4 items
- instructions.txt for filtering rules
- urgent handling: mom emails → sidekick → telegram me NOW
- bidirectional sync — read on phone, gone here
- display shows curated feed

## Recall

- memory / state management, go deep on this
- recall/memory/, recall/logs/, recall/settings/, recall/files/
- profile.txt
- plain text, you can read it all yourself

## Background

- one command: clappie background start
- manages heartbeat, sidekick server, tailscale, etc
- display shows running services

## CLI

- clappie list, self-documenting, always growing
- just run it and poke around

## Parties

NEW — add this section

- AI swarm simulations, the fun one
- define games w player roles + rules
- spawn multiple AI agents that interact per the rules
- game engine, ledger, identities, emerged memories
- council game, red vs blue, startup sim, dungeon crawl, whatever
- clappie parties games / clappie parties launch
- watching 5 AIs argue is genuinely hilarious

settings (recall/settings/parties/):
- sidekick-prompt.txt — base prompt for party agents

## Projects

NEW — add this section

- workspace for building stuff in projects/
- serve locally, funnel thru tailscale on custom ports (8443+)
- 443 is sacred for webhooks, never touch
- display shows projects w start/stop
- sidekicks can build & serve autonomously lol
- own .git/ → listed in .gitignore so outer repo stays clean
- this docs site is literally a project served thru clappie
