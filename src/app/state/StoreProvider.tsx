import { useState } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Loader } from '@shared/ui';
import { createPersistedStore } from './createPersistedStore';

type StoreProviderProps = {
  children: ReactNode;
};

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [{ store, persistor }] = useState(createPersistedStore);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Loader />}>
        {children}
      </PersistGate>
    </Provider>
  );
};
