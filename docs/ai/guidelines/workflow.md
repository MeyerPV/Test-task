# Workflow

How an agent moves from a prompt to a finished change. Applies to Cursor, Claude Code and Codex alike.

## Sources of truth

1. `AGENTS.md`: project, stack, commands, immutable rules, Definition of Done.
2. `docs/ai/guidelines/*.md`: detailed rules, examples, the tool that checks each rule.
3. `.cursor/rules/*.mdc`: short summaries that point to the guides.

When they disagree, `AGENTS.md` wins. Fix the lower document in the same change.

## Agent loop

1. Read `AGENTS.md` and the guide for every area the task touches.
2. Restate the task with the requirement IDs it affects (F1–F6, T1–T6, A1–A2).
3. Plan the smallest change that satisfies them. Ask before adding a dependency or changing a rule.
4. Implement bottom-up through the layers: `shared`, `entities`, `features`, `widgets`, `pages`, `app`.
5. Run `npm run verify` and fix every finding at the source. Suppressions are not allowed.
6. When UI or native code changed, run `npm run ios` and `npm run android`.
7. Log the prompt in `docs/ai/prompts.md` and save the chat export in `docs/ai/chats/`.
8. Commit only when the user asks, following `git.md`.

### Do

```sh
npm run verify
npm run ios
npm run android
```

### Don't

```sh
git commit --no-verify -m "wip"
npx eslint . --fix --rule "no-restricted-imports: off"
```

## Stages

| Stage | Scope                                                                                                         | Done when                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 0     | Environment: `JAVA_HOME` on JDK 17, port 8081 free or Metro on another port, `gh auth login`                  | `npx react-native doctor` reports no required issues                                   |
| 1     | Initialize React Native 0.87.1, remove Jest scaffolding                                                       | Template app runs on iOS and Android                                                   |
| 2     | Aliases, empty FSD folders with `index.ts`, NativeWind and tokens, tool installation, `verify`, `postinstall` | `npm run verify` passes on the skeleton                                                |
| 3     | Data layer: `shared/api`, `shared/lib`, `entities/post`, `features/toggle-favorite` model, `app/state`        | Stage 3 checks enabled and green; one `GET /posts` on first launch, zero after restart |
| 4     | UI: `shared/ui`, widgets, `FavoriteToggleButton`, pages, `app/navigation`                                     | Stage 4 checks enabled and green; F1–F4 on both platforms                              |
| 5     | Edge cases: offline first launch, offline restart, unopened details offline                                   | F5 and F6 confirmed by hand                                                            |
| 6     | README, A1 and A2 artifacts, fresh-clone check, GitHub push                                                   | Fresh clone passes `npm install` and `npm run`                                         |

### Stage 1 note

The project lives directly in the repository root `Firebird-test/`, with no nested `FirebirdPosts/` folder. The root already holds the task PDF and the agent infrastructure, so the CLI must not generate into it. Initialize into a temporary directory, then copy the generated files into the root:

- do not overwrite `AGENTS.md`, `CLAUDE.md`, `docs/` and `.cursor/`;
- do not copy the temporary `.git`;
- initialize git in the root.

```sh
npx @react-native-community/cli@20.2.0 init FirebirdPosts --version 0.87.1 --pm npm --skip-install --install-pods false --skip-git-init --package-name com.firebird.posts --directory /tmp/firebird-init
rsync -a --ignore-existing --exclude .git /tmp/firebird-init/ ./
git init
npm install
```

`FirebirdPosts` remains the app name in `app.json`, Xcode and Gradle; only the folder nesting is dropped.

After the copy:

- `package.json` `name` is set to `firebird-posts`: the CLI writes the `--package-name` value there.
- `__tests__/`, `jest.config.js`, the `test` script and the Jest packages are removed. `tsconfig.json` sets `types: []` because the base config lists `jest`.
- `App.tsx` moves to `src/app/index.tsx` as a named export `App`, and `index.js` imports it from `./src/app`.

### Stages 3 and 4 note

