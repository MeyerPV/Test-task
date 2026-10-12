import { httpClient } from '@shared/api';
import { createPostByIdDtoSchema, postDtoListSchema } from './postDto';
import type { PostDto } from './postDto';

const getPosts = (signal?: AbortSignal): Promise<PostDto[]> =>
  httpClient.get('/posts', postDtoListSchema, { signal });

const getPostById = (id: number, signal?: AbortSignal): Promise<PostDto> =>
  httpClient.get(`/posts/${id}`, createPostByIdDtoSchema(id), { signal });

export const postApi = { getPosts, getPostById } as const;
