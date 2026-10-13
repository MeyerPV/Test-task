# Prompt log

Every prompt that produced part of the solution, grouped by stage (requirement A2). Prompts are kept verbatim in the language they were written in. Chat exports live in `docs/ai/chats/`.

This log is a historical record, not a source of rules. Later prompts override earlier ones, and each entry's outcome says what was superseded. The current rules are in `AGENTS.md` and `docs/ai/guidelines/`.

## Entry format

```text
### P-<number>. <short title>
- Date: YYYY-MM-DD
- Stage: <pre-stage name or 0-6>
- Tool and model: <Cursor, Claude Code or Codex> / <model>
- Chat export: docs/ai/chats/<file>
- Prompt: verbatim block below
- Outcome: what changed, which requirement IDs it covers
```

## Pre-stage: analysis

### P-01. Analyze the task and check the environment

- Date: 2026-10-11
- Stage: pre-stage, analysis
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome: requirement checklist F1–F6, T1–T6, A1–A2; interpretations of the ambiguities; read-only environment audit (Node 22.23.3, Xcode 26.2, CocoaPods 1.16.2, Ruby 4.0.1, JDK 17, Android SDK 36, NDK 27.1); gaps: Android cmdline-tools, `JAVA_HOME`, `gh` authentication, port 8081 busy.

```text
@[React-Native] Test task (1).pdf

Ты senior React Native разработчик. Разбери тестовое задание, файлы не меняй.

1. Выпиши требования чек-листом с идентификаторами: F1–F6 функциональные, T1–T6 технические, A1–A2 требования AI-only подхода.
2. Перечисли неоднозначности и предложи трактовку каждой: что значит «картинка добавляется один раз», должен ли список открываться офлайн после перезапуска, где хранить сгенерированные URL, как вести себя при ошибке сети на первом запуске.
3. Проверь окружение только командами чтения: Node, npm, Xcode, CocoaPods, Ruby, JDK, Android SDK, NDK, доступные симуляторы и эмуляторы. Отдельно перечисли, чего не хватает.

Ответ дай таблицами, без вступления.
```

## Pre-stage: planning

### P-02. Implementation plan

- Date: 2026-10-11
- Stage: pre-stage, planning
- Tool and model: Cursor Agent, Plan mode / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome: plan with the FSD tree, data flow, library compatibility for React Native 0.87.1, quality gates, stages and risks. Decisions from the follow-up questions: Redux Toolkit with redux-persist, MMKV storage, favorites ordered by ascending id.
- Superseded by P-03: plan item 4 and its lint plugin were dropped; the `app` segments and the location of the favorites slice were corrected.

```text
@[React-Native] Test task (1).pdf

Составь план реализации тестового задания. Код не пиши. План не пиши, пока я не отвечу на вопросы ниже.

Принятые решения:
- React Native CLI последней стабильной версии (New Architecture, Hermes), без Expo и без пакетов Expo SDK, TypeScript strict.
- React Navigation 7, native-stack, типизированные параметры маршрутов.
- @faker-js/faker: картинки через faker.image.urlPicsumPhotos, 32x32 для списка и 300x300 для деталей. URL детерминированный, генерируется в слое данных один раз и сохраняется вместе с постом.
- Стили через NativeWind 4: Tailwind-классы только на токенах темы.
- Feature-Sliced Design: app > pages > widgets > features > entities > shared, межслайсовые импорты только через index.ts, алиасы @app ... @shared. Слой widgets обязателен.
- Автотесты не пишутся. Проверка: TypeScript, ESLint, Steiger и запуск приложения.

Уточнения к разбору задания, их не переспрашивай:
- У каждого поста две независимые картинки. Картинка 300x300 создаётся при первом успешном запросе GET /posts/{id}. Повторное открытие берёт данные из стора.
- Отдельная библиотека дискового кэша картинок не нужна, в том числе @d11/react-native-fast-image. Для F5 и F6 достаточно сохранённого URL.
- Неудачный первый запрос не считается единственным запросом из F5: на экране ошибка с кнопкой «Повторить», в хранилище ничего не пишется. После успеха список больше не обновляется. Не добавляй таймаут запроса, автоповтор через NetInfo и pull-to-refresh.
- Избранное хранится отдельным срезом, сущность post о нём не знает.
- Установка одной командой npm install: CocoaPods ставится в postinstall. Вторая команда npm run ios или npm run android. Отдельный npm run setup и npm ci не используй.

До плана спроси меня и в каждом вопросе дай рекомендованный вариант с причиной:
1. State manager под F5 и F6: Redux Toolkit с redux-persist, Zustand или MobX. Рекомендация: Redux Toolkit с redux-persist. RTK Query и TanStack Query не предлагай как кандидатов: у них семантика перезапросов.
2. Хранилище: react-native-mmkv или AsyncStorage. Рекомендация: MMKV. Если выбран redux-persist, список не рисуется до конца регидрации через PersistGate: чтение redux-persist асинхронное, поэтому синхронный MMKV сам по себе не убирает мигание избранного на первом кадре.
3. Порядок избранного в списке: по возрастанию id, как на рисунке задания, или в порядке добавления, последний добавленный сверху. Рекомендация: по возрастанию id, остальные посты остаются в исходном порядке.

В плане покажи:
1. Дерево src/ по слоям FSD, включая widgets, с назначением каждого файла.
2. Поток данных: где генерируется картинка, чем гарантирован однократный запрос (в том числе после перезапуска), какие поля персистятся, а какие нет, как выбранное хранилище закрывает первый кадр без мигания избранного, как избранное поднимает пост наверх.
3. Почему RTK Query и TanStack Query не подходят при требовании «никогда не обновлять».
4. Доступность: роли, подписи, состояния, анонсы для VoiceOver и TalkBack. Выделение избранного дублируется текстом и accessibilityState, а не только цветом.
5. Quality gates: ESLint с a11y-плагином и контролем Tailwind-классов, Steiger, husky, единая команда npm run verify. Тестов в ней нет.
6. Совместимость каждой библиотеки с выбранной версией React Native: peerDependencies, New Architecture, отсутствие Expo-зависимостей.
7. Этапы с критериями готовности и риски: нативная сборка, загрузка артефактов по медленной сети.
8. Как выполняется T6: npm install, затем npm run ios или npm run android.
```

