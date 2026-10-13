# AGENTS.md

Single source of truth for AI agents working in this repository: Cursor, Claude Code and Codex.

- Detailed rules with examples: `docs/ai/guidelines/`.
- Cursor rules that summarize the guides: `.cursor/rules/`.
- Claude Code loads this file through `CLAUDE.md`; Codex and Cursor read it directly.
- Precedence when documents disagree: this file, then the guide, then the Cursor rule. Fix the lower document in the same change.
- The repository root is the workspace root (`Firebird-test/`); there is no nested project folder, and every tool picks these files up from here.

## Project

FirebirdPosts is a React Native test task: a list of posts, a details screen and favorites.

| ID    | Requirement                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| F1    | Posts screen lists `GET https://jsonplaceholder.typicode.com/posts`, each post enriched with a 32x32 Faker image |
| F2    | Details screen shows `GET /posts/{id}`, enriched with a 300x300 Faker image                                      |
| F3    | A toggle button on the details screen adds the post to favorites; the second press removes it                    |
| F4    | Favorite posts are visually highlighted and placed at the top of the list, ordered by ascending `id`             |
| F5    | The list is requested once and never refreshed; every Faker image is generated once                              |
| F6    | After a restart, data is restored without network requests and favorites are marked on the first frame           |
| T1–T5 | React Native CLI without Expo, TypeScript, Redux Toolkit, free design, separated UI, logic and state             |
| T6    | GitHub repository with README; `npm install` installs everything, `npm run` runs the app                         |
| A1–A2 | Built with AI agents only; chat exports in `docs/ai/chats/`, prompts in `docs/ai/prompts.md`, rules in this repo |

Status: stages 1 and 2 are done: the React Native template lives in the root, Jest is removed, quality gates are in place (compiler flags, aliases, ESLint, Steiger, `verify`, husky with lint-staged, pods in `postinstall`), and NativeWind 4 on theme tokens is the only styling method. The code of stages 3 and 4 is written: `shared`, `entities/post`, `features/toggle-favorite`, `widgets/posts-list`, both pages and `app`; F1–F6 are checked by hand on iOS and Android. The automated checks of stages 3 and 4 are enabled, see the table below. Stage 6 has started: the code is on GitHub at `https://github.com/MeyerPV/Test-task`, and `README.md` describes the project, setup, troubleshooting and the manual check of F1–F6. Remaining: stage 5 edge cases by hand, then chat exports with screenshots and a fresh-clone check.

Out of scope: automated tests, i18n (UI copy is English), dark mode, pull-to-refresh, request timeouts, automatic retries, image disk-cache libraries. Screen reader semantics are in scope, see `docs/ai/guidelines/accessibility.md`.

## Stack

- React Native 0.87.1 with React Native Community CLI 20.2.0, React 19.2.3, New Architecture and Hermes.
- TypeScript 6.0.x in strict mode. Not 7.x: typescript-eslint 8 supports TypeScript below 6.1.
- React Navigation 7 with `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`.
- Redux Toolkit 2, react-redux 9, redux-persist 6, react-native-mmkv 4 with react-native-nitro-modules.
- `@faker-js/faker` 10, imported from `@faker-js/faker/locale/en`.
- zod 4 for runtime validation of API responses and persisted state, imported as `import { z } from 'zod'`; `@babel/plugin-transform-export-namespace-from` lets Metro transform its `export * as` syntax.
- NativeWind 4.2 with Tailwind CSS 3.4, react-native-reanimated 4 and react-native-worklets as NativeWind peers, clsx 2 for conditional classes.
- Tooling: ESLint 8.57 with `@react-native/eslint-config`, eslint-plugin-tailwindcss 3.18, eslint-plugin-local-rules, Prettier 2.8, Steiger with `@feature-sliced/steiger-plugin`, husky 9, lint-staged.
- Node `^22.22.1 || ^24.3.0`, Xcode 26 with CocoaPods, JDK 17, Android SDK Platform 37 with Build-Tools 37.0.0 and NDK 27.1 (`compileSdk 37`, `targetSdk 36`, `minSdk 24`).

## Commands

