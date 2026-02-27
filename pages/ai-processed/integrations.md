# Integrations

TLDR: Three built-in integrations. Build your own by asking Claude.
- Telegram, Slack, Whisper — ready to go
- Any API can become an integration
- OAuth and webhook routing included

## Built-in

### Telegram

Your AI in your pocket. Two-way conversations, photos, voice notes, documents. Ask Claude to "set up Telegram" and it handles everything.

### Slack

Team-ready. Threaded replies that each spawn their own terminal session. Ask Claude to "connect Slack" and it wires it up.

### Whisper

Audio transcription and text-to-speech via OpenAI. Transcribe recordings, generate voice responses. Requires `OPENAI_API_KEY` in `.env`.

## Build Your Own

No plugin marketplace. Any service with a documented API can become a Clappie integration.

Just tell Claude what you want:

```
Build me a clappie skill for GitHub. Reference the
full skill-maker docs. Use the OAuth helper for auth.
I want webhooks for pull requests, issues, and stars.
```

Claude reads the skill-maker reference, creates the folder, wires up OAuth, sets up webhook routes, and you're done.

That's it. Two helpers make it all work:

## OAuth Helper

Token management that just works. Authenticate once, and tokens auto-refresh forever. No expiry headaches, no manual refresh flows.

Say "set up OAuth for Linear" and Claude creates the config. From then on, any skill can grab a fresh token whenever it needs one. Supports any OAuth2 service — if it has an authorize URL and a token URL, it works.

Tokens live in plain files. The display lets you see what's connected, revoke access, or force a refresh.

## Webhook Routing

External services send events to your machine and Clappie routes them to the right handler automatically.

Three modes — dump to the notifications folder (simplest), spawn a sidekick to handle it (smart), or run custom logic (full control). Each skill can register its own webhook routes.

Tailscale Funnel on port 443 makes your machine reachable. The sidekick server handles routing. Every webhook URL gets a random secret path so nothing is guessable.
