

~/clappie/
	.claude/
		settings.json (let's do exact without my hooks, description configure your claude code however you want for your own level, link to their docs, note mine is basically yolo mode)
		skills/
			clappie/
				[...]
			clappie-skill-maker/
				[...]
			example-skill/
				SKILL.md
				example-skill.js
				.env.example
			example-skill-displays/
				SKILL.md
				example-skill-displays.js
				.env.example
				displays/
					index.js
					extra-details.js
			example-skill-webhooks/
				SKILL.md
				example-skill-webhooks.js
				webhook.json
				.env.example
				webhooks/
					verify.js
					send.js (chat patterns: send messages + sidekickCommands for extension commands)
					routes/
						fork.js
						star.js
						pull-request.js
			example-skill-oauth/
				SKILL.md
				example-skill-oauth.js
				oauth.json
				.env.example
			example-skill-background/
				SKILL.md
				example-skill-background.js
				.env.example
				.background (info indicator: lets clappie know this is meant to run in background and has settings)
	chores/
		bots/
			clean-notifications.txt (popup and a good demo, explainer)
			fetch-my-calendars-and-dump-into-dirty.txt (...)
			get-email-activity.txt
			.imessage-dump-to-dirty.txt (info indicator a dot means it's not active / won't run)
		humans/
			4-easy-work-emails-need-approval.txt
			approve-urgent-board-member-email.txt
			text-for-bobs-40th-birthday-is-ready.txt
			resolve-calendar-conflict.txt
	notifications/
		instructions.txt
		dirty/ (info indicator: explain it)
			google-calendar.txt
			google-calendar-2.txt
			google-calendar-3.txt
			emails-read.txt
			emails-unread.json
			github-notifications.json
			some-sort-of-logs-progmatically-put-here.log
		clean/
			5-work-emails-queued-as-drafts-in-chores.txt
			1-urgent-text-message-from-mom.txt
			22-auto-handled-items.txt
	recall/
		profile.txt (summary, not attached to Claude.md but it knows it exist)
		memory/
			personal.txt
			preferences.txt
			people.txt
			another-category.txt
		settings/
			theme/ (want real examples for all of these)
				mode.txt
				scene.txt
				animations.txt
				colors.txt
				header.txt
				footer.txt
				toggle.txt
				crab.txt
				dog.txt
			heartbeat/ (want real examples for these)
				enabled.txt
				interval.txt
			sidekicks/ (want real examples for all thes)
				port.txt
				default-model.txt
				allowed-send-file-paths.txt
				webhooks/ (user-defined handlers, no skill required)
					.demo-dirty.js (dumps payload to notifications/dirty/)
					.demo-sidekick.js (spawns a Claude sidekick)
					.demo-run.js (custom code, full control)
			telegram-bot/
				enabled.txt
				webhook-path.txt
				sidekick-prompt.txt
				users.txt
				webhooks/
					incoming-message.txt
			slack-bot/
				enabled.txt
				webhook-path.txt
				sidekick-prompt.txt
				users.txt
				webhooks/
					incoming-message.txt
			example-skill-webhooks/
				enabled.txt
				webhook-path.txt (info indicator required for webhook the secret path will be at <skill>/<webhoo>/...)
				webhooks/
					fork.txt (enable/disable the default webhooks)
					start.txt (enable disable the default webhooks)
					pull-request.txt (enable disable the default webhooks)
					.demo-custom-signing.js (not active)
					.demo-custom-signing-2.js (not active)
		logs/
			heartbeat/
				[...]
			sidekicks/
				[...]
			chores/
				[...]
			notifications/
				[...]
		files/
			[...]
		oauth/
			clappie-localhost-key.pem
			clappie-localhost.pem
			example-skill-oauth.json
	personal/ (info create folders for whatever you need)
		[...]
	work/  (info create folders for whatever you need)
		[...]
	.env (indicator for private keys plus basic demo)
	.gitignore (...)
	CLAUDE.md (info indictor: 1 simple file just update as needed)
