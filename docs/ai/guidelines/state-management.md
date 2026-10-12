# State management

Redux Toolkit is the only global state. redux-persist stores data slices in MMKV.

## Rules

1. **Global state lives only in Redux Toolkit slices** created with `createSlice`. No Zustand, MobX, Jotai, Recoil, Valtio, and no React context for app data. Checked by ESLint `no-restricted-imports` and `check:deps`.
2. **Two slices, fixed owners.**

   - `posts` in `src/entities/post/model/postsSlice.ts`.
   - `favorites` in `src/features/toggle-favorite/model/favoritesSlice.ts`.

   A new global slice needs the user's approval. Checked by review.

3. **State shape.**

   - `posts`: `ids` and `entities` from `createEntityAdapter<Post>`, `detailsById: Record<number, PostDetails>`, `listRequest: RequestState`, `detailsRequestById: Record<number, RequestState>`.
   - `RequestState` is `idle`, `loading`, `succeeded` or `failed` with a user-facing `error` string.
   - `favorites`: `ids: number[]` in toggle order. The screen order is derived in selectors, never stored.
   - `Post` and `PostDetails` are inferred from `postSchema` and `postDetailsSchema` in `entities/post/model/schemas.ts`, `FavoritesState` from `favoritesStateSchema` in `features/toggle-favorite/model/schemas.ts`.

   Checked by `tsc` and review.

4. **`persistReducer` per slice; posts persist data only.**

   - `posts`: whitelist `POSTS_PERSIST_KEYS` exported by the entity: `['ids', 'entities', 'detailsById']`, taken from `persistedPostsSchema.keyof().options`, so the whitelist and the schema cannot drift apart.
   - `favorites`: the whole slice, it holds only `ids`.

   Request states are never persisted, so a failed request writes nothing to storage. The persisted `ids` and `detailsById` are the fetch-once guard, see `data-fetching.md`. Checked by review of `src/app/state/persistConfigs.ts`.

5. **`timeout: 0` in every persist config**, so an empty store cannot request the network before `REHYDRATE`. With the default 5-second timeout, redux-persist could release the gate with empty state, the list would be fetched again and Faker would produce new image URLs. Checked by review.
6. **`version: 1` and a validated `migrate`** in every persist config. `createValidatedMigrate(schema)` runs `createMigrate({})`, then `schema.safeParse` on the result.

   - Valid data is restored as stored.
   - Invalid data is dropped: `migrate` resolves `undefined`, the slice starts from its initial state, and the next write replaces the stored value. For `posts` this means one new `GET /posts` with new Faker images; this happens only for corrupted or outdated storage, never for data the current version wrote.
   - `persistedPostsSchema` checks `ids`, `entities` and `detailsById`, and that every id in `ids` has an entity. `favoritesStateSchema` checks positive, unique ids.
   - A change to a persisted shape bumps the version, adds a migration and updates the schema in the same change.

   Checked by review and the manual corrupted-storage check in `workflow.md`.

7. **The store is created inside `StoreProvider`, not at module level.** `createPersistedStore()` builds the MMKV storage, the root reducer, the store and the persistor, and `StoreProvider` calls it once through the `useState` initializer. Importing a module has no side effects: no MMKV instance, no rehydration start. Checked by ESLint `no-restricted-syntax` for top-level `configureStore` and `persistStore` calls.
8. **`PersistGate` wraps everything that reads data or dispatches thunks**, with `Loader` from `@shared/ui` as `loading`. The first frame of the list already has favorites. Checked by review and the manual restart check.
9. **`serializableCheck` ignores the redux-persist actions** `FLUSH`, `REHYDRATE`, `PAUSE`, `PERSIST`, `PURGE`, `REGISTER`. Checked by the Redux dev middleware at runtime.
10. **`RootState` and `AppDispatch` are global types** declared in `src/app/state/types.ts` from `ReturnType<typeof createPersistedStore>`. Lower layers use them without importing `app`. Exported reducers are annotated, `postsReducer: Reducer<PostsState>` and `favoritesReducer: Reducer<FavoritesState>`, which breaks the cycle between the store type and selectors or thunks that read `RootState`. Checked by `tsc`.
11. **Typed hooks and thunks only.** Use `useAppDispatch`, `useAppSelector` and `createAppAsyncThunk` from `@shared/lib/redux`; `useDispatch`, `useSelector` and `useStore` from `react-redux` are imported only there. Checked by ESLint `no-restricted-imports`.
12. **Reducers are pure.** No Faker, `Date.now`, `Math.random` or I/O in reducers or `prepare` callbacks. Checked by review and ESLint `no-restricted-imports`, which keeps Faker in `src/shared/lib/image-url` and its caller in `src/entities/post/model/thunks.ts`.
13. **Actions are past-tense events**: `favoriteToggled(postId)`. Checked by review.
14. **Component-local, non-shared UI state** may use `useState`. Data shared between screens never does. Checked by review.

## Examples

### Do

```tsx
export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [{ store, persistor }] = useState(createPersistedStore);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Loader />}>
        {children}
      </PersistGate>
    </Provider>
  );
};
```

```ts
const createValidatedMigrate =
  (schema: z.ZodType): PersistMigrate =>
  async (persistedState, currentVersion) => {
    const migratedState = await migrateVersions(persistedState, currentVersion);
    return schema.safeParse(migratedState).success ? migratedState : undefined;
  };

export const createPostsPersistConfig = (
  storage: Storage,
): PersistConfig<PostsState> => ({
  ...createBaseConfig('posts', storage, persistedPostsSchema),
  whitelist: [...POSTS_PERSIST_KEYS],
});
```

```ts
const isFavorite = useAppSelector(state => selectIsFavorite(state, postId));
```

### Don't

```ts
export const store = configureStore({ reducer: rootReducer });
export const persistor = persistStore(store);
```

```ts
const persistConfig = { key: 'root', storage };
const isFavorite = useSelector((state: RootState) =>
  state.favorites.ids.includes(postId),
);
```

The first block runs on import. The second persists everything, including request states, keeps the default timeout, restores storage without validation and uses an untyped hook.

## Checked by

- `npm run typecheck` for the state shape and the global types. Enabled in stage 2.
- Manual check from the Definition of Done: restart the app, favorites are marked on the first frame of the list.
- ESLint `no-restricted-imports` for other state and query libraries, AsyncStorage, raw `react-redux` hooks and MMKV outside `src/shared/lib/storage`. Enabled in stage 3.
- ESLint `no-restricted-syntax` with `Program > VariableDeclaration > VariableDeclarator > CallExpression[callee.name=/^(configureStore|persistStore)$/]`, the same under `ExportNamedDeclaration`, and a bare top-level call. Enabled in stage 3.
- `npm run check:deps`. Enabled in stage 3.
