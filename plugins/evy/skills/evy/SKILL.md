---
name: evy
description: How to work with EVY, the person's planner, through its tools (the evy MCP server). Use when a session starts with EVY's context, when you pick up, finish or get stuck on an EVY task, when the person decides something, and before you end a session that changed something.
---

# Working with EVY

EVY holds the person's spaces (one per company or area of life), with their goals, initiatives, responsibilities and tasks. A folder on this Mac can belong to a space. In such a folder your session starts with that space's context: open tasks with their ids, the person's standing instruction, recent decisions and the progress summary. If it did not, call `get_context`.

## While you work
- Start an EVY task only when the person asks, or when it is queued for you. Call `claim_task` first, with the session id from your context, so no other session takes it.
- Finish it with `report`: the result for someone who saw nothing before, deliverables included. Status `blocked` when you cannot go on.
- Only the person can answer something: `ask`, one question, then stop.
- Work you spot outside your task: `propose` it, for the person to decide. `add_task` only when the person asks for a task, and for an agent only when they asked you to hand the work off.
- A task for an agent carries a `prompt` a fresh session can run from on its own (the task, the files or area, what done looks like) and a `done_when`.
- Splitting an EVY task off into its own session (Claude's desktop app can): only a task you have not claimed, since one you hold stays with you. Put the task id in that session's brief. The new session calls `claim_task` with its own session id (from its context, or a short name of its own when there is none) and reports the task itself; the session that started it does not.
- Never tick off the person's own tasks. Say what you did with `comment`.
- You may change only the space of the folder you work in. Read the others when asked.
- A folder that belongs to no space: ask the person which space, then `link_folder`.
- An image: `make_image` uses the person's own image key and gives you the command that saves it where EVY's file rules put the task's files (on Codex, use Codex's own image generation instead). Give it an `OUTPUT:` line in the report.
- The space's notes: when your context names a `Knowledge` folder (`~/Documents/<space>/Knowledge/`), the space's shared notes are Markdown files there. Search them (grep) before asking EVY or the person. They are a read-only copy: write notes in EVY, never in those files.

## Keeping EVY current
- The person decided something with you: `record_decision`, what and why, at most 40 words.
- Where the space stands changed: `update_progress` with the whole summary, at most 150 words. Start from the summary in your context and change only what changed. EVY turns away anything longer.

## Writing for EVY
- One plain fact per line: what changed, what was decided and why, what comes next.
- No account of the work itself, no restating the task, no headings or bold inside a line.
- Facts that are not EVY's (code, documents) belong in the project's own files.