## Pre-stage: agent infrastructure

### P-03. Shared rules for Cursor, Claude Code and Codex

- Date: 2026-10-11
- Stage: pre-stage, agent infrastructure
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome: `AGENTS.md`, `CLAUDE.md`, eleven guides in `docs/ai/guidelines/`, Cursor rules in `.cursor/rules/`, this log and `docs/ai/chats/`. Plan corrections recorded in the guides: no assistive-technology scope, `app/state` and `app/navigation` segments, favorites only in `features/toggle-favorite`, `fsd/insignificant-slice` off as a conscious exception, `fetch` with `unknown` and type guards, data-only whitelist with `timeout: 0`, store created inside the provider.

```text
До кода подготовь инфраструктуру для AI-агентов, чтобы Cursor, Claude Code и Codex следовали одним правилам. Язык документов английский. План бери за основу, но перечисленные ниже места в нём ошибочны: в правила записывай исправление, а не формулировку плана.

1. AGENTS.md в корне: проект, стек, команды, карта src/, Definition of Done и неизменяемые правила:
   FSD-импорты сверху вниз; переиспользование src/shared/ui; без комментариев в коде; strict TypeScript без any, ! и @ts-ignore; только React Native CLI и библиотеки с поддержкой New Architecture; глобальное состояние в Redux Toolkit, серверные данные запрашиваются один раз и персистятся; стили через className NativeWind на токенах темы, style только для значений из рантайма, без inline-объектов, цветовых литералов и произвольных значений Tailwind; только именованные экспорты; сеть только через src/shared/api.
2. CLAUDE.md с одной строкой @AGENTS.md.
3. docs/ai/guidelines/: workflow, architecture-fsd, typescript, react-native, performance, state-management, data-fetching, navigation, styling (NativeWind), code-style, git. Гайды accessibility и testing не создавай. В каждом гайде конкретные правила, короткие примеры «так / не так» и указание, каким инструментом правило проверяется.
4. .cursor/rules/*.mdc: project-core с alwaysApply и правила с globs под каждую область. Каждое правило короче 40 строк и ссылается на свой гайд через @docs/ai/guidelines/<file>.md. accessibility.mdc не создавай.
5. docs/ai/prompts.md как журнал промптов по этапам и docs/ai/chats/ для выгрузок.

Исправления плана, которые обязаны попасть в гайды:

- Скринридер не поддерживаем. Не описывай VoiceOver, TalkBack, accessibilityRole, accessibilityLabel, accessibilityState, accessibilityHint, announceForAccessibility и live region. Не создавай shared/lib/a11y. Не подключай eslint-plugin-react-native-a11y, хотя план его перечисляет. Видимые подписи кнопок и бейдж «In favorites» остаются.
- Сегменты app/providers и app/store из плана запрещены Steiger (segments-by-purpose). В architecture-fsd.md карта такая: app/state (store, persistor, StoreProvider) и app/navigation. Слайс избранного не клади в entities/favorite: его нет. Слайс, селекторы и кнопка живут только в features/toggle-favorite. Сущность post про избранное не знает. Бейдж рисует виджет posts-list.
- fsd/insignificant-slice выключен: виджет с одним потребителем оставлен, чтобы страницы оставались тонкими. Это записано в гайде как сознательное исключение.
- data-fetching.md: транспорт внутри httpClient — глобальный fetch, не axios. Ответ приходит как unknown и проверяется type guard до использования. Однократность запроса — condition по флагу из плана (isListLoaded, detailsById). Картинка создаётся один раз внутри thunk.
- state-management.md: persistReducer с whitelist только на данные, timeout: 0, чтобы пустой стор не успел запросить сеть до REHYDRATE. Store создаётся внутри провайдера, не на уровне модуля.

Готово, когда каждое правило из AGENTS.md имеет гайд, .mdc и, где возможно, автоматическую проверку, запланированную на этапы 3 и 4, а в документах нет ни одного требования про скринридер.
```

### P-04. Drop the nested project folder

- Date: 2026-10-11
- Stage: pre-stage, agent infrastructure
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome: agent files moved from `FirebirdPosts/` to the repository root `Firebird-test/`, nested folder removed. Docs updated: the repository root is the workspace root, the task PDF is ignored by `*.pdf`, stage 1 copies the CLI output into the root without the temporary `.git`.

```text
не создавай папку FirebirdPosts в текущей папке Firebird-test будем создавать сам проект вложенность FirebirdPosts лишняя
```

## Stage 0: environment

No entries yet.

## Stage 1: initialization

Initialization was done within P-05: the prompt assumed the template was already in the root, it was not, and the user chose to initialize it per the stage 1 note.

## Stage 2: skeleton and tooling

### P-05. Quality gates on the template

