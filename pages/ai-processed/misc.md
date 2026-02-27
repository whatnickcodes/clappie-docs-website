# Misc

TLDR: CLI commands, CLAUDE.md, and how to uninstall.
- `clappie list` shows everything available
- CLAUDE.md is the soul — edit it to change personality and behavior
- Clean uninstall in one step

## CLI

`clappie list` is your homebase. It shows every command available — displays, sidekicks, background, parties, oauth, webhooks, everything.

To run it, type `!` in Claude Code to drop into bash mode, then:

```bash
clappie list
```

The `!` prefix is how you run any shell command from inside Claude Code. So `!clappie list`, `!clappie display push notifications`, etc. Or just type `!` by itself to get a bash prompt.

As you add skills and integrations, new commands automatically show up in the list. You don't need to memorize anything. Just run `clappie list` and go from there.

## CLAUDE.md

This is the soul. It's a markdown file with your personal instructions to the AI — personality, behavior, rules, preferences. And it's lean. Like, really lean. A few lines that tell Claude who it is and what to load. That's it.

Want a different tone? Edit CLAUDE.md. Want new behaviors? Edit CLAUDE.md. Want the AI to handle something differently? CLAUDE.md.

It's not config. It's not code. It's just you telling the AI how to be your assistant, in plain English. The heavy lifting lives in the skill file — CLAUDE.md just points to it and sets the vibe.

## Uninstall

```bash
# Stop everything
clappie background stop
clappie kill

# Remove the repo
rm -rf ~/clappie

# Remove the shell function from ~/.zshrc
# (delete the clappie() function block)
```

That's it. No system files to clean up, no daemons to kill, no PATH entries to remove. It was just a folder.
