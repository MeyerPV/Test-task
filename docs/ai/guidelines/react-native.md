# React Native

## Platform rules

1. **React Native Community CLI only.** No `expo`, `expo-*` or `@expo/*` packages, no `npx expo` commands, no Expo config plugins. Checked by `scripts/check-deps.mjs`, which scans every package in `package-lock.json`.
2. **New Architecture and Hermes stay on.** React Native 0.87 has no legacy architecture; do not add flags that try to turn it off. Checked by review of `android/gradle.properties` and `ios/Podfile`.
3. **Every dependency is on the allowlist** in `scripts/check-deps.mjs`. The script fails on any package missing from it and on a non-empty `peerDependencies`, `optionalDependencies` or `bundleDependencies`. Checked by `npm run check:deps`, part of `verify`.
4. **A native dependency joins the allowlist only after review:**

   - its `peerDependencies` accept `react-native` 0.87 and React 19.2;
   - it supports the New Architecture (Fabric component, TurboModule or Nitro module);
   - it has no Expo packages in its dependency tree;
   - both platforms build after `npm install`, followed by `npm run pods` because `npm install <package>` skips `postinstall`.

   Record the result in the compatibility list below. Checked by review and `check:deps`.

5. **Safe areas come from `react-native-safe-area-context`**: `SafeAreaProvider` in `src/app/index.tsx`, the `Screen` component for screen edges, `useSafeAreaInsets` for scroll content padding. React Native's own `SafeAreaView` is not used. Checked by ESLint `no-restricted-imports`.
6. **Platform branches are rare and local.** Use `Platform.select` or `Platform.OS` inside `shared/ui` when a difference is unavoidable, as `ErrorState` does for the iOS announcement; no `.ios.tsx` or `.android.tsx` files without a reason in the pull request. Checked by review.

## Reuse `src/shared/ui`

Outside `src/shared/ui`, layers compose screens from `@shared/ui` components and React Native layout containers only.

- Allowed from `react-native` everywhere: `View`, `FlatList`, `ScrollView`, `Platform`, `useWindowDimensions`, `AccessibilityInfo`; `StatusBar` only in `src/app/index.tsx`.
- Allowed only inside `src/shared/ui`: `Text`, `Pressable`, `TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback`, `Image`, `ImageBackground`, `ActivityIndicator`, `Button`, `Switch`, `TextInput`, `Modal`.
- Never used: `SafeAreaView` from `react-native`, `StyleSheet`.
- A missing primitive is added to `src/shared/ui` as a generic component without business terms, then used.

Available components:

| Component     | Purpose and props                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Typography`  | Text with `variant` (`headline`, `title`, `subtitle`, `body`, `caption`), `tone`, `numberOfLines`; `asHeader` gives the header role |
| `Button`      | Visible text `label`, `variant` `primary` or `outline`, optional `icon`, `isSelected`, `isDisabled`, `accessibilityHint`            |
| `Card`        | Pressable container with one label and hint, `isHighlighted`, Android ripple from tokens                                            |
| `Badge`       | Small label with `tone` `accent` or `primary` and an optional `icon`                                                                |
| `StarIcon`    | Filled or outlined star with `size` and `tone`, hidden from screen readers                                                          |
| `RemoteImage` | Image with explicit `width` and `height` and a placeholder background; decorative unless it gets `accessibilityLabel`               |
| `Screen`      | Canvas background with safe-area padding for the given `edges`                                                                      |
| `Loader`      | Spinner with a visible label, progress bar role and live region                                                                     |
| `ErrorState`  | Title, message and Retry button, alert role, announced on iOS                                                                       |
| `EmptyState`  | Title and optional message for an empty result                                                                                      |

Visible copy stays: buttons have text labels ("Add to favorites", "Remove from favorites", "Retry"), favorite cards show the "In favorites" badge. Touch targets use the `min-h-touch` and `min-w-touch` tokens.

### Do

```tsx
import { View } from 'react-native';
import { imageSize } from '@shared/theme';
import { Badge, Card, RemoteImage, StarIcon, Typography } from '@shared/ui';

<Card
  accessibilityLabel={accessibilityLabel}
  accessibilityHint={OPEN_DETAILS_HINT}
  isHighlighted={isHighlighted}
  onPress={handlePress}
>
  <View className="flex-row items-start gap-md">
    <RemoteImage
      uri={post.thumbnailUrl}
      width={imageSize.thumbnail}
      height={imageSize.thumbnail}
      className="rounded-sm"
    />
    <View className="flex-1 gap-xs">
      {badgeLabel ? (
        <Badge
          label={badgeLabel}
          icon={<StarIcon isFilled size="sm" tone="on-accent" />}
        />
      ) : null}
      <Typography variant="subtitle" numberOfLines={2}>
        {post.title}
      </Typography>
    </View>
  </View>
</Card>;
```

### Don't

```tsx
import { Image, Text, TouchableOpacity } from 'react-native';

