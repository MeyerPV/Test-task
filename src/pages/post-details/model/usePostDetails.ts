import { useCallback, useEffect } from 'react';
import {
  fetchPostDetails,
  selectPostDetails,
  selectPostDetailsRequest,
} from '@entities/post';
import type { PostDetails, RequestState } from '@entities/post';
import { useAppDispatch, useAppSelector } from '@shared/lib/redux';

type PostDetailsModel = {
  details: PostDetails | undefined;
  request: RequestState;
  retry: () => void;
};

export const usePostDetails = (postId: number): PostDetailsModel => {
  const dispatch = useAppDispatch();
  const details = useAppSelector(state => selectPostDetails(state, postId));
  const request = useAppSelector(state =>
    selectPostDetailsRequest(state, postId),
  );

  const requestDetails = useCallback(() => {
    dispatch(fetchPostDetails(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    requestDetails();
  }, [requestDetails]);

  return { details, request, retry: requestDetails };
};