The code of stages 3 and 4 came in prompts P-07 to P-10, one layer per prompt, each done when `npm run verify` passed. The automated checks of both stages were enabled afterwards in P-11, and the existing code passed them without changes. Every new rule was probed with a violating file in each affected folder and fired; the probes were deleted.

One check stays manual: eslint-plugin-tailwindcss does not see strings inside class maps, so the final recheck of a UI change validates every class string in `src` against `tailwind.config.js`.

## Automated checks roadmap

Stage 2 enables every check that already holds on the template. Rules that govern project code are switched on when that code appears.

Stage 2, on the template (enabled):

- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `types: []` (`["nativewind/types"]` since P-06), `paths` for `@app/*`, `@pages/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`.
- `babel.config.js`: `babel-plugin-module-resolver` with the same six aliases.
- ESLint `@react-native` with `--max-warnings=0`, plus errors: `no-console`, `react-native/no-inline-styles`, `react-native/no-color-literals`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-non-null-assertion`, `@typescript-eslint/consistent-type-imports`, `@typescript-eslint/ban-ts-comment` (`ts-ignore`, `ts-expect-error`, `ts-nocheck`).
- Steiger with `configs.recommended` and `--fail-on-warnings`; `fsd/insignificant-slice` off since the first widget, see `architecture-fsd.md`.
- eslint-plugin-tailwindcss 3.18 as errors: `no-custom-classname`, `no-arbitrary-value`, `no-contradicting-classname`, `classnames-order`. Added with NativeWind in P-06.
- `react-hooks/exhaustive-deps` (error) and `react/no-unstable-nested-components` (warning, fails under `--max-warnings=0`) from `@react-native/eslint-config`.
- husky: `pre-commit` runs lint-staged (ESLint on staged files) and `npm run typecheck`; `pre-push` runs `npm run verify`.
- `postinstall` and `npm run pods` through `scripts/install-pods.mjs`.

Stage 3, data layer (enabled in P-11):

- ESLint typed linting (`parserOptions.project`): `consistent-type-assertions` with `assertionStyle: 'never'`, `consistent-type-definitions` with an override for `src/shared/config/routes.ts`, `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unsafe-call`, `no-unsafe-return`, `no-unsafe-argument`.
- ESLint `local-rules/no-comments` from `eslint-local-rules.js` through eslint-plugin-local-rules, with `noInlineConfig: true`.
- ESLint `no-restricted-syntax` for default exports, `default` specifiers and `export *` in every file, and for top-level `configureStore` and `persistStore` calls in `src`.
- ESLint `no-restricted-globals` and `no-restricted-properties` for `fetch`, `XMLHttpRequest` and `WebSocket` outside `src/shared/api`.
- ESLint `no-restricted-imports` in `src` for: deep alias paths, other state and query libraries and AsyncStorage, HTTP clients, raw `useDispatch`, `useSelector` and `useStore` outside `src/shared/lib/redux`, `react-native-mmkv` outside `src/shared/lib/storage`, `@faker-js/faker` everywhere and its subpaths except `locale/en` in `src/shared/lib/image-url`, `@shared/lib/image-url` outside `src/entities/post/model/thunks.ts`.
- `scripts/check-deps.mjs`: dependency allowlist, empty `peerDependencies`, `optionalDependencies` and `bundleDependencies`, no Expo packages in `package-lock.json`.
- `.prettierignore`, then `format:check` and `check:deps` join `verify`.
- ESLint `no-restricted-imports` for `zod` outside `src/shared/api`, the `api` and `model` segments and `src/app/state`, and for every `zod/*` entry. Added with zod in P-12.

Stage 4, UI (enabled in P-11):

- ESLint `no-restricted-syntax` in `src` for object and array literals in `style` and `*Style` props, hex, `rgb()` and `hsl()` color strings outside `src/shared/theme/tokens.ts`, and template literals in `className`, `*ClassName` and `clsx` arguments.
- ESLint `no-restricted-imports` for `StyleSheet` and `SafeAreaView` everywhere, React Native visual primitives outside `src/shared/ui`, `StatusBar` outside `src/app/index.tsx`.
- ESLint `no-restricted-imports` for `@react-navigation/*` outside `src/app/navigation`, `src/pages` and `src/shared/config`.
- `react/no-unstable-nested-components` as an error in `src`.

Rules that stay manual: fetch-once behavior at runtime, the corrupted-storage check below, visual check of F1–F4, a screen reader pass, class strings inside class maps, New Architecture review of a new native package.

## Quality gate notes

No rule is disabled or downgraded. Configuration choices that are not obvious from the files:

- `@typescript-eslint/*` rules live in the `*.ts`, `*.tsx` override of `.eslintrc.js`, because `@react-native/eslint-config` loads the plugin only there. At the top level they fail on `.js` files with "Definition for rule was not found".
- `*.mjs` has its own override; without it `eslint .` skips `scripts/` and `steiger.config.mjs`. Scripts print through `process.stdout` and `process.stderr`, so `no-console` holds for them too.
- `src/` must exist. With a missing path Steiger opens an interactive "did you mean" prompt and crashes without a TTY. `src/app/index.tsx` is always present.
- The Steiger config is `steiger.config.mjs`. A `.ts` config makes Node print `MODULE_TYPELESS_PACKAGE_JSON` because `package.json` has no `type`, cosmiconfig has no `.mts` search place, and `"type": "module"` would break the CommonJS configs.
- `tsconfig.json` uses `paths` without `baseUrl`, which TypeScript 6 deprecates.
- `prepare: husky` exits with code 0 when `.git` is missing or `HUSKY=0` is set, so `npm install` from an archive still succeeds.
- Bundler installs gems into `vendor/bundle`, so `vendor/` is ignored by ESLint and excluded in `tsconfig.json`. Prettier 2.8 does not read `.gitignore`, so `.prettierignore` lists `vendor/`, `ios/Pods/`, the iOS and Android build outputs including `android/app/.cxx/`, Xcode asset catalogs (Xcode rewrites their JSON), `docs/ai/chats/` (exports stay as exported) and `package-lock.json` (npm owns its format).
- `noInlineConfig: true` makes ESLint ignore `eslint-disable` and other directive comments, so `local-rules/no-comments` cannot be switched off from inside a file. The `eslint-comments` plugin from the preset still reports such a directive as unused; `no-comments` reports it as a comment.
- `no-restricted-imports` in ESLint 8 keeps one `paths` entry per module name, a second `react-native` entry would replace the first. `createRestrictedImports` in `.eslintrc.js` therefore builds one `react-native` entry per folder group, and the folder exceptions are generated from `IMPORT_EXCEPTIONS`. The exception globs do not overlap, because a later override replaces the whole rule option. Where a file needs two exceptions, it gets one entry with both, and the broader entry skips it through `excludedFiles`: `src/entities/post/model/thunks.ts` allows `@shared/lib/image-url` and `zod`, and the zod entry for `model` segments excludes it.
- `.gitignore`-style patterns cannot re-include a path under an excluded parent, so `src/shared/lib/image-url` allows `@faker-js/faker/locale/en` through the chain `@faker-js/faker/*`, `!@faker-js/faker/locale`, `@faker-js/faker/locale/*`, `!@faker-js/faker/locale/en`.
- Typed linting needs every linted `.ts` and `.tsx` file in `tsconfig.json`; its `include` covers `**/*.ts` and `**/*.tsx`.
- ESLint 8 ignores dotfiles except `.eslintrc.*`. `eslint .` skips them silently, but lint-staged passes a staged dotfile explicitly, and the "File ignored by default" warning fails `--max-warnings=0`. Every JS dotfile config is therefore re-included in `ignorePatterns`, as `!.prettierrc.js` is.
- The pods script falls back to the global `pod install` only when Bundler is unavailable: `bundle` is missing or `bundle install` fails. A failing `bundle exec pod install`, such as a network error while downloading the React Native prebuilt core from Maven Central, fails `npm install` instead of being retried; run `npm run pods` again. CI is detected by `CI=true` or `CI=1`; `npm run pods` passes `--force` to ignore it.

## Native build notes

- `npm install <package>` does not run `postinstall`. After adding a native dependency run `npm run pods`, then rebuild.
- Changes in `tailwind.config.js`, `src/shared/theme/tokens.ts`, `global.css` or `babel.config.js` need `npm start -- --reset-cache`.
- zod publishes ES modules with `export * as ns from`, which `@react-native/babel-preset` does not transform. Without `@babel/plugin-transform-export-namespace-from` in `babel.config.js` Metro fails with "Export namespace should be first transformed", and on iOS the dev RedBox that shows this error can crash the app with `SIGABRT`.
- React Native 0.87 ships a prebuilt core and Hermes per flavor. A Release build swaps `ios/Pods/React-Core-prebuilt/React.xcframework` and `ios/Pods/hermes-engine` to Release and records the flavor in `.last_build_configuration` in both folders. `pod install` deletes the markers but keeps the frameworks, and the next Debug build assumes Debug: linking fails on `facebook::react::Sealable` symbols, or the app crashes in dyld on `CDPDebugAPI`. Fix: write `Release` into both markers and build Debug again; the build phases swap the frameworks back.

  ```sh
  printf Release > ios/Pods/React-Core-prebuilt/.last_build_configuration
  printf Release > ios/Pods/hermes-engine/.last_build_configuration
  npm run ios
  ```

- Metro on another port when 8081 is taken: `npm start -- --port 8082`. Android follows `npm run android -- --port 8082` through `adb reverse`. The prebuilt iOS core keeps 8081, so the simulator gets a per-app default, removed with `defaults delete` when it is no longer needed:

  ```sh
  xcrun simctl spawn booted defaults write com.firebird.posts RCT_jsLocation -string "localhost:8082"
  ```

- `networkTimeout` in `android/gradle/wrapper/gradle-wrapper.properties` is 120000 ms. The template's 10000 aborts the first download of the Gradle distribution on a slow network. `./gradlew wrapper` regenerates the file on a Gradle upgrade and resets the value, so set it again afterwards.
- An agent sandbox may set its own `GRADLE_USER_HOME`, which downloads the Gradle distribution and dependencies again. Run Android builds with `GRADLE_USER_HOME=$HOME/.gradle` and `JAVA_HOME` on JDK 17.
- The Definition of Done network check uses the React Native DevTools Network panel. An agent can read the same data through Metro's inspector: `GET /json/list` lists the targets, and the WebSocket needs an `Origin` header with the Metro URL, otherwise Metro answers 401.
- Corrupted-storage check after a change to a schema or a persist config: through the inspector, write an `http://` thumbnail into `persist:posts` and duplicate ids into `persist:favorites` of the MMKV instance `firebird-posts`, then reload. Expected: one `GET /posts`, new image URLs, empty favorites; the next reload sends nothing.

## Tool notes

- Cursor: reads `AGENTS.md` and `.cursor/rules/*.mdc`; `project-core.mdc` is always applied, the others attach by glob.
- Cursor and VS Code must type-check with the workspace TypeScript 6.0.x. `.vscode/settings.json` sets `typescript.tsdk` to `node_modules/typescript/lib` and asks to switch; accept it, or run "TypeScript: Select TypeScript Version" and pick "Use Workspace Version". An older editor TypeScript, such as the 2023 "JavaScript and TypeScript Nightly" extension with 5.3, rejects `es2024.promise` in `@react-native/typescript-config` and reports false errors, for example `barStyle` missing on `StatusBar`.
- Claude Code: `CLAUDE.md` imports `AGENTS.md`; open the guides on demand.
- Codex: reads `AGENTS.md` from the repository root.

## Checked by

- `npm run verify` locally and in the husky `pre-push` hook; lint-staged and `npm run typecheck` in `pre-commit`.
- The Definition of Done in `AGENTS.md` for the manual part.