- Date: 2026-10-11
- Stage: 1 and 2
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Clarification: the root held no React Native project. Asked how to proceed; answer: initialize RN 0.87.1 through a temporary directory per the stage 1 note in `workflow.md`, no nested folder.
- Outcome:
  - Template initialized with CLI 20.2.0 and copied into the root; `git init`; `package.json` name fixed to `firebird-posts`.
  - Jest removed: `__tests__/`, `jest.config.js`, `test` script and Jest packages. `App.tsx` moved to `src/app/index.tsx` because Steiger needs `src/`.
  - `tsconfig.json` with all seven requested flags and `types: []`; aliases in `tsconfig.json` and `babel-plugin-module-resolver`.
  - `.eslintrc.js` on `@react-native` with the seven requested rules as errors; no a11y plugin. `steiger.config.mjs` with `configs.recommended`.
  - Scripts `typecheck`, `lint`, `lint:fsd`, `verify` (zero warnings), `pods`, `postinstall`, `prepare`.
  - husky `pre-commit` (lint-staged ESLint, then typecheck) and `pre-push` (`verify`).
  - `scripts/install-pods.mjs`, `.nvmrc` 22, `engines` `^22.22.1 || ^24.3.0`.
  - Every rule was probed with a violating file and fired. No rule was disabled.
  - `npm install` installed the pods. `npm run verify` passes. Debug and Release builds succeed for the iPhone 17 simulator on iOS 26.2, and the Release build launches the template screen.
  - Docs updated: `AGENTS.md` commands and status, `workflow.md` roadmap and quality gate notes, `typescript.md`, `code-style.md`, `git.md`, `architecture-fsd.md`, `styling.md`, `performance.md` and the matching Cursor rules. Requirements: T1, T2, T6.

```text
@AGENTS.md @docs/ai/guidelines/workflow.md @docs/ai/guidelines/code-style.md

Проект React Native CLI уже лежит в корне этого репозитория. Не запускай init и не создавай вложенную папку FirebirdPosts: имя приложения внутри ios и android остаётся FirebirdPosts, а файлы проекта живут в корне. Настрой quality gates здесь же.

1. TypeScript: strict, noUncheckedIndexedAccess, noImplicitReturns, noImplicitOverride, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters. Алиасы @app, @pages, @widgets, @features, @entities, @shared в tsconfig и babel-plugin-module-resolver.
2. ESLint: @react-native. Ошибками сделай no-console, react-native/no-inline-styles, react-native/no-color-literals, @typescript-eslint/no-explicit-any, no-non-null-assertion, consistent-type-imports, ban-ts-comment. Плагин eslint-plugin-react-native-a11y не ставь.
3. Steiger с рекомендованным конфигом FSD.
4. Скрипты typecheck, lint, lint:fsd и verify, который запускает всё с нулём предупреждений. Шаблон CLI приносит Jest и пример теста: удали их вместе с jest.config.js и скриптом test. В verify тестов нет.
5. husky и lint-staged: ESLint по изменённым файлам и typecheck перед коммитом.
6. postinstall: на macOS bundle exec pod install, а если Bundler недоступен, глобальный pod install; на CI и других ОС пропуск. Так T6 выполняется командой npm install. Отдельный скрипт pods для повторной установки.
7. .nvmrc и engines под версию Node шаблона.

Ограничения: зависимости ставятся только через npm, без ручного скачивания артефактов. Если правило линтера даёт ложные срабатывания, не отключай его молча: опиши причину в гайде.

Готово, когда npm run verify проходит на шаблоне и шаблон собирается на iOS-симуляторе.
```

P-06 to P-10 arrived in one message. Its first line applies to all five and is kept in the P-06 block. Each prompt was done in order, with `npm run verify` green before the next one started.

### P-06. NativeWind 4 as the only styling method

- Date: 2026-10-11
- Stage: 2
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - Peers checked, then installed: `nativewind` 4.2.7 (`react-native-css-interop` 0.2.7 needs `tailwindcss ~3` and `react-native-reanimated >= 3.6.2`), `tailwindcss` 3.4.19, `react-native-reanimated` 4.7.1 (peer `react-native 0.86 - 0.88`), `react-native-worklets` 0.13.0, `clsx` 2.1.1, `eslint-plugin-tailwindcss` 3.18.3.
  - `babel.config.js` with `nativewind/babel` and `module-resolver`. `metro.config.js` with `withNativeWind(config, { input: './global.css', disableTypeScriptGeneration: true })`. `global.css` imported in `src/app/index.tsx`, and `global.d.css.ts` declares it because TypeScript 6 checks side-effect imports.
  - `tailwind.config.js` loads `src/shared/theme/tokens.ts` through Tailwind's jiti fallback and replaces the default scales. `className` types come from `types: ["nativewind/types"]`, with no triple-slash file.
  - The four Tailwind rules are errors; the plugin needs the absolute config path.
  - `styling.md` rewritten. The template screen was recolored with token classes, both platforms were rebuilt, Metro ran with `--reset-cache`, and the iOS and Android screenshots matched.
  - Requirements: T2, T5.

