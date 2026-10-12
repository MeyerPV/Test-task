# Code style

## Rules

1. **No comments in code.** Applies to every code file: `src/`, root configs, `scripts/`, `eslint-local-rules.js`. That covers line and block comments, JSDoc, TODOs, `eslint-disable` and `@ts-*` directives, and triple-slash directives.

   - There are no exceptions. NativeWind types come from `types` in `tsconfig.json`, and `disableTypeScriptGeneration` stops NativeWind from writing `nativewind-env.d.ts`.
   - Intent goes into names, small functions and these guides.
   - Comments in template files are removed when the files are first touched.

   Checked by ESLint `local-rules/no-comments`: a rule in `eslint-local-rules.js`, loaded through eslint-plugin-local-rules, that reports every comment except a shebang. `noInlineConfig: true` keeps directive comments from disabling it.

2. **Named exports only.** `index.ts` files re-export by name; `export *` is not used.

   - The only exception is `steiger.config.mjs`, which Steiger loads as a default export.
   - CommonJS configs keep `module.exports`.

   Checked by ESLint `no-restricted-syntax` for `ExportDefaultDeclaration`, `ExportAllDeclaration` and `ExportSpecifier[exported.name="default"]`, with an override for `steiger.config.mjs`.

3. **Components are arrow-function constants** with a `XProps` type declared right above them, one component per file, and the file named after the component. Checked by review.
4. **Naming.**

   - Components and their files: PascalCase.
   - Hooks: `useX`; slices: `xSlice.ts`; selectors: `selectX`; thunks: `fetchX`.
   - zod schemas: `xSchema`, factories `createXSchema(arg)`; DTO schemas sit in `api/xDto.ts`, model schemas in `model/schemas.ts`.
   - Actions: past-tense events such as `favoriteToggled`.
   - Booleans: `is`, `has` or `should` prefixes.
   - Config constants: `UPPER_SNAKE_CASE`.
   - Slice and folder names: kebab-case.

   Checked by review and Steiger `fsd/inconsistent-naming` for slice names.

5. **Formatting is Prettier's**, with the template config. Run `npx prettier --write` on touched files. Checked by `npm run format:check`, part of `verify`.
6. **No `console`, no unused code.** Scripts in `scripts/` print through `process.stdout` and `process.stderr`. Checked by ESLint `no-console`, `@typescript-eslint/no-unused-vars` and `tsc` `noUnusedLocals`, `noUnusedParameters`.
7. **UI copy is English and written inline in the slice's `ui` files.** No i18n layer. Checked by review.
8. **Early returns over nested conditions; one level of abstraction per function.** Checked by review.

## Examples

### Do

```ts
export { PostCard } from './ui/PostCard';
export { selectAllPosts, selectPostById } from './model/selectors';
export type { Post } from './model/types';
```

```tsx
type EmptyStateProps = {
  title: string;
  message?: string;
};

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <View
    accessible
    accessibilityRole="summary"
    className="flex-1 items-center justify-center gap-sm bg-canvas p-xl"
  >
    <Typography variant="title">{title}</Typography>
    {message ? <Typography tone="muted">{message}</Typography> : null}
  </View>
);
```

### Don't

```tsx
// Badge for favorite posts
export default function Badge(props) {
  return <Text style={{ color: 'white' }}>{props.label}</Text>;
}
```

```ts
export * from './model/selectors';
```

## Checked by

- ESLint `no-console`, `@typescript-eslint/no-unused-vars`, with lint-staged on commit. Enabled in stage 2.
- ESLint `local-rules/no-comments` and `no-restricted-syntax` for exports. Enabled in stage 3.
- `npm run format:check` with `.prettierignore` for vendored gems, Pods, build outputs, chat exports and `package-lock.json`. Enabled in stage 3.
