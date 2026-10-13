import { useCallback, useEffect } from 'react';
import {
  fetchPosts,
  selectIsPostListLoaded,
  selectPostsRequest,
} from '@entities/post';
import type { RequestState } from '@entities/post';
import { useAppDispatch, useAppSelector } from '@shared/lib/redux';
import { selectPostListItems } from './selectPostListItems';
import type { PostListItem } from './selectPostListItems';

type PostsListModel = {
  items: PostListItem[];
  isListLoaded: boolean;
  request: RequestState;
  retry: () => void;
};

export const usePostsList = (): PostsListModel => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectPostListItems);
  const isListLoaded = useAppSelector(selectIsPostListLoaded);
  const request = useAppSelector(selectPostsRequest);

  const requestPosts = useCallback(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    requestPosts();
  }, [requestPosts]);

  return { items, isListLoaded, request, retry: requestPosts };
};