```text
выключи lazy mode и сделай четко всё по инструкции и потом перепроверь

@AGENTS.md @docs/ai/guidelines/styling.md

Подключи NativeWind 4 как единственный способ стилизации.

1. Установи nativewind@^4 и tailwindcss@^3.4, а также версии react-native-reanimated и react-native-worklets, совместимые с текущей версией React Native (сверь peerDependencies). NativeWind 5 не бери: он в статусе release candidate и через react-native-css требует @expo/metro-config, а Expo-пакеты запрещены.
2. Настрой babel (preset nativewind/babel вместе с module-resolver), metro (withNativeWind с input ./global.css), global.css с директивами Tailwind и импорт global.css в точке входа app.
3. tailwind.config: content по src/**/*.{ts,tsx}, preset nativewind/preset. Цвета, отступы, радиусы и размеры шрифтов возьми из src/shared/theme/tokens.ts и замени ими стандартную шкалу Tailwind, а не расширяй её: в проекте существуют только классы на токенах вроде bg-surface, p-lg, rounded-md. tokens.ts остаётся единым источником и для JS-кода: тема навигации, цвет ActivityIndicator, android_ripple.
4. Типы className подключи без triple-slash директивы: это тоже комментарий, а комментарии в проекте запрещены.
5. ESLint: eslint-plugin-tailwindcss версии 3.18.x (4.x требует ESLint 9 и Tailwind 4), ошибками сделай no-custom-classname, no-arbitrary-value, no-contradicting-classname и classnames-order. Правила react-native/no-inline-styles и no-color-literals остаются.
6. Допиши в styling.md: className для статических стилей; style только для значений из рантайма (safe area insets, ширина экрана); варианты компонентов как типизированные карты классов Record<Variant, string> с as const satisfies; условные классы через clsx; никаких произвольных значений в квадратных скобках.

Готово, когда npm run verify зелёный, а экран-шаблон, перекрашенный классами на токенах, одинаково выглядит на iOS и Android после пересборки (reanimated и worklets нативные) и npm start -- --reset-cache.
```

### P-13. False StatusBar error in the editor

- Date: 2026-10-12
- Stage: 2
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - The code was correct: `npm run typecheck` on TypeScript 6.0.3 passes, and `StatusBarProps` of React Native 0.87 has `barStyle`.
  - The editor used TypeScript 5.3.0-dev from the 2023 "JavaScript and TypeScript Nightly" extension (`ms-vscode.vscode-typescript-next`). Its `tsc` reproduced the error and also rejected `es2024.promise` in `@react-native/typescript-config`.
  - `.vscode/settings.json` sets `typescript.tsdk` to the workspace TypeScript and enables the prompt to switch; `workflow.md` tool notes explain it. No source file changed.
  - Requirements: T2.

````text
For the code present, we get this error:
```
No overload matches this call.
  Overload 1 of 2, '(props: StatusBarProps): StatusBar', gave the following error.
    Type '{ barStyle: string; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<StatusBar> & Readonly<StatusBarProps>'.
      Property 'barStyle' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<StatusBar> & Readonly<StatusBarProps>'.
  Overload 2 of 2, '(props: StatusBarProps, context: any): StatusBar', gave the following error.
    Type '{ barStyle: string; }' is not assignable to type 'IntrinsicAttributes & IntrinsicClassAttributes<StatusBar> & Readonly<StatusBarProps>'.
      Property 'barStyle' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<StatusBar> & Readonly<StatusBarProps>'.
```
Fix it, verify, and then give a concise explanation. index.tsx (8-11)
````

## Stage 3: data layer

### P-07. src/shared

- Date: 2026-10-11
- Stage: 3 and 4
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - `theme/tokens.ts`: the requested groups plus `imageSize` and the `on-accent` color.
  - `config`: `API_BASE_URL`, plus `RootStackParamList` with the global `ReactNavigation.RootParamList` augmentation.
  - `api`: `httpClient.get(path, { signal })` returns `unknown`; it throws `HttpError` with `status` or `ResponseParseError`. `getErrorMessage` maps errors to user-facing text.
  - `lib`:
    - `createImageUrl(size)` with explicit `grayscale` and `blur`;
    - `createMmkvStorage(id)` satisfies the redux-persist `Storage`;
    - `useAppDispatch`, `useAppSelector`, `createAppAsyncThunk`;
    - type guards.
  - `ui`: `Screen`, `Typography`, `RemoteImage`, `Card`, `Button`, `Badge`, `Loader`, `ErrorState`, `EmptyState`, `StarIcon`, with typed class maps and `clsx`.
  - `src/app/state/types.ts` was created early, because the typed hooks need the global `RootState`.
  - Stack dependencies from `AGENTS.md` were installed.
  - `docs/ai/guidelines/accessibility.md` did not exist; it was written in the docs pass after P-10.
  - Requirements: T3, T5.

```text
@AGENTS.md @docs/ai/guidelines/styling.md @docs/ai/guidelines/accessibility.md @docs/ai/guidelines/data-fetching.md

Реализуй src/shared. Только код без бизнес-логики.

- theme: tokens.ts с colors, spacing, radius, borderWidth, opacity, touchTarget (минимум 44), iconSize и typography, типизация через as const satisfies. Это единственный источник значений для tailwind.config и JS-кода.
- config: API_BASE_URL и RootStackParamList (Posts, PostDetails с postId: number) с глобальной аугментацией ReactNavigation.RootParamList.
- api: httpClient.get(path, { signal }) возвращает unknown и бросает HttpError со статусом; getErrorMessage превращает ошибку в понятный пользователю текст.
- lib: createImageUrl(size) на faker.image.urlPicsumPhotos; адаптер react-native-mmkv под интерфейс Storage из redux-persist; типизированные useAppDispatch, useAppSelector и createAppAsyncThunk.
- ui на className: Screen, Typography (варианты, tone, asHeader даёт role header), RemoteImage (явные размеры, без подписи считается декоративной), Card (Pressable с подсветкой и android_ripple из токенов), Button (primary и outline, icon, selected, disabled), Loader (progressbar и live region), ErrorState (alert и кнопка повтора), EmptyState, StarIcon (скрыт от скринридера).

Ограничения: варианты компонентов через типизированные карты классов, только именованные экспорты, публичный API через index.ts.

Готово, когда npm run verify зелёный.
```

