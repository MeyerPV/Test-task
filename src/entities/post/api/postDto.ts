import { z } from 'zod';

export const postDtoSchema = z.object({
  userId: z.int().positive(),
  id: z.int().positive(),
  title: z.string(),
  body: z.string(),
});

export const postDtoListSchema = z.array(postDtoSchema);

export const createPostByIdDtoSchema = (postId: number): typeof postDtoSchema =>
  postDtoSchema.refine(
    dto => dto.id === postId,
    `the post id does not match the requested ${postId}`,
  );

export type PostDto = z.infer<typeof postDtoSchema>;
