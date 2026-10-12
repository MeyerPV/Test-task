import { createSlice } from '@reduxjs/toolkit';
import type { Reducer } from '@reduxjs/toolkit';
import { getErrorMessage } from '@shared/api';
import { postsAdapter } from './postsAdapter';
import {
  IDLE_REQUEST,
  LOADING_REQUEST,
  SUCCEEDED_REQUEST,
} from './requestState';
import { persistedPostsSchema } from './schemas';
import { fetchPostDetails, fetchPosts } from './thunks';
import type { PostsState, RequestState } from './types';

type RejectedMeta = {
  aborted: boolean;
};

type RejectedAction = {
  payload: string | undefined;
  error: unknown;
  meta: RejectedMeta;
};

const toRejectedRequest = ({
  payload,
  error,
  meta,
}: RejectedAction): RequestState =>
  meta.aborted
    ? IDLE_REQUEST
    : { status: 'failed', error: payload ?? getErrorMessage(error) };

const initialState: PostsState = postsAdapter.getInitialState({
  detailsById: {},
  listRequest: IDLE_REQUEST,
  detailsRequestById: {},
});

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => {
        state.listRequest = LOADING_REQUEST;
      })
      .addCase(fetchPosts.fulfilled, (state, { payload }) => {
        if (state.ids.length === 0) {
          postsAdapter.setAll(state, payload);
        }
        state.listRequest = SUCCEEDED_REQUEST;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.listRequest = toRejectedRequest(action);
      })
      .addCase(fetchPostDetails.pending, (state, { meta }) => {
        state.detailsRequestById[meta.arg] = LOADING_REQUEST;
      })
      .addCase(fetchPostDetails.fulfilled, (state, { payload, meta }) => {
        if (state.detailsById[meta.arg] === undefined) {
          state.detailsById[meta.arg] = payload;
        }
        state.detailsRequestById[meta.arg] = SUCCEEDED_REQUEST;
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.detailsRequestById[action.meta.arg] = toRejectedRequest(action);
      });
  },
});

export const POSTS_PERSIST_KEYS = persistedPostsSchema.keyof()
  .options satisfies readonly (keyof PostsState)[];

export const postsReducer: Reducer<PostsState> = postsSlice.reducer;
