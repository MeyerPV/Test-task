# Architecture: Feature-Sliced Design

## Layers and import direction

`app` > `pages` > `widgets` > `features` > `entities` > `shared`. A module imports only from layers below its own.

- No imports from a higher layer.
- No imports between slices of the same layer: `pages/posts` never imports `pages/post-details`, `entities` never import each other.
- `shared` and `app` have no slices; their segments are imported through `index.ts`.

## Rules

1. Every slice exposes a public API in `index.ts` with named re-exports only. Checked by Steiger `fsd/public-api`.
2. Code outside a slice imports only its `index.ts` through an alias: `@entities/post`, never `@entities/post/model/postsSlice`. Segments of `shared` are imported as `@shared/ui`, `@shared/theme`, `@shared/lib/redux`. Checked by Steiger `fsd/no-public-api-sidestep` and ESLint `no-restricted-imports`.
3. Imports inside a slice are relative. Checked by review.
4. Upward and sibling imports are forbidden. Checked by Steiger `fsd/forbidden-imports`.
5. Segments are named by purpose: `ui`, `model`, `api`, `lib`, `config`, and `theme` in `shared`. Names like `components`, `hooks`, `types`, `store`, `stores`, `providers`, `selectors`, `thunks`, `utils`, `helpers` and `constants` are forbidden. Checked by Steiger `fsd/segments-by-purpose`.
6. The `app` layer has two segments, `state` and `navigation`, plus the entry `index.tsx`. No `ui`, `providers`, `store` or `types` segments in `app`. Checked by Steiger `fsd/segments-by-purpose` and `fsd/no-ui-in-app`.
7. No `index.ts` at the layer level except `src/app/index.tsx`. Checked by Steiger `fsd/no-layer-public-api`.
8. Favorites are a feature, not an entity. The favorites slice, its selectors and `FavoriteToggleButton` live only in `features/toggle-favorite`. `entities/post` knows nothing about favorites: `PostCard` receives `isHighlighted` and `badgeLabel` as props. The `posts-list` widget combines posts with favorite status and passes the "In favorites" badge. Checked by Steiger `fsd/forbidden-imports` and review.
9. Pages only compose. A page reads route params, wires navigation callbacks and renders widgets, features and entity views; a page-level hook in `model` may dispatch an entity thunk. Checked by review.

## Conscious exception: `fsd/insignificant-slice` is off

`widgets/posts-list` has a single consumer, `pages/posts`, and Steiger would suggest merging it into the page. It stays a widget so that the page remains thin: the list order, the request lifecycle and the favorite highlight live in the widget, the page only wires navigation. The rule is turned off in `steiger.config.mjs`; the rationale lives here because code has no comments.

## Map of `src/`

