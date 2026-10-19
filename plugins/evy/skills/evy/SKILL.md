---
name: evy
description: How to work with EVY, the person's planner, through its tools (the evy MCP server). Use when a session starts with EVY's context, when you pick up, finish or get stuck on an EVY task, when the person decides something, and before you end a session that changed something.
---

# Working with EVY

EVY holds the person's spaces (one per company or area of life), with their goals, initiatives, responsibilities and tasks. A folder on this Mac can belong to a space. In such a folder your session starts with that space's context: open tasks with their ids, the person's standing instruction, recent decisions and the progress summary. If it did not, call `get_context`.

## While you work
- Start an EVY task only when the person asks, or when it is queued for you. Call `claim_task` first, with the session id from your context, so no other session takes it.
- Finish it with `report`: the result for someone who saw nothing before. A file only when the format matters (a table or matrix as an .xlsx sheet, a letter or contract as a .docx, a deck, an image), with an `OUTPUT:` line, and the result then says in 2 to 4 sentences what it holds, what is open and where it is. An email, post, answer or research goes in the result in full. Never a Markdown file. Status `blocked` when you cannot go on.
- Only the person can answer something: `ask`, one question, then stop. When the answer is a choice, send 2 or 3 `options` (a short name, one line each, your recommendation marked) so they can tap one.
- Work you spot outside your task: `propose` it, for the person to decide. `add_task` only when the person asks for a task, and for an agent only when they asked you to hand the work off.
- A task you add or propose goes to an agent (you, by default) with a `prompt` a fresh session can run from on its own (the task, the files or area, what done looks like) and a `done_when`. It goes to the person (`assignee: me`) only when it needs them, and then says why in `needs_person`: `decision`, `sign_in`, `payment`, `physical` (a call, a visit, a signature), `check` (one only they can make) or `asked` (they asked for it to be theirs). EVY refuses a task for the person without one.
- A Claude session the person wants to queue (a build or research session, run later or after another one) is `add_task` with `session: true`: the title starts with a short handle ("B7 · What EVY does with calendar data"), `prompt` is the full session brief, `done_when` says what exists at the end, and in a git repository `worktree` names the base branch (for example `feat/compass`), so it runs in its own worktree beside other sessions. It goes to @claude with a limit of 12 hours, and the person starts it from To-do with Run, or chains it after the last one.
- Splitting an EVY task off into its own session (Claude's desktop app can): only a task you have not claimed, since one you hold stays with you. Put the task id in that session's brief. The new session calls `claim_task` with its own session id (from its context, or a short name of its own when there is none) and reports the task itself; the session that started it does not.
- Never tick off the person's own tasks. Say what you did with `comment`.
- You may change only the space of the folder you work in. Read the others when asked.
- A folder that belongs to no space: ask the person which space, then `link_folder`.
- An image: `make_image` uses the person's own image key and gives you the command that saves it where EVY's file rules put the task's files (on Codex, use Codex's own image generation instead). Give it an `OUTPUT:` line in the report.
- The space's notes: when your context names a `Knowledge` folder (`~/Documents/<space>/Knowledge/`), the space's shared notes are Markdown files there. Search them (grep) before asking EVY or the person. They are a read-only copy: write notes in EVY, never in those files. `knowledge_search` also finds the person's private notes and matches by meaning; `knowledge_page` reads one, with `as_of` as it read on an earlier day.

## Keeping EVY current
- The person decided something with you: `record_decision`, what and why, at most 40 words.
- Where the space stands changed: `update_progress` with the whole summary, at most 150 words. Start from the summary in your context and change only what changed. EVY turns away anything longer.

## Writing for EVY
- One plain fact per line: what changed, what was decided and why, what comes next.
- No account of the work itself, no restating the task, no headings or bold inside a line.
- Facts that are not EVY's (code, documents) belong in the project's own files.
