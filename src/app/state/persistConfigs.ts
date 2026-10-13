import { createMigrate } from 'redux-persist';
import type {
  MigrationManifest,
  PersistConfig,
  PersistMigrate,
  Storage,
} from 'redux-persist';
import { z } from 'zod';
import {
  persistedPostsSchema,
  postIdSchema,
  POSTS_PERSIST_KEYS,
} from '@entities/post';
import type { PostsState } from '@entities/post';
import { favoritesStateSchema } from '@features/toggle-favorite';
import type { FavoritesState } from '@features/toggle-favorite';

const POSTS_PERSIST_VERSION = 2;

const FAVORITES_PERSIST_VERSION = 1;

const storedPostIdsSchema = z.object({ ids: z.array(postIdSchema) });

const POSTS_MIGRATIONS: MigrationManifest = {
  2: state => {
    const storedPosts = storedPostIdsSchema.safeParse(state);
    if (state === undefined || !storedPosts.success) {
      return state;
    }
    const migratedState = {
      ...state,
      isListLoaded: storedPosts.data.ids.length > 0,
    };
    return migratedState;
  },
};

type PersistOptions = {
  key: string;
  version: number;
  migrations: MigrationManifest;
  schema: z.ZodType;
};

const createValidatedMigrate = (
  migrations: MigrationManifest,
  schema: z.ZodType,
): PersistMigrate => {
  const migrateVersions = createMigrate(migrations);
  return async (persistedState, currentVersion) => {
    const migratedState = await migrateVersions(persistedState, currentVersion);
    return schema.safeParse(migratedState).success ? migratedState : undefined;
  };
};

const createBaseConfig = (
  storage: Storage,
  { key, version, migrations, schema }: PersistOptions,
) => ({
  key,
  storage,
  version,
  timeout: 0,
  migrate: createValidatedMigrate(migrations, schema),
});

export const createPostsPersistConfig = (
  storage: Storage,
): PersistConfig<PostsState> => ({
  ...createBaseConfig(storage, {
    key: 'posts',
    version: POSTS_PERSIST_VERSION,
    migrations: POSTS_MIGRATIONS,
    schema: persistedPostsSchema,
  }),
  whitelist: [...POSTS_PERSIST_KEYS],
});

export const createFavoritesPersistConfig = (
  storage: Storage,
): PersistConfig<FavoritesState> =>
  createBaseConfig(storage, {
    key: 'favorites',
    version: FAVORITES_PERSIST_VERSION,
    migrations: {},
    schema: favoritesStateSchema,
  });
