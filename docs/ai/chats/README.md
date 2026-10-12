# Chat exports

Exports of the AI conversations that produced the solution (requirement A1). Each export is referenced from its entry in `docs/ai/prompts.md`.

## Naming

`YYYY-MM-DD_<tool>_<stage>_<topic>.md`, for example `2026-10-11_cursor_pre-stage_analysis.md`. Screenshots go to `screenshots/` with the same prefix and a `.png` extension.

## How to export

| Tool | How |
|---|---|
| Cursor | Chat menu, then "Export Chat"; save the Markdown file here |
| Claude Code | Run `/export` in the session and save the file here |
| Codex CLI | Copy the session file from `~/.codex/sessions/` and convert it to Markdown |

## Before committing

- Remove tokens, keys and personal data.
- Keep the conversation complete; do not edit the agent's answers.
- Add the file path to the matching entry in `docs/ai/prompts.md`.
