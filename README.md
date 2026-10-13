# Test-task

## Установка и запуск

```sh
git clone https://github.com/MeyerPV/Test-task.git
cd Test-task
// install node_modules & run on ios
npm run start:project:ios
// install node_modules & run on android
npm run start:project:android
```

На macOS запустите `npm run start:project:ios`. На остальных ОС запустите `npm run start:project:android`.

`npm run start:project:ios` выполняет `npm i && react-native run-ios`. `npm run start:project:android` выполняет `npm i && react-native run-android`.

`npm i` ставит зависимости и git-хуки husky. На macOS он затем запускает `scripts/install-pods.mjs`: `bundle install` и `bundle exec pod install`, а если Bundler недоступен, глобальный `pod install`. На CI и на других ОС поды пропускаются. Команда сборки запускает приложение на симуляторе или эмуляторе и открывает Metro в отдельном окне терминала, если он ещё не запущен.

Тестовое задание на React Native: список постов из [JSONPlaceholder](https://jsonplaceholder.typicode.com), экран поста и избранное. Приложение собрано на React Native CLI без Expo, на TypeScript и Redux Toolkit. Код написан только ИИ-агентами, промпты и правила для них лежат в репозитории.

Интерфейс на английском.

## Что умеет приложение

| ID  | Требование                                                                                  | Как сделано                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Экран PostsScreen показывает `GET /posts`, у каждого поста картинка 32×32 из Faker          | `fetchPosts` в `src/entities/post/model/thunks.ts` загружает список и один раз создаёт для каждого поста `thumbnailUrl` через `faker.image.urlPicsumPhotos`                                                                                                          |
| F2  | Экран DetailsScreen показывает `GET /posts/{id}` с картинкой 300×300 из Faker               | `fetchPostDetails` загружает пост отдельным запросом и создаёт `imageUrl`, независимый от превью в списке                                                                                                                                                            |
| F3  | Кнопка на экране поста добавляет его в избранное, повторное нажатие убирает                 | `FavoriteToggleButton` в `src/features/toggle-favorite` переключает id в слайсе избранного; подпись меняется с «Add to favorites» на «Remove from favorites»                                                                                                         |
| F4  | Избранные посты выделены и стоят в начале списка по возрастанию `id`                        | `selectPostListItems` в `src/widgets/posts-list` ставит избранные первыми по `id`, остальные идут в порядке API; у карточки цвет фона и рамки избранного и бейдж «In favorites» со звездой                                                                           |
| F5  | Список запрашивается один раз и не обновляется, каждая картинка Faker создаётся один раз    | После первой загрузки сохраняется флаг `isListLoaded`, даже для пустого списка; `condition` у thunk не отправляет запрос, если флаг стоит, детали поста уже есть или запрос уже идёт; редьюсер не перезаписывает сохранённые посты, поэтому URL картинок не меняются |
| F6  | После перезапуска данные восстанавливаются без запросов, избранное отмечено с первого кадра | `redux-persist` хранит посты, детали и избранное в MMKV; восстановленные данные проверяются схемами zod; `PersistGate` показывает список только после чтения хранилища                                                                                               |

Если сохранённые данные повреждены, они не проходят схему zod. Слайс начинает с пустого состояния, и список загружается заново одним запросом.

## Стек

- React Native 0.87.1 на React Native Community CLI 20.2, New Architecture и Hermes.
- TypeScript 6 в strict-режиме.
- React Navigation 7, native stack.
- Redux Toolkit 2, react-redux 9, redux-persist 6 поверх react-native-mmkv 4.
- zod 4 для проверки ответов API и восстановленного состояния.
- `@faker-js/faker` 10 для ссылок на картинки.
- NativeWind 4 на Tailwind CSS 3.4 с токенами темы из `src/shared/theme`.
- ESLint, Steiger для FSD, Prettier, husky и lint-staged.

## Требования к окружению

Общие:

- Node `^22.22.1 || ^24.3.0`, npm 10 или новее.
- Свободный порт 8081 для Metro или Metro на другом порту, см. раздел «Если что-то пошло не так».

iOS, только на macOS:

- Xcode 26 и симулятор iOS. Проверено на iPhone 17.
- Ruby с Bundler: CocoaPods ставится из `Gemfile`. Без Bundler подойдёт установленный глобально CocoaPods.

Android:

- JDK 17, на него указывает `JAVA_HOME`.
- Android SDK Platform 37, Build-Tools 37.0.0 и NDK 27.1.12297006; приложение собирается с `compileSdk 37`, `targetSdk 36` и `minSdk 24`.
- Эмулятор или устройство. Проверено на эмуляторе `Medium_Phone_API_36.1`.

Окружение проверяет `npx react-native doctor`. Как поставить всё с нуля, описано в [руководстве React Native](https://reactnative.dev/docs/set-up-your-environment).

## Если что-то пошло не так

- **`pod install` оборвался**, например из-за сети при загрузке собранного ядра React Native: запустите `npm run pods`, затем `npm run ios`.
- **Первая сборка Android падает при загрузке Gradle**: повторите `npm run android`. Таймаут загрузки дистрибутива Gradle поднят до 120 секунд в `android/gradle/wrapper/gradle-wrapper.properties`, но очень медленная сеть может не уложиться и в него.
- **Gradle сообщает о неподходящей Java**: `JAVA_HOME` должен указывать на JDK 17.
- **Порт 8081 занят**: запустите `npm start -- --port 8082`, затем в другом терминале `npm run ios -- --port 8082` или `npm run android -- --port 8082`. Собранное ядро React Native на iOS всё равно обращается к 8081, поэтому симулятору порт указывается отдельно:

  ```sh
  xcrun simctl spawn booted defaults write com.firebird.posts RCT_jsLocation -string "localhost:8082"
  ```

- **Изменения в `babel.config.js`, `tailwind.config.js`, `global.css` или токенах темы не видны**: перезапустите Metro с `npm start -- --reset-cache`.

Остальные заметки по нативной сборке собраны в [`docs/ai/guidelines/workflow.md`](docs/ai/guidelines/workflow.md#native-build-notes).

## Как проверить требования вручную

1. Запустите приложение и откройте React Native DevTools клавишей `j` в терминале Metro, вкладка Network. При первом запуске уходит один `GET /posts`, список показывает посты с картинками 32×32.
2. Откройте пост. Уходит один `GET /posts/{id}`, экран показывает картинку 300×300, заголовок и текст.
3. Нажмите «Add to favorites». Подпись кнопки сменится на «Remove from favorites». Вернитесь к списку: пост стоит в начале, выделен и помечен бейджем «In favorites». Несколько избранных постов идут по возрастанию `id`.
4. Нажмите кнопку на экране поста ещё раз: пост уходит из избранного и возвращается на своё место в списке.
5. Закройте приложение полностью и откройте снова. Список и избранное появляются сразу, картинки те же, во вкладке Network нет новых запросов. Уже открытые посты тоже открываются без запросов.

## Скрипты

| Команда                           | Что делает                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run start:project:ios`       | Ставит зависимости и запускает iOS: `npm i && react-native run-ios`                           |
| `npm run start:project:android`   | Ставит зависимости и запускает Android: `npm i && react-native run-android`                   |
| `npm install`                     | Ставит зависимости, хуки husky и, на macOS, поды                                              |
| `npm run`                         | Запускает iOS на macOS и Android на остальных ОС                                              |
| `npm run ios` / `npm run android` | Собирает и запускает приложение на выбранной платформе, запускает Metro                       |
| `npm start`                       | Запускает только Metro                                                                        |
| `npm run pods`                    | Ставит поды заново тем же скриптом, в том числе на CI                                         |
| `npm run verify`                  | Типы, ESLint, Steiger, Prettier и проверка зависимостей; проходит без ошибок и предупреждений |

Хук `pre-commit` прогоняет ESLint по индексированным файлам и запускает `npm run typecheck`, хук `pre-push` запускает `npm run verify`. Автотестов в проекте нет, они вне рамок задания.

## Архитектура

Код в `src/` разложен по слоям [Feature-Sliced Design](https://feature-sliced.design). Слой импортирует только слои ниже себя, срезы связаны через свой `index.ts`.

| Слой       | Что внутри                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------- |
| `app`      | Точка входа, стор с redux-persist и проверкой восстановленных данных, навигация                    |
| `pages`    | Экраны `posts` и `post-details`: связывают навигацию, виджеты и фичи                               |
| `widgets`  | `posts-list`: порядок списка, выделение избранного, состояния загрузки, ошибки и пустого списка    |
| `features` | `toggle-favorite`: слайс избранного, селекторы и кнопка                                            |
| `entities` | `post`: схемы ответов API, запросы, слайс постов, thunk с картинками Faker, карточка и экран поста |
| `shared`   | HTTP-клиент с проверкой ответов, конфигурация, токены темы, хранилище MMKV, UI-примитивы           |

Сеть идёт только через `src/shared/api`: `httpClient.get` принимает схему zod и возвращает только проверенные данные. Карта всех файлов в [`docs/ai/guidelines/architecture-fsd.md`](docs/ai/guidelines/architecture-fsd.md).

VoiceOver и TalkBack поддерживаются: у интерактивных элементов есть роли, подписи и подсказки, изменения состояния объявляются. Правила в [`docs/ai/guidelines/accessibility.md`](docs/ai/guidelines/accessibility.md).

## Разработка с ИИ

- [`AGENTS.md`](AGENTS.md): единый источник правил для Cursor, Claude Code и Codex. В нём проект, стек, команды, неизменяемые правила и критерии готовности. `CLAUDE.md` подключает его для Claude Code.
- [`docs/ai/guidelines/`](docs/ai/guidelines): подробные правила по областям с примерами и инструментом, который проверяет каждое правило.
- [`.cursor/rules/`](.cursor/rules): короткие правила Cursor со ссылками на гайды.
- [`docs/ai/prompts.md`](docs/ai/prompts.md): все промпты дословно, по этапам, с результатом каждого.
- [`docs/ai/chats/`](docs/ai/chats): выгрузки диалогов с агентами и скриншоты; как их выгружать и называть, описано в [`docs/ai/chats/README.md`](docs/ai/chats/README.md).

## Вне рамок

Автотесты, локализация, тёмная тема, pull-to-refresh, таймауты запросов, автоматические повторы и библиотеки дискового кэша картинок. При ошибке загрузки экран показывает кнопку «Retry», которая отправляет запрос ещё раз.
