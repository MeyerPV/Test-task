import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction, Reducer } from '@reduxjs/toolkit';
import type { z } from 'zod';
import type { favoritesStateSchema } from './schemas';

export type FavoritesState = z.infer<typeof favoritesStateSchema>;

const initialState: FavoritesState = {
  ids: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    favoriteToggled: (state, { payload: postId }: PayloadAction<number>) => {
      const index = state.ids.indexOf(postId);
      if (index === -1) {
        state.ids.push(postId);
        return;
      }
      state.ids.splice(index, 1);
    },
  },
});

export const { favoriteToggled } = favoritesSlice.actions;

export const favoritesReducer: Reducer<FavoritesState> = favoritesSlice.reducer;