export const PostRow = ({ post }: PostRowProps) => (
  <TouchableOpacity>
    <Text className="text-title">{post.title}</Text>
    <Image source={{ uri: post.thumbnailUrl }} className="size-xxl" />
  </TouchableOpacity>
);
```

## Compatibility list

| Package                                         | Version | Native | Notes                                                                                                                                                                                        |
| ----------------------------------------------- | ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-native`                                  | 0.87.1  | yes    | New Architecture and Hermes always on; Node `^22.13 \|\| ^24.3`                                                                                                                              |
| `react`                                         | 19.2.3  | no     | Pinned by the template; RN peer `^19.2.3`                                                                                                                                                    |
| `@types/react`                                  | 19.2.x  | dev    | `~19.2.18` follows the React runtime line; 19.3 types describe APIs that React 19.2.3 lacks. RN peer `^19.1.1`                                                                               |
| `@react-navigation/native`                      | 7.5.x   | no     | Peer `react >= 18.2`, `react-native *`                                                                                                                                                       |
| `@react-navigation/native-stack`                | 7.20.x  | no     | Peer `react-native-screens >= 4`, `react-native-safe-area-context >= 4`                                                                                                                      |
| `react-native-screens`                          | 4.29.x  | yes    | Fabric support, peer `*`                                                                                                                                                                     |
| `react-native-safe-area-context`                | 5.x     | yes    | Fabric support, peer `*`                                                                                                                                                                     |
| `@reduxjs/toolkit`                              | 2.13.x  | no     | Peer `react ^18 \|\| ^19`                                                                                                                                                                    |
| `react-redux`                                   | 9.3.x   | no     | Peer `react ^18 \|\| ^19`, `redux ^5`                                                                                                                                                        |
| `redux-persist`                                 | 6.0.0   | no     | Peer `redux > 4`; last release 2019, isolated in `app/state`                                                                                                                                 |
| `react-native-mmkv`                             | 4.3.x   | yes    | Nitro module, New Architecture only, RN >= 0.76; API `createMMKV`, `getString`, `set`, `remove`                                                                                              |
| `react-native-nitro-modules`                    | 0.37.x  | yes    | Required by MMKV 4                                                                                                                                                                           |
| `@faker-js/faker`                               | 10.6.x  | no     | ESM only; import `@faker-js/faker/locale/en`                                                                                                                                                 |
| `nativewind`                                    | 4.2.x   | no     | Depends on `react-native-css-interop` 0.2.x: peer `tailwindcss ~3`, `react-native-reanimated >= 3.6.2`                                                                                       |
| `react-native-reanimated`                       | 4.7.x   | yes    | Peer `react-native 0.86 - 0.88`, `react-native-worklets 0.13.x`; New Architecture only                                                                                                       |
| `react-native-worklets`                         | 0.13.x  | yes    | Peer `react-native 0.86 - 0.88`; the NativeWind Babel preset already adds the plugin                                                                                                         |
| `clsx`                                          | 2.1.x   | no     | No peers, no dependencies; joins class strings in `shared/ui`                                                                                                                                |
| `zod`                                           | 4.6.x   | no     | No peers, no dependencies; TypeScript >= 5.5. Hermes allows `new Function`, so object schemas use the zod JIT; `z.url()` is avoided because the React Native `URL` polyfill lacks `hostname` |
| `@babel/plugin-transform-export-namespace-from` | 7.29.x  | dev    | Babel 7 line, peer `@babel/core ^7`; 8.x needs `@babel/core` 8. Transforms the `export * as` syntax of zod for Metro                                                                         |
| `tailwindcss`                                   | 3.4.x   | dev    | Not 4.x: NativeWind 4 requires `~3`                                                                                                                                                          |
| `eslint-plugin-tailwindcss`                     | 3.18.x  | dev    | Not 4.x: it needs ESLint 9 and Tailwind 4                                                                                                                                                    |
| `eslint-plugin-local-rules`                     | 3.0.x   | dev    | No dependencies, no peers; loads `eslint-local-rules.js` from the root for `local-rules/no-comments`                                                                                         |

Not used, and must not be added: Expo packages, AsyncStorage, other state managers, query libraries, HTTP clients, image cache libraries. Any package outside the list above and the dev tooling in `AGENTS.md` needs the user's approval.

### Known warning

`react-native-css-interop` 0.2.7 calls `remapProps(ImageBackground)` when it loads, and React Native 0.87 prints "ImageBackground is deprecated" for that access. In development LogBox shows it as "Open debugger to view warnings" on every launch. The project does not use `ImageBackground`; the warning is not suppressed, because `LogBox.ignoreLogs` would hide it for every caller. It disappears when NativeWind stops touching the export.

On a cold Metro cache, Metro also warns that the module `react-native/src/private/featureflags/ReactNativeFeatureFlags` is not listed in the `exports` of `react-native`. The import comes from `@react-native/virtualized-lists` 0.87.1, part of React Native itself; Metro falls back to file resolution, and there is nothing to fix in the project.

## Dependency audit

`npm audit` on 2026-10-13 reports one advisory, and it reaches only build tooling:

- `braces` 3.0.3, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), high: deeply nested brace patterns overflow the stack. No patched release exists. It comes through `micromatch`, `fast-glob` and `chokidar` in Metro, the React Native CLI, Tailwind, eslint-plugin-tailwindcss and Steiger, so `npm audit` counts 27 packages. Every pattern comes from the project's own config, and none of these modules is in the app bundle. Accepted until `braces` ships a fix.
- `postcss-selector-parser` below 7.1.6, [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf), moderate: fixed by `overrides` in `package.json`. Tailwind 3.4 asks for `^6.1.2`, and the 6.x line has no patched release. With 7.1.6 the CSS that Tailwind builds from `global.css` is byte-identical. Remove the override when no package depends on 6.x.
- Never run `npm audit fix --force`: its fixes downgrade `react-native` to 0.72, the CLI to 13 and NativeWind to 2. Plain `npm audit fix` changes nothing useful either; it only records `lightningcss` binaries for other platforms.

`npm audit signatures` verifies the registry signatures of every installed package.

## Checked by

- `npm run check:deps`: allowlist and Expo scan of `package-lock.json`. Enabled in stage 3.
- `npm audit` and `npm audit signatures` by hand when dependencies change; the accepted advisory is listed above.
- ESLint `no-restricted-imports`: visual primitives outside `src/shared/ui`, `StatusBar` outside `src/app/index.tsx`, `SafeAreaView` and `StyleSheet` everywhere in `src`. Enabled in stage 4.