| Command                           | What it does                                                                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm install`                     | Installs dependencies; `prepare` installs the husky hooks; `postinstall` runs `scripts/install-pods.mjs`: on macOS `bundle install` and `bundle exec pod install`, or a global `pod install` when Bundler is unavailable; skipped on CI and other OSes |
| `npm run pods`                    | Reinstalls pods with the same script, also on CI                                                                                                                                                                                                       |
| `npm run`                         | `scripts/run-app.mjs`: `npm run ios` on macOS, `npm run android` elsewhere; the second command of T6                                                                                                                                                   |
| `npm run ios` / `npm run android` | Builds and launches the app, starts Metro                                                                                                                                                                                                              |
| `npm start`                       | Starts Metro only                                                                                                                                                                                                                                      |
| `npm run verify`                  | `typecheck`, `lint`, `lint:fsd`, `format:check`, `check:deps`; must pass with zero warnings                                                                                                                                                            |
| `npm run typecheck`               | `tsc --noEmit`                                                                                                                                                                                                                                         |
| `npm run lint`                    | `eslint . --max-warnings=0`                                                                                                                                                                                                                            |
| `npm run lint:fsd`                | `steiger ./src --fail-on-warnings`                                                                                                                                                                                                                     |
| `npm run format:check`            | `prettier --check .`; `.prettierignore` skips vendored gems, Pods, build outputs, chat exports and `package-lock.json`                                                                                                                                 |
| `npm run check:deps`              | `node scripts/check-deps.mjs`: dependency allowlist, no Expo packages anywhere in `package-lock.json`                                                                                                                                                  |

There is no `test` script: automated tests are out of scope.

## Map of `src/`

Layers import strictly downward: `app` > `pages` > `widgets` > `features` > `entities` > `shared`. Full map with file purposes: `docs/ai/guidelines/architecture-fsd.md`.

```
src/
  app/          index.tsx entry; state/ (createPersistedStore, persist configs with validated rehydration, StoreProvider, global RootState types); navigation/ (RootNavigator)
  pages/        posts (PostsScreen), post-details (DetailsScreen): screens that wire navigation, widgets and features
  widgets/      posts-list: list order selector, PostsList with highlight and the "In favorites" badge
  features/     toggle-favorite: favorites slice and schema, selectors, FavoriteToggleButton
  entities/     post: DTO schemas, API calls, mapping, model schemas, posts slice, thunks with Faker images, selectors, PostCard, PostDetailsView
  shared/       api (httpClient with schema validation, errors), config (API_BASE_URL, routes), theme (tokens), lib (image-url, redux, storage), ui