### P-08. src/entities/post

- Date: 2026-10-11
- Stage: 3
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - `api`: `PostDto`, `isPostDto`, `parsePostDto` and `parsePostDtoList`, with no casts; `postApi.getPosts(signal)` and `getPostById(id, signal)`.
  - `model`: `Post`, `PostDetails`, and the `RequestState` union.
  - `lib`: pure `mapPost` and `mapPostDetails`, which receive the URL.
  - Slice: adapter, `detailsById` and request states. `fetchPosts` and `fetchPostDetails` generate the Faker URL inside the payload creator. Their `condition` checks persisted data and in-flight requests. Errors go through `rejectWithValue(getErrorMessage(error))`.
  - `POSTS_PERSIST_KEYS` is `ids`, `entities`, `detailsById`.
  - Memoized adapter selectors.
  - `ui`: `PostCard` is memoized, one button with one label and the "Opens post details" hint. `PostDetailsView` shows a 300x300 image capped by the screen width, with a header title.
  - Requirements: F1, F2, F5.

```text
@AGENTS.md @docs/ai/guidelines/state-management.md @docs/ai/guidelines/data-fetching.md @docs/ai/guidelines/typescript.md

Реализуй src/entities/post. Сущность ничего не знает об избранном.

- api: PostDto, type guard isPostDto, parsePostDto и parsePostDtoList. Ответ сервера приходит как unknown, приведения через as запрещены. postApi.getPosts(signal) и getPostById(id, signal) через shared/api.
- model: Post с thumbnailUrl, PostDetails с imageUrl, RequestState как discriminated union idle, loading, succeeded, failed.
- lib: mapPost переводит DTO в доменную модель с URL картинки.
- Слайс на createEntityAdapter: список, detailsById, состояния запросов. Thunks fetchPosts и fetchPostDetails на createAppAsyncThunk: картинка генерируется внутри thunk ровно один раз; condition не запускает запрос, если данные уже есть или запрос идёт; ошибка через rejectWithValue с понятным текстом.
- Экспортируй ключи для персиста ids, entities, detailsById. Состояния запросов не персистятся.
- Мемоизированные селекторы.
- ui: PostCard (memo, вся карточка одна кнопка с одной подписью и подсказкой «Opens post details», выделение и бейдж приходят пропсами) и PostDetailsView (картинка 300x300, но не шире экрана: размер из рантайма передаётся через style, заголовок с role header).

Готово, когда npm run verify зелёный.
```

### P-09. src/features/toggle-favorite

- Date: 2026-10-11
- Stage: 3 and 4
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - `favoritesSlice` with `ids: number[]` and `favoriteToggled(postId)`; `selectFavoriteIds` and `selectIsFavorite`.
  - `FavoriteToggleButton` is built on `Button` and `StarIcon`, with a typed appearance map: outline "Add to favorites", primary "Remove from favorites".
  - It sets `accessibilityState.selected`, has a hint about highlighting and pinning, and announces "Added to favorites" or "Removed from favorites" after a press.
  - Requirements: F3, F4.

```text
@AGENTS.md @docs/ai/guidelines/architecture-fsd.md @docs/ai/guidelines/accessibility.md

Реализуй src/features/toggle-favorite.

- favoritesSlice: состояние { ids: number[] }, экшен favoriteToggled(postId) добавляет id или удаляет его. Порядок на экране задаёт не слайс, а селектор списка: избранные по возрастанию id.
- Селекторы selectFavoriteIds и selectIsFavorite(postId).
- FavoriteToggleButton на базе Button из shared/ui: подписи «Add to favorites» и «Remove from favorites», варианты outline и primary, StarIcon, accessibilityState.selected, подсказка о том, что избранное подсвечивается и закрепляется сверху, AccessibilityInfo.announceForAccessibility после переключения.

Готово, когда npm run verify зелёный.
```

### P-12. zod for all validation

- Date: 2026-10-11
- Stage: 3
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Clarification: Metro could not transform the `export * as` syntax of zod, and the iOS dev RedBox crashed on that error. The agent asked how to fix it with `AskQuestion`; the selected option is the second block below, verbatim.
- Outcome:
  - `zod` 4.6.5 installed; 4.6.6 was a few hours old and was skipped. No dependencies and no peers.
  - `@babel/plugin-transform-export-namespace-from` 7.29.7 as a devDependency, added to `babel.config.js`. It was already in the tree through `@babel/preset-env`; 8.x needs `@babel/core` 8.
  - `httpClient.get(path, schema, { signal })` validates every body with `safeParse` and throws `ResponseParseError` with `z.prettifyError`; `Promise<unknown>` no longer leaves `shared/api`.
  - `entities/post/api/postDto.ts`: `postDtoSchema`, `postDtoListSchema`, `createPostByIdDtoSchema(postId)`, which also rejects a mismatched `id`; `PostDto` is inferred.
  - `entities/post/model/schemas.ts`: `postIdSchema`, `postSchema`, `postDetailsSchema`, `persistedPostsSchema` with an ids-to-entities check. `Post` and `PostDetails` are inferred, and `POSTS_PERSIST_KEYS` comes from `persistedPostsSchema.keyof().options`.
  - `features/toggle-favorite/model/schemas.ts`: `favoritesStateSchema` with unique positive ids; `FavoritesState` is inferred.
  - `app/state/persistConfigs.ts`: `createValidatedMigrate(schema)` drops invalid storage, and the slice starts empty.
  - `@shared/lib/type-guards` removed.
  - ESLint `no-restricted-imports`: `zod` only in `src/shared/api`, `api` and `model` segments and `src/app/state`, no `zod/*` entries; probed in `ui`, a widget `model` and through `zod/mini`. `check-deps` allowlist extended.
  - Verified on the iPhone 17 simulator and the `Medium_Phone_API_36.1` emulator:
    - data written before the change passes the schemas, and a restart sends no request;
    - a corrupted thumbnail URL and duplicate favorite ids lead to one `GET /posts`, new image URLs and empty favorites, and the next restart sends nothing;
    - details pass the id check, and a favorite survives a restart.
  - Tooling scripts keep plain JSON reads: they parse npm's own files, and npm validates them first.
  - Docs updated: `AGENTS.md` stack, map, rules 6 and 9 and traceability; `data-fetching.md`, `state-management.md`, `typescript.md`, `architecture-fsd.md`, `react-native.md` compatibility list, `workflow.md`, `styling.md`, `code-style.md` and the matching Cursor rules.
  - Requirements: F5, F6, T3, T5.

