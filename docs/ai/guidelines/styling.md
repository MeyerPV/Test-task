# Styling with NativeWind

NativeWind 4.2 on Tailwind CSS 3.4 is the only styling method. Every visual value comes from a theme token in `src/shared/theme/tokens.ts`.

NativeWind 5 is not used: it is a release candidate and, through `react-native-css`, requires `@expo/metro-config`, while Expo packages are forbidden.

## Setup

- `src/shared/theme/tokens.ts` is the single source of values. Every group is typed with `as const satisfies`. JS code imports tokens from `@shared/theme`: the navigation theme, the `ActivityIndicator` color, `android_ripple`, explicit image sizes.
- `tailwind.config.js` requires `./src/shared/theme/tokens` without an extension. Tailwind's `loadConfig` falls back to jiti with sucrase, so the TypeScript file loads in Tailwind, ESLint and Metro alike.
- `theme.colors`, `theme.spacing`, `theme.borderRadius`, `theme.borderWidth`, `theme.opacity` and `theme.fontSize` are set directly, not under `extend`: the default Tailwind palette and scales do not exist. Only `minHeight.touch` and `minWidth.touch` are added under `extend`.
- `content: ['./src/**/*.{ts,tsx}']` and `presets: [require('nativewind/preset')]`.
- `global.css` at the root holds the three `@tailwind` directives and is imported once in `src/app/index.tsx`. `global.d.css.ts` next to it declares that import for TypeScript through `allowArbitraryExtensions`, so `noUncheckedSideEffectImports` stays on.
- `metro.config.js` wraps the config with `withNativeWind(config, { input: './global.css', disableTypeScriptGeneration: true })`. Without the flag NativeWind writes `nativewind-env.d.ts` with a triple-slash directive, which is a comment.
- `className` types come from `"types": ["nativewind/types"]` in `tsconfig.json`.
- `babel.config.js` uses the presets `module:@react-native/babel-preset` and `nativewind/babel`, plus `@babel/plugin-transform-export-namespace-from` for zod and `module-resolver` for the layer aliases. The NativeWind preset already adds `react-native-reanimated/plugin`, which forwards to worklets; do not add `react-native-worklets/plugin` a second time.
- After a change in `tailwind.config.js`, `tokens.ts` or `global.css`, restart Metro with `npm start -- --reset-cache`.

## Tokens

| Group        | Tokens                                                                                                                                                                                                      | Example classes                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Colors       | `transparent`, `canvas`, `surface`, `surface-pressed`, `outline`, `ink`, `ink-muted`, `primary`, `primary-pressed`, `on-primary`, `favorite`, `favorite-outline`, `accent`, `on-accent`, `danger`, `ripple` | `bg-canvas`, `text-ink`, `border-favorite-outline` |
| Spacing      | `none` 0, `xxs` 2, `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 24, `xxl` 32                                                                                                                                      | `p-lg`, `gap-sm`, `mt-xs`, `size-xxl`              |
| Radius       | `none`, `sm`, `md`, `lg`, `full`                                                                                                                                                                            | `rounded-md`, `rounded-full`                       |
| Border width | `DEFAULT` 1, `strong` 2                                                                                                                                                                                     | `border`, `border-strong`                          |
| Opacity      | `disabled`, `pressed`, `full`                                                                                                                                                                               | `opacity-disabled`                                 |
| Font sizes   | `caption`, `body`, `subtitle`, `title`, `headline`, each with a line height; `icon-sm`, `icon-md`, `icon-lg` from `iconSize`                                                                                | `text-body`, `text-title`, `text-icon-md`          |
| Touch target | `touch` 44                                                                                                                                                                                                  | `min-h-touch`, `min-w-touch`                       |
| JS only      | `imageSize.thumbnail` 32, `imageSize.details` 300, `typography`, `iconSize`, `touchTarget`                                                                                                                  | passed to props such as `RemoteImage` sizes        |

A new visual value is a new token in `tokens.ts`, never a one-off class.

## Rules

1. **`className` for static styles, with token classes only.** A class that is not built from a token does not exist and fails `tailwindcss/no-custom-classname`.
2. **`style` only for values known at runtime**: safe-area insets, the screen width from `useWindowDimensions`, sizes passed as props. The value is a memoized variable, never an inline object or array literal.
3. **Component variants are typed class maps.** A map is `Record<Variant, string>` declared with `as const satisfies`, at module level, holding complete class strings.
4. **Conditional classes go through `clsx`.** Combine a base string, the variant from the map and `condition && 'classes'` in one `clsx` call. No interpolated class names such as `` `bg-${tone}` ``: Tailwind cannot see them.
5. **No arbitrary values in square brackets** such as `w-[300px]`, `mt-[13px]` or `bg-[#ffffff]`.
6. **No color literals in code.** Hex, `rgb()` and `rgba()` strings appear only in `tokens.ts`. Props that need a raw color import `colors` from `@shared/theme`.
7. **No `StyleSheet`.**
8. **The favorite highlight is `bg-favorite border-favorite-outline` plus the "In favorites" badge** rendered by the `posts-list` widget.

## Examples

### Do

```tsx
type ButtonVariant = 'primary' | 'outline';

const CONTAINER_CLASS_NAMES = {
  primary: 'border-primary bg-primary active:bg-primary-pressed',
  outline: 'border-primary bg-surface active:bg-surface-pressed',
} as const satisfies Record<ButtonVariant, string>;

<Pressable
  className={clsx(
    'min-h-touch flex-row items-center justify-center gap-sm rounded-md border px-lg',
    CONTAINER_CLASS_NAMES[variant],
    disabled && 'opacity-disabled',
  )}
/>;
```

```tsx
const insets = useSafeAreaInsets();
const bottomInsetStyle = useMemo(
  () => ({ paddingBottom: insets.bottom }),
  [insets.bottom],
);

return <View className="flex-1 bg-canvas" style={bottomInsetStyle} />;
```

```tsx
<ActivityIndicator color={colors.primary} />
```

### Don't

```tsx
<View style={{ padding: 12, backgroundColor: '#7B1FA2' }} />
<View className="w-[300px] bg-purple-700" />
<View className={`bg-${isFavorite ? 'favorite' : 'surface'}`} />
<View className={isFavorite ? 'bg-favorite p-md' : 'bg-surface p-md'} />
```

```ts
const styles = StyleSheet.create({ card: { borderRadius: 8 } });
```

## Checked by

- `react-native/no-inline-styles` and `react-native/no-color-literals` as errors.
- eslint-plugin-tailwindcss 3.18 as errors: `no-custom-classname`, `no-arbitrary-value`, `no-contradicting-classname`, `classnames-order`. 4.x needs ESLint 9 and Tailwind 4. Settings: `config` is the absolute path to `tailwind.config.js` (a relative path makes the plugin fail to resolve `tailwindcss`), `callees: ['clsx']`, `classRegex: '^(className|[a-zA-Z]+ClassName)$'`.
- The plugin checks `className` and `*ClassName` attributes and `clsx` arguments. It does not see string values inside class maps, so keep maps small, next to the component, and review them; every class string in `src` is also validated against the Tailwind config during the final recheck of a change.

Enabled in stage 4:

- ESLint `no-restricted-syntax` in `src`: object and array literals in `style` and `*Style` props; hex, `rgb()` and `hsl()` strings outside `src/shared/theme/tokens.ts`, also inside template literals; template literals in `className`, `*ClassName` and `clsx` arguments.
- ESLint `no-restricted-imports` for `StyleSheet` everywhere in `src`.