```

## Immutable rules

1. **FSD imports flow downward only.** No imports from a higher layer or from a sibling slice of the same layer. Cross-slice imports go through the slice `index.ts` via aliases `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`; imports inside a slice are relative.
2. **Reuse `src/shared/ui`.** Text, buttons, images, loaders, badges and screens come from `@shared/ui`. If a primitive is missing, add a generic one to `src/shared/ui` first.
3. **No comments in code.** Names and small functions carry the intent. This includes TODOs and lint-disable directives.
4. **Strict TypeScript.** No `any`, no non-null assertion `!`, no `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck`, no `as` casts except `as const`.
5. **React Native CLI only, New Architecture only.** No `expo`, `expo-*` or `@expo/*` packages. Every native dependency supports the New Architecture and is on the allowlist in `scripts/check-deps.mjs`.
6. **Global state lives in Redux Toolkit.** Server data is requested once, guarded by a persisted flag, and persisted with redux-persist on MMKV. Restored slices pass a zod schema; invalid data is dropped and the slice starts empty. No other state or data-fetching libraries.
7. **Styles use NativeWind `className` with theme tokens.** `style` only for values computed at runtime, passed as a memoized variable. No inline style objects, no color literals, no arbitrary Tailwind values, no `StyleSheet`.
8. **Named exports only.** No `export default`, except tool configs that require it.
9. **Network only through `src/shared/api`.** No `fetch`, `XMLHttpRequest`, `WebSocket` or HTTP client imports anywhere else. `httpClient.get` takes a zod schema and returns only validated data.

## Rule traceability

| Rule                                 | Guide                                     | Cursor rule                                 | Automated check                                                                                                                                                                                                                                                                                                                                         | Stage                   |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1 FSD imports                        | `architecture-fsd.md`                     | `architecture-fsd.mdc`                      | Steiger `fsd/forbidden-imports`, `fsd/no-public-api-sidestep`, `fsd/public-api`, `fsd/segments-by-purpose`; ESLint `no-restricted-imports` for deep alias paths                                                                                                                                                                                         | 2 (Steiger), 3 (ESLint) |
| 2 Reuse shared/ui                    | `react-native.md`                         | `react-native.mdc`                          | ESLint `no-restricted-imports` of React Native visual primitives outside `src/shared/ui`                                                                                                                                                                                                                                                                | 4                       |
| 3 No comments                        | `code-style.md`                           | `code-style.mdc`                            | ESLint `local-rules/no-comments` with `noInlineConfig`, so a directive cannot switch it off                                                                                                                                                                                                                                                             | 3                       |
| 4 Strict TypeScript                  | `typescript.md`                           | `typescript.mdc`                            | `tsc --noEmit`; ESLint `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`, `ban-ts-comment`, `consistent-type-imports` (stage 2); typed linting with `consistent-type-assertions`, `consistent-type-definitions`, `no-unsafe-*` (stage 3)                                                                                                    | 2, 3                    |
| 5 RN CLI, New Architecture           | `react-native.md`                         | `react-native.mdc`                          | `scripts/check-deps.mjs` (allowlist, no Expo); New Architecture support reviewed when a package joins the allowlist                                                                                                                                                                                                                                     | 3                       |
| 6 Redux Toolkit, fetch once, persist | `state-management.md`, `data-fetching.md` | `state-management.mdc`, `data-fetching.mdc` | ESLint `no-restricted-imports` (other state and query libraries, raw react-redux hooks, MMKV outside storage, zod outside `api`, `model` and `app/state`); `check-deps`; manual network check in the Definition of Done                                                                                                                                 | 3                       |
| 7 NativeWind on tokens               | `styling.md`                              | `styling.mdc`                               | `react-native/no-inline-styles`, `react-native/no-color-literals`, eslint-plugin-tailwindcss `no-custom-classname`, `no-arbitrary-value`, `no-contradicting-classname`, `classnames-order` (stage 2); `no-restricted-syntax` for literal `style` values, color strings and interpolated class names; `no-restricted-imports` for `StyleSheet` (stage 4) | 2, 4                    |
| 8 Named exports                      | `code-style.md`                           | `code-style.mdc`                            | ESLint `no-restricted-syntax` for `ExportDefaultDeclaration`, `default` specifiers and `export *`                                                                                                                                                                                                                                                       | 3                       |
| 9 Network via shared/api             | `data-fetching.md`                        | `data-fetching.mdc`                         | ESLint `no-restricted-globals` and `no-restricted-properties` (`globalThis.fetch`) for `fetch`, `XMLHttpRequest`, `WebSocket` outside `src/shared/api`; `no-restricted-imports` for HTTP clients; `tsc` for the schema argument of `httpClient.get`                                                                                                     | 3                       |

Supporting guides without an immutable rule of their own: `workflow.md` (`project-core.mdc`), `accessibility.md`, `performance.md`, `navigation.md`, `git.md`.

## Definition of Done

A change is done when all of the following hold:

1. `npm run verify` passes with zero errors and zero warnings.
2. `npm run ios` and `npm run android` launch the app on the iPhone 17 simulator and the `Medium_Phone_API_36.1` emulator.
3. The affected requirements are checked by hand. For data changes: one `GET /posts` on the first launch and zero requests after a restart in the React Native DevTools Network panel, with identical image URLs.
4. No dependency was added outside the allowlist; a new dependency comes with its allowlist entry and a compatibility note in `react-native.md`.
5. Docs are updated in the same change when a rule, structure or command changes.
6. The prompt is logged in `docs/ai/prompts.md` and the chat export saved in `docs/ai/chats/`.
7. The commit follows `docs/ai/guidelines/git.md`; hooks are never skipped.

## Working agreement

- Read the guide for the area before editing it. The workflow is in `docs/ai/guidelines/workflow.md`.
- Ask before adding a dependency, changing a rule, or touching anything outside the repository root.
- Commit or push only when the user asks.