```text
@src/entities/post/api/postDto.ts:1-36 давай zod применять для валидации типо и вообще валидации. Примени по всему проекту и обнови документацию
```

```text
Добавить dev-зависимость @babel/plugin-transform-export-namespace-from@^7 (уже стоит в дереве через @babel/preset-env 7.29.7), подключить её в babel.config.js, внести в allowlist и в таблицу совместимости (Recommended)
```

## Stage 4: UI

### P-10. Compose the app from layers

- Date: 2026-10-11
- Stage: 4
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - `widgets/posts-list`:
    - `selectPostListItems` returns `{ post, isFavorite }` items;
    - `usePostsList` dispatches `fetchPosts` on mount;
    - `PostsList` shows `Loader`, `ErrorState`, `EmptyState` or a `FlatList` with a module-level `keyExtractor`, a memoized `renderItem`, safe-area padding, the highlight and the "In favorites" badge.
  - `fsd/insignificant-slice` turned off as documented.
  - Pages:
    - `PostsScreen` navigates to `PostDetails` by id;
    - `DetailsScreen` with `usePostDetails` shows `Loader` or `ErrorState`, then a `ScrollView` with `PostDetailsView` and `FavoriteToggleButton`.
  - `app`:
    - `RootNavigator` with the token theme and an `ink` header title;
    - `createPersistedStore` with `persistReducer` per slice on MMKV;
    - `StoreProvider` with a lazy store and `PersistGate`;
    - global `RootState` and `AppDispatch` in `app/state/types.ts`.
  - Verified on the iPhone 17 simulator and the `Medium_Phone_API_36.1` emulator:
    - one `GET /posts` on the first launch, zero requests after a restart;
    - identical image URLs, favorites marked on the first frame;
    - the second press removes a favorite;
    - an opened post is not requested again;
    - a 404 shows `ErrorState` and persists nothing.
  - The docs pass updated `AGENTS.md`, every guide, the Cursor rules and the new `accessibility.md`.
  - Requirements: F1–F6, T3, T5.

```text
@AGENTS.md @docs/ai/guidelines/navigation.md @docs/ai/guidelines/performance.md @docs/ai/guidelines/state-management.md

Собери приложение из слоёв.

1. widgets/posts-list: селектор selectPostListItems на createSelector возвращает сначала избранные по возрастанию id, затем остальные в исходном порядке. PostsList запускает fetchPosts при монтировании, показывает Loader, ErrorState с повтором или EmptyState, рендерит FlatList с keyExtractor, мемоизированным renderItem, отступом под safe area, подсветкой и бейджем «In favorites».
2. pages: PostsScreen переходит на PostDetails по id. DetailsScreen запускает fetchPostDetails по route.params.postId, показывает Loader или ErrorState, а затем ScrollView с PostDetailsView и FavoriteToggleButton. Страницы только компонуют виджеты и фичи.
3. app: RootNavigator на native-stack с темой из tokens.ts. createPersistedStore для приложения. persistReducer на каждый слайс: posts с whitelist из сущности, favorites целиком; хранилище MMKV; PersistGate. Store создаётся лениво внутри StoreProvider, чтобы импорт модуля не имел побочных эффектов. RootState и AppDispatch объявлены глобальными типами в app/state/types.ts.

Готово, когда npm run verify зелёный и приложение запускается на iOS-симуляторе.
```

### P-11. Enable the automated checks of stages 3 and 4

