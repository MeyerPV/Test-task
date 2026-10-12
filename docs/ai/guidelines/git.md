# Git

## Rules

1. **The repository root is the workspace root `Firebird-test/`**, with no nested project folder. The task PDF lives in the root and is not committed. Checked by the `*.pdf` entry in `.gitignore`.
2. **History is linear on `main`.** Each stage lands as one or more focused commits; short-lived branches `stage-<n>-<topic>` are optional and merged by fast-forward. Checked by review.
3. **Conventional Commits in English:** `type(scope): summary`.

   - Types: `feat`, `fix`, `refactor`, `perf`, `build`, `chore`, `docs`.
   - Scope: an FSD slice or area, such as `entities/post`, `app/state`, `tooling` or `ai`.
   - Summary: imperative, at most 72 characters.
   - The body explains why and cites requirement IDs (`F5`) and the stage.

   Checked by review.

4. **One logical change per commit.** Code, docs and prompt-log updates for that change go together. Checked by review.
5. **Hooks are never skipped.** `pre-commit` runs lint-staged, which runs ESLint with `--max-warnings=0` on staged `.js`, `.jsx`, `.mjs`, `.ts` and `.tsx` files, and then `npm run typecheck` on the whole project. `pre-push` runs `npm run verify`. No `--no-verify`, no `HUSKY=0` for commits. Checked by husky.
6. **Lockfiles are committed:** `package-lock.json`, `Gemfile.lock`, `ios/Podfile.lock`. Checked by review.
7. **Ignored:** `node_modules/`, `ios/Pods/`, `ios/build/`, `android/build/`, `android/app/build/`, `android/.gradle/`, `.env*`, `*.log`, `*.pdf`. Checked by `.gitignore`.
8. **AI artifacts are committed:** `docs/ai/prompts.md` entries and chat exports in `docs/ai/chats/`, with the work they describe or in a `docs(ai)` commit. Checked by review.
9. **Agents commit and push only when the user asks.** No force-push to `main`, no rewriting pushed history, no secrets in commits. Checked by review.
10. **GitHub:** a public repository with README; push over HTTPS after `gh auth login` or over SSH. Checked at stage 6.

## Examples

### Do

```text
feat(entities/post): fetch posts once and persist them

fetchPosts skips when persisted ids exist, so a restart makes no
request and keeps the generated image URLs (F5, F6). Stage 3.
```

```text
docs(ai): log stage 3 prompts and chat export
```

### Don't

```text
update stuff
WIP fixes
feat: Added favorites, fixed list, refactored store and bumped deps
```

## Checked by

- husky `pre-commit` (lint-staged, `npm run typecheck`) and `pre-push` (`npm run verify`). Installed in stage 2; the hooks live in `.husky/`, the lint-staged config in `package.json`.
- Commit messages, scope and history by review.
