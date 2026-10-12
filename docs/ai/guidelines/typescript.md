# TypeScript

## Compiler setup

- TypeScript 6.0.x from the React Native template. Do not upgrade to 7.x: typescript-eslint 8 supports TypeScript below 6.1.
- `tsconfig.json` extends `@react-native/typescript-config` and adds `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals` and `noUnusedParameters`, all `true`.
- `types: ["nativewind/types"]` replaces the base config's `["jest"]`: Jest is not installed, and NativeWind's `className` props load without a triple-slash directive.
- `noUncheckedSideEffectImports` is on by default in TypeScript 6. The side-effect import of `global.css` is declared by `global.d.css.ts` (`export {};`), which the base config's `allowArbitraryExtensions` picks up.
- `paths` map `@app/*`, `@pages/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*` to `./src/<layer>/*` without `baseUrl`, which TypeScript 6 deprecates. `babel.config.js` mirrors them through `babel-plugin-module-resolver`; both lists change together.

## Rules

1. **No `any`.** Neither written nor flowing in from untyped APIs. Data from the network, storage or `JSON.parse` is `unknown` and is narrowed by a zod schema: `httpClient.get` for responses, the validated `migrate` of `src/app/state/persistConfigs.ts` for restored slices. Checked by `@typescript-eslint/no-explicit-any` and the typed rules `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unsafe-call`, `no-unsafe-return`, `no-unsafe-argument`.
2. **No non-null assertion `!`.** Narrow with a condition or return early. Checked by `@typescript-eslint/no-non-null-assertion`.
3. **No TypeScript directives.** `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` are forbidden. Checked by `@typescript-eslint/ban-ts-comment` and `local-rules/no-comments`.
4. **No type assertions except `as const`.** Use annotations, `satisfies` and schemas. Checked by `@typescript-eslint/consistent-type-assertions` with `assertionStyle: 'never'`, which still allows `as const`.
5. **`type` over `interface`.** `interface` only where declaration merging is required: `ReactNavigation.RootParamList` in `src/shared/config/routes.ts`. Checked by `@typescript-eslint/consistent-type-definitions` with `'type'` and an override for `routes.ts`.
6. **Type-only imports use `import type`.** Checked by `@typescript-eslint/consistent-type-imports`.
7. **Request states are discriminated unions**, not loose booleans: `idle`, `loading`, `succeeded`, `failed` with `error`. Checked by review.
8. **Indexed access is `T | undefined`** because of `noUncheckedIndexedAccess`. Handle the missing case explicitly. Checked by `tsc`.
9. **`RootState` and `AppDispatch` are global types** declared in `src/app/state/types.ts` from the store factory. Selectors, thunks and the typed hooks use them without importing `app`. Exported reducers are annotated with `Reducer<XState>` so the store type does not depend on code that reads `RootState`, which would make it circular. Checked by `tsc`: a cycle turns `RootState` into `any` and fails the build.
10. **Exported functions in `api`, `lib` and `model` segments declare their return types.** Checked by review.
11. **Unions and maps use `as const satisfies`.** Token groups, class maps and appearance maps keep their literal types and are checked against their key type. Checked by `tsc`.
12. **Validated types are inferred from their schema.** `PostDto`, `Post`, `PostDetails` and `FavoritesState` are `z.infer<typeof schema>`; a type that a schema checks is never written by hand next to it. Checked by review.

## Examples

### Do

```ts
export const postSchema = postFieldsSchema.extend({
  thumbnailUrl: imageUrlSchema,
});

export type Post = z.infer<typeof postSchema>;
```

```ts
export type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'succeeded' }
  | { status: 'failed'; error: string };
```

```ts
const details = state.posts.detailsById[postId];
if (!details) {
  return null;
}
```

### Don't

```ts
const posts = (await response.json()) as PostDto[];
const title = state.posts.detailsById[postId]!.title;
const config: any = loadConfig();
```

```ts
type PostsState = {
  isLoading: boolean;
  isError: boolean;
  error?: string;
};
```

## Checked by

- `npm run typecheck` (`tsc --noEmit`), also in the husky `pre-commit` hook. All compiler flags enabled in stage 2.
- ESLint `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`, `consistent-type-imports` and `ban-ts-comment` as errors. Enabled in stage 2.
- ESLint with typed linting (`parserOptions.project: './tsconfig.json'`) for `consistent-type-assertions`, `consistent-type-definitions` and `no-unsafe-*`. Enabled in stage 3.