- Date: 2026-10-11
- Stage: 3 and 4
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Clarification: after "продолжай" finished the recheck of P-06 to P-10, the agent asked two questions with `AskQuestion`: what to do with the `ImageBackground` deprecation warning of the template screen, and what to do next. The block below holds the two selected options verbatim.
- Outcome:
  - `eslint-plugin-local-rules` 3.0.2 installed after checking that it has no dependencies and no peers; `typescript-eslint` 8.71.1 supports TypeScript below 6.1, so typed linting runs on TypeScript 6.0.3.
  - `eslint-local-rules.js` with `no-comments`, which reports every comment except a shebang; `noInlineConfig: true` keeps directives from disabling it.
  - Typed linting through `parserOptions.project`: `consistent-type-assertions` (`never`), `consistent-type-definitions` (`type`, `routes.ts` exempt), `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unsafe-call`, `no-unsafe-return`, `no-unsafe-argument`.
  - `no-restricted-syntax`: default and wildcard exports, top-level `configureStore` and `persistStore`, object and array literals in `style` props, color strings outside `tokens.ts`, template literals in class names.
  - `no-restricted-globals` and `no-restricted-properties` for `fetch`, `XMLHttpRequest` and `WebSocket` outside `src/shared/api`.
  - `no-restricted-imports`: deep alias paths, Faker, other state and query libraries, HTTP clients, raw `react-redux` hooks, MMKV, `@shared/lib/image-url`, `@react-navigation/*`, visual primitives, `StatusBar`, `SafeAreaView` and `StyleSheet`. Folder exceptions are listed once in `IMPORT_EXCEPTIONS` in `.eslintrc.js`.
  - `react/no-unstable-nested-components` raised to an error in `src`.
  - `scripts/check-deps.mjs` with the dependency allowlist and an Expo scan of `package-lock.json`; `.prettierignore`; scripts `format:check` and `check:deps`; `verify` now runs five steps.
  - Every new rule and `check:deps` were probed with violating files and fired; the probes were deleted. The existing `src` code passed every check without changes. Prettier reformatted only the docs and configs.
  - The `ImageBackground` warning stays as documented in `react-native.md`.
  - Docs updated: `AGENTS.md` status, commands and traceability, `workflow.md` roadmap and quality gate notes, every guide, the Cursor rules and the compatibility list.
  - Requirements: T1, T2, T4, T5.

```text
Оставить как есть, оно уже описано в react-native.md

Включить проверки этапов 3 и 4 (понадобятся eslint-plugin-local-rules и typed linting, check-deps.mjs, .prettierignore)
```

## Stage 5: edge cases

No entries yet.

## Stage 6: delivery

### P-14. Initial commit and push to GitHub

- Date: 2026-10-12
- Stage: 6
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - `.gitignore` gains `*.log` and `.env*`; `git.md` rule 7 requires them and the template lacked them.
  - The first `pre-commit` run failed: lint-staged passed `.prettierrc.js` to ESLint 8, which ignores dotfiles by default, and the "File ignored by default" warning broke `--max-warnings=0`. `ignorePatterns` in `.eslintrc.js` now re-includes `!.prettierrc.js`, and the `workflow.md` tool notes explain why.
  - `docs/review.md`, a local review of the project against the task, stays out of the repository. It is formatted with Prettier, because `verify` checks untracked files too, and listed in `.gitignore`. The selected option is the second block below, verbatim.
  - The whole project is one commit on `main`: the template, quality gates, the code of stages 3 and 4, and the AI rules and docs. The message follows `git.md`. Hooks ran: lint-staged and `typecheck` on commit, `verify` on push.
  - `origin` is `https://github.com/MeyerPV/Test-task.git`, and `main` is pushed with upstream tracking.
  - The agent's `git push` was rejected with 403: the macOS keychain held a GitHub account without write access to the repository. The user authenticated and pushed `main` as one commit.
  - `README.md` is still the template one; P-15 rewrites it.
  - Requirements: T6 (repository; README pending), A2.

```text
Добавь гитхаб и залей туда весь код с осмысленным коммитом, учитывай @docs/ai/guidelines/git.md
git remote add origin https://github.com/MeyerPV/Test-task.git
git branch -M main
git push -u origin main
```

```text
Не коммитить: отформатировать Prettier (только пробелы и выравнивание таблиц) и добавить docs/review.md в .gitignore (Recommended)
```

### P-15. Project README and the Gradle download timeout

- Date: 2026-10-12
- Stage: 6
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - The prompt refers to the local review `docs/review.md`. Its item 1 is the README, item 2 is the GitHub push done in P-14, item 4 is the Gradle timeout.
  - `README.md` replaces the CLI template with a Russian description of the project. It covers the F1–F6 table with the code behind each requirement, the stack, environment requirements, `npm install` and `npm run ios` or `npm run android`, troubleshooting (`npm run pods` after a broken `pod install`, the Gradle download, `JAVA_HOME`, a busy port 8081, `--reset-cache`), a manual check of F1–F6 in the DevTools Network panel, scripts and hooks, the FSD layers, accessibility and links to the AI artifacts.
  - `networkTimeout` in `android/gradle/wrapper/gradle-wrapper.properties` goes from 10000 to 120000 ms; `./gradlew --version` still starts Gradle 9.4.1 on JDK 17. `workflow.md` explains why, and why a wrapper upgrade needs the value set again.
  - `AGENTS.md`: the stack lists Android SDK Platform 37, because `android/build.gradle` sets `compileSdk 37`, not 36; the status names what remains of stages 5 and 6.
  - Requirements: T6, A2.

```text
@docs/review.md сделай пункты 1 и 4, пункт 2 сделан
```

### P-16. One install command, one run command

- Date: 2026-10-12
- Stage: 6
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - `npm run` through `scripts/run-app.mjs` starts the iOS app on macOS and the Android app on every other OS, so the reviewer installs with `npm install` and launches with `npm run` (T6). `npm run ios` and `npm run android` stay for a chosen platform.
  - `README.md`, the T6 row and the commands table in `AGENTS.md`, and the stage 6 row in `workflow.md` name `npm run`.
  - Requirements: T6, A2.

```text
@package.json:1-71 добавь сюда скрипт, чтобы выполнялось требование

Код должен быть выложен в GitHub (репозиторий с README и инструкцией
по запуску). Проверяющий должен установить проект одной командой,
второй - запустить
```

### P-17. Debug: list thumbnails did not load

