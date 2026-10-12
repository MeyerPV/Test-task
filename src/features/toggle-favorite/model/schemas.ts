import { z } from 'zod';
import { postIdSchema } from '@entities/post';

const hasUniqueItems = (items: readonly number[]): boolean =>
  new Set(items).size === items.length;

export const favoritesStateSchema = z.object({
  ids: z.array(postIdSchema).refine(hasUniqueItems, 'favorite ids are unique'),
});
