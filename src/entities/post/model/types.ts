import type { EntityState } from '@reduxjs/toolkit';
import type { z } from 'zod';
import type { postDetailsSchema, postSchema } from './schemas';

export type Post = z.infer<typeof postSchema>;

export type PostDetails = z.infer<typeof postDetailsSchema>;

export type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'succeeded' }
  | { status: 'failed'; error: string };

export type PostsState = EntityState<Post, number> & {
  detailsById: Record<number, PostDetails>;
  isListLoaded: boolean;
  listRequest: RequestState;
  detailsRequestById: Record<number, RequestState>;
};
