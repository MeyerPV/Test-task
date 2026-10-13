import { z } from 'zod';

const SECURE_URL_PREFIX = 'https://';

export const postIdSchema = z.int().positive();

const imageUrlSchema = z.string().startsWith(SECURE_URL_PREFIX);

const postFieldsSchema = z.object({
  id: postIdSchema,
  userId: z.int().positive(),
  title: z.string(),
  body: z.string(),
});

export const postSchema = postFieldsSchema.extend({
  thumbnailUrl: imageUrlSchema,
});

export const postDetailsSchema = postFieldsSchema.extend({
  imageUrl: imageUrlSchema,
});

export const persistedPostsSchema = z
  .object({
    ids: z.array(postIdSchema),
    entities: z.record(postIdSchema, postSchema),
    detailsById: z.record(postIdSchema, postDetailsSchema),
    isListLoaded: z.boolean(),
  })
  .refine(
    ({ ids, entities }) => ids.every(id => entities[id] !== undefined),
    'every persisted id has a post',
  );
