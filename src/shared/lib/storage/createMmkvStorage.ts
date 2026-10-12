import { createMMKV } from 'react-native-mmkv';
import type { Storage } from 'redux-persist';

export type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export const createMmkvStorage = (id: string): KeyValueStorage => {
  const mmkv = createMMKV({ id });

  const storage: KeyValueStorage = {
    getItem: key => Promise.resolve(mmkv.getString(key) ?? null),
    setItem: (key, value) => {
      mmkv.set(key, value);
      return Promise.resolve();
    },
    removeItem: key => {
      mmkv.remove(key);
      return Promise.resolve();
    },
  };

  return storage satisfies Storage;
};
