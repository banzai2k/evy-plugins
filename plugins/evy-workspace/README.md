# EVY

EVY is a free workspace for people and agents. It runs on the Claude or ChatGPT plan you already pay for. This plugin connects Claude to your EVY workspace, so Claude can read your spaces, plans, tasks and notes, and save its work back where your team sees it.

## What Claude can do with it

- Read your spaces (one per company or area of life), what each is about and where it stands.
- Search your notes and read them in full, with their source and date.
- List and read your tasks, start one and report it when it is done.
- Save finished work as a note, add a task, save a plan with steps, and record a decision.
- Suggest edits to a note, and read and answer the comments on it.

Claude asks before it changes anything that cannot be undone.

## Getting started

1. Install the plugin from Claude's directory, or in Claude Code with `/plugin install evy-workspace --marketplace banzai2k/evy-plugins`. Claude adds EVY's server at `https://my.evy.so/mcp`.
2. The first time Claude uses EVY, it opens EVY's sign-in. Sign in, or create a free account, and allow Claude.
3. Ask Claude about your work, for example "What's on my plate in EVY this week?"

To disconnect, open EVY's Settings, then Connected apps, and remove Claude.

## What it sends and stores

The plugin contains no code that runs on your computer. It points Claude at EVY's server and nothing else. When Claude calls one of EVY's tools, the call and its answer travel between Claude and EVY's servers in Germany. EVY stores what Claude saves (notes, tasks, plans, decisions, comments) in your workspace, and a record of which app made each change. EVY does not keep your conversation with Claude and does not use your content to train AI models. Sign-in uses OAuth: Claude holds a token that you can revoke at any time in Connected apps.

Privacy policy: https://evy.so/privacy-policy/
Terms: https://evy.so/terms-of-service/
Help: help@evy.so

EVY is made by Helix Studio OÜ, Tallinn, Estonia.
