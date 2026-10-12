import { getErrorMessage } from '@shared/api';
import { createImageUrl } from '@shared/lib/image-url';
import { createAppAsyncThunk } from '@shared/lib/redux';
import { imageSize } from '@shared/theme';
import { postApi } from '../api/postApi';
import { mapPost, mapPostDetails } from '../lib/mapPost';
import { isRequestInFlight } from './requestState';
import type { Post, PostDetails } from './types';

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

export const fetchPostDetails = createAppAsyncThunk<PostDetails, number>(
  'posts/fetchPostDetails',
  async (postId, { signal, rejectWithValue }) => {
    try {
      const dto = await postApi.getPostById(postId, signal);
      return mapPostDetails(dto, createImageUrl(imageSize.details));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (postId, { getState }) => {
      const { detailsById, detailsRequestById } = getState().posts;
      const hasDetails = detailsById[postId] !== undefined;
      return !hasDetails && !isRequestInFlight(detailsRequestById[postId]);
    },
  },
);
