# Accessibility

Every screen works with VoiceOver and TalkBack. Semantics live in `src/shared/ui`, so slices pass labels and states instead of wiring accessibility props by hand.

## Rules

1. **Every interactive element has a role, a label and, when the result is not obvious, a hint.**

   - `Button`: role `button`, the label equals the visible text, `accessibilityState` carries `selected` and `disabled`.
   - `Card`: role `button`, one label for the whole card and a hint; `PostCard` passes the title, plus the badge text when there is one, and "Opens post details".

   Checked by review and the `Card` prop types: `accessibilityLabel` is required.

2. **One focus stop per card.** The whole `Card` is a single `Pressable`; its children are not separate elements. Checked by review and a screen reader pass.
3. **Decorative content is hidden from screen readers.** `RemoteImage` without `accessibilityLabel` is decorative: `accessible={false}`, role `none`, `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`. `StarIcon` is always hidden and ignores font scaling. Post thumbnails and the details image are decorative because the title next to them carries the meaning. Checked by review.
4. **Headings use the header role.** `Typography` with `asHeader` renders role `header`; every other text has role `text`. The details title is a header; screen titles come from the native stack header. Checked by review.
5. **State changes are announced.**

   - `Loader`: role `progressbar`, `accessibilityState.busy`, a visible label and `accessibilityLiveRegion="polite"`.
   - `ErrorState`: the title and message form one element with role `alert` and `accessibilityLiveRegion="assertive"`; iOS ignores live regions, so it also calls `AccessibilityInfo.announceForAccessibility` on iOS.
   - `FavoriteToggleButton`: `accessibilityState.selected` reflects the favorite status, and after a press it announces "Added to favorites" or "Removed from favorites".
   - `EmptyState`: one element with role `summary`.

   Checked by review and a screen reader pass.

6. **Lists are named.** The posts `FlatList` has role `list` and the label "Posts". Checked by review.
7. **Meaning never depends on color alone.** A favorite card has the highlight colors, the visible "In favorites" badge, and the badge text in its label. The toggle changes its label, not only its style. Checked by review.
8. **Touch targets are at least 44 points.** `Button` uses `min-h-touch min-w-touch`, `Card` uses `min-h-touch`, from `touchTarget.min` in `tokens.ts`. Checked by review.
9. **Text scales with system settings.** `Typography` keeps font scaling on; long titles wrap or truncate with `numberOfLines` and never overflow. Only decorative glyphs opt out. Checked by a manual pass with the largest font size.
10. **Contrast meets WCAG AA (4.5:1 for text).** Pairs from `tokens.ts`:

    | Text on background                             | Ratio            |
    | ---------------------------------------------- | ---------------- |
    | `ink` on `canvas`, `surface`, `favorite`       | 15.9, 17.3, 16.1 |
    | `ink-muted` on `canvas`, `surface`, `favorite` | 5.5, 5.9, 5.5    |
    | `primary` on `surface`                         | 7.9              |
    | `on-primary` on `primary`                      | 7.9              |
    | `on-accent` on `accent`                        | 5.0              |
    | `danger` on `surface`                          | 6.5              |

    A new color token is checked against its backgrounds before it is used. Checked by review.

11. **Copy is plain English.** Labels and hints describe the result ("Opens post details", "Sends the request again"), not the gesture. Error texts come from `getErrorMessage` and never show status codes. Checked by review.

## Examples

### Do

```tsx
<Button
  label={appearance.label}
  variant={appearance.variant}
  icon={<StarIcon isFilled={isFavorite} tone={appearance.iconTone} />}
  isSelected={isFavorite}
  accessibilityHint={TOGGLE_HINT}
  onPress={handlePress}
/>
```

```tsx
<Typography variant="headline" asHeader>
  {details.title}
</Typography>
```

### Don't

```tsx
<Pressable onPress={handlePress}>
  <Image source={{ uri: post.thumbnailUrl }} />
  <Text>{post.title}</Text>
  <Text>★</Text>
</Pressable>
```

The press target has no role, label or hint, the image and the star are read aloud, and the favorite state is only a glyph.

## Checked by

- Review of `src/shared/ui` and of every new interactive element.
- A manual VoiceOver pass on iOS and a TalkBack pass on Android when UI changes: every card is one stop with its title, favorites say "In favorites", the toggle reports its state and announces the change.
- No accessibility lint plugin: `eslint-plugin-react-native-a11y` was excluded by the user in P-05.
