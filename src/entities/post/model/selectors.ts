import { postsAdapter } from './postsAdapter';
import { IDLE_REQUEST } from './requestState';
import type { PostDetails, RequestState } from './types';

const postsSelectors = postsAdapter.getSelectors<RootState>(
  state => state.posts,
);

export const selectAllPosts = postsSelectors.selectAll;

export const selectPostById = postsSelectors.selectById;

export const selectPostsRequest = (state: RootState): RequestState =>
  state.posts.listRequest;

export const selectIsPostListLoaded = (state: RootState): boolean =>
  state.posts.isListLoaded;

export const selectPostDetails = (
  state: RootState,
  postId: number,
): PostDetails | undefined => state.posts.detailsById[postId];

export const selectPostDetailsRequest = (
  state: RootState,
  postId: number,
): RequestState => state.posts.detailsRequestById[postId] ?? IDLE_REQUEST;
