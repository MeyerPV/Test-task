import type { createPersistedStore } from './createPersistedStore';

type AppStore = ReturnType<typeof createPersistedStore>['store'];

declare global {
  type RootState = ReturnType<AppStore['getState']>;
  type AppDispatch = AppStore['dispatch'];
}
