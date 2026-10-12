import { createMigrate } from 'redux-persist';
import type { PersistConfig, PersistMigrate, Storage } from 'redux-persist';
import type { z } from 'zod';
import { persistedPostsSchema, POSTS_PERSIST_KEYS } from '@entities/post';
import type { PostsState } from '@entities/post';
import { favoritesStateSchema } from '@features/toggle-favorite';
import type { FavoritesState } from '@features/toggle-favorite';

const PERSIST_VERSION = 1;

const migrateVersions = createMigrate({});

const createValidatedMigrate =
  (schema: z.ZodType): PersistMigrate =>
  async (persistedState, currentVersion) => {
    const migratedState = await migrateVersions(persistedState, currentVersion);
    return schema.safeParse(migratedState).success ? migratedState : undefined;
  };

const createBaseConfig = (
  key: string,
  storage: Storage,
  schema: z.ZodType,
) => ({
  key,
  storage,
  version: PERSIST_VERSION,
  timeout: 0,
  migrate: createValidatedMigrate(schema),
});

export const createPostsPersistConfig = (
  storage: Storage,
): PersistConfig<PostsState> => ({
  ...createBaseConfig('posts', storage, persistedPostsSchema),
  whitelist: [...POSTS_PERSIST_KEYS],
});

export const createFavoritesPersistConfig = (
  storage: Storage,
): PersistConfig<FavoritesState> =>
  createBaseConfig('favorites', storage, favoritesStateSchema);
