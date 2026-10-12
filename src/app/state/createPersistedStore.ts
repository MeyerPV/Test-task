import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { postsReducer } from '@entities/post';
import { favoritesReducer } from '@features/toggle-favorite';
import { createMmkvStorage } from '@shared/lib/storage';
import {
  createFavoritesPersistConfig,
  createPostsPersistConfig,
} from './persistConfigs';

const STORAGE_ID = 'firebird-posts';

const PERSIST_ACTION_TYPES = [
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
];

export const createPersistedStore = () => {
  const storage = createMmkvStorage(STORAGE_ID);
  const rootReducer = combineReducers({
    posts: persistReducer(createPostsPersistConfig(storage), postsReducer),
    favorites: persistReducer(
      createFavoritesPersistConfig(storage),
      favoritesReducer,
    ),
  });

  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: { ignoredActions: PERSIST_ACTION_TYPES },
      }),
  });
  const persistor = persistStore(store);

  return { store, persistor };
};