```
src/
  app/
    index.tsx                      App: imports global.css, SafeAreaProvider, StatusBar, StoreProvider, RootNavigator
    state/
      createPersistedStore.ts      MMKV storage, persistReducer per slice, configureStore, persistStore
      persistConfigs.ts            posts version 2 with the isListLoaded migration, favorites version 1, timeout 0, migrate validated by the slice schema, posts whitelist
      StoreProvider.tsx            creates store and persistor once through useState, Provider and PersistGate
      types.ts                     declare global RootState and AppDispatch from the store factory type
      index.ts
    navigation/
      RootNavigator.tsx            NavigationContainer with the token theme, native stack Posts and DetailsScreen
      index.ts
  pages/
    posts/
      ui/PostsScreen.tsx           renders PostsList and navigates to DetailsScreen by id
      index.ts
    post-details/
      model/usePostDetails.ts      dispatches fetchPostDetails, exposes details, request state and retry
      ui/DetailsScreen.tsx         Loader or ErrorState, then ScrollView with PostDetailsView and FavoriteToggleButton
      index.ts
  widgets/
    posts-list/
      model/selectPostListItems.ts favorites by ascending id first, then the rest in API order, as { post, isFavorite }
      model/usePostsList.ts        dispatches fetchPosts, exposes items, isListLoaded, request state and retry
      ui/PostsList.tsx             FlatList, Loader, ErrorState with Retry, EmptyState for a loaded empty list, "In favorites" badge
      index.ts
  features/
    toggle-favorite/
      model/favoritesSlice.ts      FavoritesState from the schema, favoriteToggled(postId)
      model/schemas.ts             favoritesStateSchema: unique positive post ids
      model/selectors.ts           selectFavoriteIds, selectIsFavorite
      ui/FavoriteToggleButton.tsx  "Add to favorites" or "Remove from favorites", announces the change
      index.ts
  entities/
    post/
      api/postDto.ts               postDtoSchema, postDtoListSchema, createPostByIdDtoSchema, PostDto
      api/postApi.ts               getPosts, getPostById through @shared/api with the DTO schemas
      lib/mapPost.ts               mapPost adds thumbnailUrl, mapPostDetails adds imageUrl
      model/schemas.ts             postIdSchema, postSchema, postDetailsSchema, persistedPostsSchema with isListLoaded
      model/types.ts               Post and PostDetails from the schemas, PostsState, RequestState
      model/postsAdapter.ts        createEntityAdapter<Post>
      model/requestState.ts        idle, loading and succeeded constants, isRequestInFlight
      model/postsSlice.ts          list, detailsById, isListLoaded, request states, POSTS_PERSIST_KEYS from persistedPostsSchema
      model/thunks.ts              fetchPosts, fetchPostDetails with condition and rejectWithValue
      model/selectors.ts           selectAllPosts, selectPostById, selectPostsRequest, selectIsPostListLoaded, selectPostDetails, selectPostDetailsRequest
      ui/PostCard.tsx              memo card: one button with thumbnail, title, body; highlight and badge from props
      ui/PostDetailsView.tsx       300x300 image capped by the screen width, header title, body
      index.ts
  shared/
    api/
      httpClient.ts                httpClient.get(path, schema, { signal }) on global fetch, returns validated data
      errors.ts                    HttpError with status, ResponseParseError
      getErrorMessage.ts           error to user-facing text
      index.ts
    config/
      api.ts                       API_BASE_URL
      routes.ts                    RootStackParamList and the ReactNavigation.RootParamList augmentation
      index.ts
    theme/
      tokens.ts                    colors, spacing, radius, borderWidth, opacity, touchTarget, iconSize, imageSize, typography
      index.ts
    lib/
      image-url/                   createImageUrl(size) on faker.image.urlPicsumPhotos
      redux/                       useAppDispatch, useAppSelector, createAppAsyncThunk
      storage/                     createMmkvStorage(id): redux-persist storage on MMKV
    ui/
      Typography/  Button/  Card/  Badge/  StarIcon/  RemoteImage/  Screen/  Loader/  ErrorState/  EmptyState/
      index.ts
```

Global styles live in `global.css` at the project root and are imported once in `src/app/index.tsx`.

## Examples

Both blocks are imports of `src/widgets/posts-list/ui/PostsList.tsx`.

### Do

```ts
import { PostCard } from '@entities/post';
import { spacing } from '@shared/theme';
import { EmptyState, ErrorState, Loader } from '@shared/ui';
import type { PostListItem } from '../model/selectPostListItems';
import { usePostsList } from '../model/usePostsList';
```

### Don't

```ts
import { favoritesSlice } from '@features/toggle-favorite/model/favoritesSlice';
import { DetailsScreen } from '@pages/post-details';
import { RootNavigator } from '@app/navigation';
import { selectIsFavorite } from '@entities/favorite';
```

Line 1 sidesteps the public API, line 2 imports upward from `pages`, line 3 imports upward from `app`, line 4 refers to a slice that does not exist.

## Checked by

- Steiger `steiger ./src --fail-on-warnings` with `configs.recommended` from `steiger.config.mjs`. Enabled in stage 2.
- Steiger `fsd/insignificant-slice` off. Enabled with the first widget.
- ESLint `no-restricted-imports` with patterns `@app/*`, `@pages/*/*`, `@widgets/*/*`, `@features/*/*`, `@entities/*/*`, `@shared/api/*`, `@shared/config/*`, `@shared/theme/*`, `@shared/ui/*`, `@shared/lib/*/*`. Enabled in stage 3.
