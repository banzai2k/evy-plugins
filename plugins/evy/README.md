# EVY for Claude Code

EVY's plugin connects Claude Code to EVY, the planner that holds your spaces, goals and tasks.

- **At the start of each session** in a folder linked to one of your EVY spaces, Claude reads that space's open tasks, your standing instruction, recent decisions and where the space stands. Sessions in other folders start as usual.
- **EVY's tools** (an MCP server) let Claude claim and finish tasks, ask you something, add work, record your decisions and keep the space's progress summary current. Everything shows in EVY at once.
- **After every turn** in such a folder, EVY gets what you and Claude said since the last turn (your messages and Claude's answers, never tool output or file contents) and writes what moved into the space's Updates note: one dated line per development, credited, newest first. Most turns bring no news and add nothing. It runs in the background and never holds up the turn.
- **Before each message you send**, Claude is told what is new in EVY for the space since the session last heard: lines other sessions, the chat or agents added to the Updates note, and notes people changed.

EVY keeps what agents write short: a progress summary holds at most 150 words, a decision 40, and the context a session starts with fits a fixed budget, so it reads the same after a year as after a week.

## Setup

EVY Desktop installs and connects the plugin during setup. By hand:

```
claude plugin marketplace add banzai2k/evy-plugins
claude plugin install evy@evy
```

The plugin reads this Mac's agent token from the file EVY Desktop writes when it pairs the Mac (`~/Library/Application Support/EVY/Runner/.env`); no token is stored in Claude Code's settings. Set your EVY address in `/config` if it differs from the default.

## Codex

`codex/setup.sh` gives Codex the same tools and hooks in `~/.codex/config.toml`. Codex runs hooks only after you trust them in `/hooks`.
