# Navigation

React Navigation 7 with a native stack of two screens: `Posts` and `PostDetails`.

## Rules

1. **Dynamic API with `createNativeStackNavigator<RootStackParamList>()`.** The static API is not used: its inferred param types would live in `app`, and pages would have to import upward. Checked by review.
2. **Route names and params live in `src/shared/config/routes.ts`.**

   - `RootStackParamList` is `{ Posts: undefined; PostDetails: { postId: number } }`.
   - The same file augments `ReactNavigation.RootParamList` with it inside `declare global`, so `useNavigation` and `navigation.navigate` are typed everywhere.

   Route names are string literal keys of `RootStackParamList`; a typo fails `tsc`. Checked by `tsc`.

3. **Params carry ids only.** `PostDetails` receives `postId: number`, never a post object; the screen reads data from the store. Checked by `tsc` through `RootStackParamList`.
4. **Only `src/app/navigation` and `src/pages` use React Navigation APIs.** Widgets, features and entities receive callbacks such as `onPostPress(postId)` and never call `useNavigation` or `useRoute`. Checked by ESLint `no-restricted-imports` for `@react-navigation/*` outside `src/app/navigation`, `src/pages` and `src/shared/config`.
5. **Pages are typed through screen props:** `NativeStackScreenProps<RootStackParamList, 'PostDetails'>`. No untyped `useNavigation()`. Checked by `tsc`.
6. **Native headers** with titles "Posts" and "Post". No custom header components. Colors come from tokens: the navigation theme maps `primary`, `canvas`, `surface`, `ink`, `outline` and `accent`; `headerTintColor` is `primary` for the back button and `headerTitleStyle` keeps the title `ink`. Checked by review.
7. **`NavigationContainer` lives in `RootNavigator`** inside `src/app/navigation`. No navigation state persistence and no deep links: neither is required. Checked by review.

## Examples

### Do

```tsx
type PostsScreenProps = NativeStackScreenProps<RootStackParamList, 'Posts'>;

export const PostsScreen = ({ navigation }: PostsScreenProps) => {
  const handlePostPress = useCallback(
    (postId: number) => navigation.navigate('PostDetails', { postId }),
    [navigation],
  );

  return (
    <Screen>
      <PostsList onPostPress={handlePostPress} />
    </Screen>
  );
};
```

```ts
export type RootStackParamList = {
  Posts: undefined;
  PostDetails: { postId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### Don't

```tsx
export const PostCard = ({ post }: PostCardProps) => {
  const navigation = useNavigation();

  return <Card onPress={() => navigation.navigate('PostDetails', { post })} />;
};
```

The entity reaches into navigation and passes a whole object as a param.

## Checked by

- `npm run typecheck` for route names and params. Enabled in stage 2.
- ESLint `no-restricted-imports` for `@react-navigation/*` outside allowed folders. Enabled in stage 4.