- Date: 2026-10-12
- Stage: 6
- Tool and model: Cursor Agent (Debug mode) / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - The app on the iPhone 17 Pro simulator ran another project's JavaScript. It had no `RCT_jsLocation`, so it loaded from Metro on 8081, which served `/Users/pavelsuperapp/Documents/FirebirdTest`, a separate implementation with the same bundle id `com.firebird.posts`. The Metro inspector showed its modules, such as `src/shared/ui/RemoteImage.tsx`, and none of ours.
  - With `RCT_jsLocation=localhost:8082` the app loaded this project's bundle. Temporary `onLoadStart`, `onLoad` and `onError` logs in `RemoteImage` recorded 67 starts, 67 loads and no errors, and the first thumbnails were valid `https://picsum.photos/seed/<seed>/32/32` URLs.
  - No code change: the cause is the documented busy-port pitfall in `README.md` and `workflow.md`. The instrumentation was removed in P-18.
  - Requirements: F1.

```text
картинки для первых элементов списка @src/widgets/posts-list/ui/PostsList.tsx:1-73 не подгрузились
```

### P-18. Remove debug logs, rename the details route

- Date: 2026-10-12
- Stage: 6
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - The P-17 instrumentation in `RemoteImage.tsx` and `PostsList.tsx` is removed; both files match the last commit.
  - The route `PostDetails` is now `DetailsScreen` in `RootStackParamList`, `RootNavigator`, the `navigate` call in `PostsScreen` and the screen props of `DetailsScreen`. The data type `PostDetails` in `entities/post` keeps its name: it describes a post with its image, not a screen.
  - `navigation.md`, `navigation.mdc` and the map in `architecture-fsd.md` use the new route name.
  - Requirements: F2, T5.

```text
удали дебаг логи

и переименуй PostDetails в DetailsScreen во всех местах
```

### P-19. Recheck F5 and F6, persisted list flag

- Date: 2026-10-12
- Stage: 6
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - Rechecked on the iPhone 17 Pro simulator through the Metro inspector, starting from empty storage:
    - the first launch sends one `GET /posts`; the first open of a post sends one `GET /posts/{id}`, and a second open sends nothing;
    - after a JS reload and after a cold restart nothing is requested, `listRequest` stays `idle`, thumbnail and details URLs are identical, and favorites 3 and 7 lead the list.
  - Gap found: an empty `GET /posts` response would be requested again after every restart, because the guard was the persisted `ids`. `AGENTS.md` rule 6 already asked for a persisted flag.
  - Fix:
    - `posts` gains the persisted `isListLoaded`, set by `fetchPosts.fulfilled` also for an empty list; the `fetchPosts` condition checks the flag.
    - `persistedPostsSchema` requires the flag. The posts persist config moves to version 2, and migration 2 sets the flag from the stored `ids`.
    - `PostsList` shows `EmptyState` "No posts" for a loaded empty list, through `selectIsPostListLoaded`.
  - Checked at runtime:
    - version 1 storage migrates without a request and keeps URLs and favorites;
    - a stored empty loaded list shows "No posts" and sends nothing after a reload and a cold restart;
    - a fresh launch sends one request, and the next reload none;
    - a corrupted thumbnail leads to one new request, and the next reload none.
  - The user's header titles "PostsScreen" and "DetailsScreen" stay. `RootNavigator.tsx` is formatted with Prettier, and `navigation.md`, `navigation.mdc` and the README name them.
  - Docs: `data-fetching.md`, `state-management.md`, `architecture-fsd.md`, the data-fetching and state-management Cursor rules, the F1, F2 and F5 rows of the README.
  - Requirements: F5, F6.

```text
@src/widgets/posts-list/model/usePostsList.ts:1-29 перепроверь пункты

5. Сгенерированный список запрашивается только 1 раз и никогда не
обновляется. Добавленные картинки из FakerJS также добавляются только 1
раз - и для PostsScreen, и для DetailsScreen
6. При повторном открытии приложения данные сохраняются и повторно не
запрашиваются. Все посты, добавленные в избранное - отмечены сразу
```

```text
Добавить сохраняемый флаг загрузки списка: даже пустой список больше не запрашивается повторно; текст EmptyState поправить, AGENTS.md остаётся как есть (Recommended)

Оставить новые заголовки: отформатировать Prettier и обновить navigation.md и правило Cursor
```

### P-20. Full chat export

- Date: 2026-10-12
- Stage: 6
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - The whole session, from the task analysis on 2026-10-11 through this prompt, is exported as 22 numbered turns. Each turn keeps the question and every text fragment of the answer, including the English working notes stored in the same message.
  - Tool calls are not in the export: the transcript stores them separately from the answer text. One system tool-catalog refresh is marked in place and its body is left out.
  - Every earlier entry in this log points at the same file.
  - Requirements: A1.

```text
сделай мне полную выгрузку этого чата с моими вопросами и твоими ответами в md формате, сохраняя форматирование, чтобы удобно было читать. Мне нужна полная выгрузка абсолютно все моменты

создай md в этом проекте
```

### P-21. README title and the two start commands

- Date: 2026-10-13
- Stage: 6
- Tool and model: Cursor Agent / Claude Opus 5.5
- Chat export: `docs/ai/chats/2026-10-12_cursor_full-chat.md`
- Outcome:
  - `README.md` is titled Test-task. Installation and launch are the first section: `npm run start:project:ios` and `npm run start:project:android`, the scripts from `package.json`.
  - The scripts table lists the same two commands.
  - Requirements: T6.

```text
обнови@README.md  и убери FirebirdPosts, просто название Test-task

установка и запуск в самом верху сделай

и вот эти 2 команды вставь туда
@package.json (9-10)
```
