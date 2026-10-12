# Performance

## Rules

1. **Lists use `FlatList`, never `ScrollView` with `map`.** `data` comes from a memoized selector. `keyExtractor` is a module-level function. `renderItem` is wrapped in `useCallback`. The item component is wrapped in `memo` and receives only stable props: the `post` object from the entity adapter, booleans, strings and a stable callback. Checked by review and `react/no-unstable-nested-components`.
2. **Derived collections come from memoized selectors.** `selectPostListItems` is built with `createSelector` over `selectAllPosts` and `selectFavoriteIds`, and returns `{ post, isFavorite }` items. `useAppSelector` callbacks never create arrays or objects. Checked by review and the react-redux development stability check, which warns when a selector returns a new reference.
3. **Callbacks passed to memoized children are stable.** Use `useCallback` with complete dependencies. Checked by `react-hooks/exhaustive-deps`.
4. **No sorting, filtering or mapping of store data in render.** That work belongs in selectors. Checked by review.
5. **Images have explicit token sizes**: `imageSize.thumbnail` 32 for cards and `imageSize.details` 300 for details, capped by the screen width. The requested URL size equals the rendered size, so there is no layout shift and no oversized download. Checked by review.
6. **Faker is imported only from `@faker-js/faker/locale/en`.** Metro has no tree shaking, and the root entry bundles every locale. Checked by ESLint `no-restricted-imports` for the exact path `@faker-js/faker` and for every other subpath.
7. **No `console` calls in committed code.** Checked by ESLint `no-console`.
8. **Startup stays light.** The store is created inside `StoreProvider`, the `PersistGate` loader is a plain `Loader`, nothing heavy runs on import. Checked by review.
9. **Toggling a favorite re-renders only the affected item and the list order.** The selector creates new `{ post, isFavorite }` wrappers, but `PostCard` compares `post`, `isHighlighted`, `badgeLabel` and `onPress`, which stay equal for untouched posts. Verified with React DevTools "Highlight updates" whenever list code changes. Checked manually.

## Examples

### Do

```tsx
const keyExtractor = ({ post }: PostListItem): string => String(post.id);

export const PostsList = ({ onPostPress }: PostsListProps) => {
  const { items } = usePostsList();
  const renderItem = useCallback<ListRenderItem<PostListItem>>(
    ({ item }) => (
      <PostCard
        post={item.post}
        onPress={onPostPress}
        isHighlighted={item.isFavorite}
        badgeLabel={item.isFavorite ? FAVORITE_BADGE_LABEL : undefined}
      />
    ),
    [onPostPress],
  );

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};
```

```ts
export const selectPostListItems = createSelector(
  [selectAllPosts, selectFavoriteIds],
  (posts, favoriteIds): PostListItem[] => {
    const favoriteIdSet = new Set(favoriteIds);
    const favorites = posts
      .filter(post => favoriteIdSet.has(post.id))
      .sort(byAscendingId)
      .map(post => ({ post, isFavorite: true }));
    const regular = posts
      .filter(post => !favoriteIdSet.has(post.id))
      .map(post => ({ post, isFavorite: false }));
    return [...favorites, ...regular];
  },
);
```

### Don't

```tsx
const posts = useAppSelector(state =>
  state.posts.ids.map(id => state.posts.entities[id]),
);

return (
  <ScrollView>
    {posts.map(post => (
      <PostCard
        key={post?.id}
        post={post}
        onPress={() => onPostPress(post?.id)}
      />
    ))}
  </ScrollView>
);
```

## Checked by

- ESLint `no-console`. Enabled in stage 2.
- ESLint `react-hooks/exhaustive-deps` as an error and `react/no-unstable-nested-components` as a warning, both from `@react-native/eslint-config`; `--max-warnings=0` makes the warning fail `verify`. Enabled in stage 2.
- React DevTools profiling as a manual step for list changes.
- ESLint `no-restricted-imports` for `@faker-js/faker`. Enabled in stage 3.
- ESLint `react/no-unstable-nested-components` as an error in `src`. Enabled in stage 4.
