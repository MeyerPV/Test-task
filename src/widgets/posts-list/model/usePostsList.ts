import { useCallback, useEffect } from 'react';
import { fetchPosts, selectPostsRequest } from '@entities/post';
import type { RequestState } from '@entities/post';
import { useAppDispatch, useAppSelector } from '@shared/lib/redux';
import { selectPostListItems } from './selectPostListItems';
import type { PostListItem } from './selectPostListItems';

type PostsListModel = {
  items: PostListItem[];
  request: RequestState;
  retry: () => void;
};

export const usePostsList = (): PostsListModel => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectPostListItems);
  const request = useAppSelector(selectPostsRequest);

  const requestPosts = useCallback(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    requestPosts();
  }, [requestPosts]);

  return { items, request, retry: requestPosts };
};
