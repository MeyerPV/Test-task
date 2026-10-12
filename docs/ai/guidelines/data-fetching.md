# Data fetching

Server data is requested once, validated with zod, enriched with Faker images once, and persisted.

## Rules

1. **Network only through `src/shared/api`.** The transport inside `httpClient` is the global `fetch`. No axios, ky, superagent or other HTTP clients. Checked by ESLint `no-restricted-globals` (`fetch`, `XMLHttpRequest`, `WebSocket`) and `no-restricted-properties` (`globalThis.fetch` and the like) outside `src/shared/api`, and `no-restricted-imports` for HTTP clients everywhere.
2. **`httpClient.get(path, schema, { signal })` returns `Promise<z.output<typeof schema>>`.** The schema is required, so unvalidated data never leaves `shared/api`.

   - A non-2xx status throws `HttpError` with `status`.
   - An invalid JSON body throws `ResponseParseError`.
   - A body that fails `schema.safeParse` throws `ResponseParseError` with `z.prettifyError` as the reason; the reason is for debugging and never reaches the UI.
   - A failed `fetch` rejects with the platform `TypeError`.

   `signal` comes from the thunk API, so an aborted thunk cancels its request; nothing in the app aborts automatically. No timeout, no retry. Checked by `tsc` and review.

3. **`getErrorMessage(error)` turns any error into user-facing text**: 404 says the content is no longer available, 5xx says the server is not responding, other statuses say the request failed, `ResponseParseError` says the data cannot be read, `TypeError` says there is no connection, anything else is a generic message. Raw messages and status codes are never shown. Checked by review.
4. **Responses are validated by zod schemas in the `api` segment.**

   - `entities/post/api/postDto.ts` exposes `postDtoSchema` (positive integer `id` and `userId`, string `title` and `body`), `postDtoListSchema` and `createPostByIdDtoSchema(postId)`, which also rejects a post whose `id` differs from the requested one.
   - `PostDto` is `z.infer<typeof postDtoSchema>`; types of validated data are inferred, never written twice.
   - `z.object` strips unknown keys, so extra fields from the server never reach the store.
   - `import { z } from 'zod'` only; `zod/mini`, `zod/v3` and other entries are not used. zod is imported only in `src/shared/api`, the `api` and `model` segments, and `src/app/state`.
   - `z.url()` is not used: it calls `new URL()`, and the React Native `URL` polyfill does not implement `hostname` or `protocol`. Image URLs are checked with `z.string().startsWith('https://')`.

   No casts. Checked by `tsc`, the typed ESLint rules `no-unsafe-*` and `consistent-type-assertions`, and ESLint `no-restricted-imports` for `zod` outside the allowed folders and for `zod/*`.

5. **Requested once, guarded by persisted data.**

   - `fetchPosts` has a `condition` that skips when `ids` is not empty, the list request has succeeded, or it is `loading`.
   - `fetchPostDetails(postId)` skips when `detailsById[postId]` exists or its request is `loading`.
   - `ids` and `detailsById` are persisted, so after a restart the conditions skip and nothing is requested. The loading check also absorbs a repeated mount effect.

   Checked by review and the manual network check.

6. **`fulfilled` reducers never overwrite existing data.** The list is written only while `ids` is empty; details are written only when `detailsById[postId]` is missing. Checked by review.
7. **Faker images are created once, inside the thunk payload creator.**

   - `fetchPosts` maps every DTO with `mapPost(dto, createImageUrl(imageSize.thumbnail))`;
   - `fetchPostDetails` uses `mapPostDetails(dto, createImageUrl(imageSize.details))`.

   `mapPost` and `mapPostDetails` in `entities/post/lib` are pure and receive the URL. Images are never generated in reducers, `prepare` callbacks, selectors or components. Checked by ESLint `no-restricted-imports`: `@faker-js/faker/locale/en` only in `src/shared/lib/image-url`, `@shared/lib/image-url` only in `src/entities/post/model/thunks.ts`.

8. **`createImageUrl(size)` calls `faker.image.urlPicsumPhotos({ width: size, height: size, grayscale: false, blur: 0 })`** with `faker` from `@faker-js/faker/locale/en`. `grayscale` and `blur` are random by default and must be explicit; the seed in the URL path makes the image deterministic. Checked by review.
9. **Errors are serializable.** Thunks call `rejectWithValue(getErrorMessage(error))`; the text lands only in non-persisted request state. An aborted thunk returns the request to `idle`. The UI shows `ErrorState` with Retry, which dispatches the same thunk. Checked by `tsc`.
10. **The details screen renders only `detailsById[postId]`**, the result of `GET /posts/{id}`, never the list item. Checked by review.
11. **Forbidden: RTK Query, TanStack Query, SWR, pull-to-refresh, NetInfo-driven retries, polling.** Query libraries refetch by design (`keepUnusedDataFor` 60 s, `staleTime` 0, refetch on focus and reconnect, 24-hour `maxAge` for persisted caches); any refetch regenerates Faker URLs and breaks F5 and F6. Checked by ESLint `no-restricted-imports` and `check:deps`.

## Examples

### Do

```ts
const parseBody = <Schema extends z.ZodType>(
  schema: Schema,
  body: unknown,
): z.output<Schema> => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ResponseParseError(z.prettifyError(result.error));
  }
  return result.data;
};
```

```ts
export const postDtoSchema = z.object({
  userId: z.int().positive(),
  id: z.int().positive(),
  title: z.string(),
  body: z.string(),
});

export type PostDto = z.infer<typeof postDtoSchema>;

const getPosts = (signal?: AbortSignal): Promise<PostDto[]> =>
  httpClient.get('/posts', postDtoListSchema, { signal });
```

```ts
export const fetchPosts = createAppAsyncThunk<Post[], void>(
  'posts/fetchPosts',
  async (_, { signal, rejectWithValue }) => {
    try {
      const dtos = await postApi.getPosts(signal);
      return dtos.map(dto => mapPost(dto, createImageUrl(imageSize.thumbnail)));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { ids, listRequest } = getState().posts;
      const hasPosts = ids.length > 0 || listRequest.status === 'succeeded';
      return !hasPosts && !isRequestInFlight(listRequest);
    },
  },
);
```

### Don't

```tsx
useEffect(() => {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(posts =>
      setPosts(
        posts.map((post: PostDto) => ({ ...post, image: faker.image.url() })),
      ),
    );
}, []);
```

```ts
builder.addCase(fetchPostDetails.fulfilled, (state, action) => {
  state.detailsById[action.meta.arg] = {
    ...action.payload,
    imageUrl: faker.image.urlPicsumPhotos({ width: 300, height: 300 }),
  };
});
```

The first block bypasses `shared/api`, skips validation, keeps data out of the store and creates images during rendering. The second generates a random image inside a reducer, overwrites existing details, and leaves `grayscale` and `blur` random.

## Checked by

- Manual check from the Definition of Done: one `GET /posts` on the first launch, zero after a restart, identical image URLs. Reopening a post whose details are stored sends no request.
- ESLint `no-restricted-globals`, `no-restricted-properties` and `no-restricted-imports`, typed `no-unsafe-*` rules, `npm run check:deps`. Enabled in stage 3.
- `tsc` for the required schema argument of `httpClient.get`; ESLint `no-restricted-imports` for `zod` outside `src/shared/api`, the `api` and `model` segments and `src/app/state`, and for `zod/*`. Enabled in P-12.
