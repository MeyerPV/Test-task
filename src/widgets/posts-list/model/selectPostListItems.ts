import { createSelector } from '@reduxjs/toolkit';
import { selectAllPosts } from '@entities/post';
import type { Post } from '@entities/post';
import { selectFavoriteIds } from '@features/toggle-favorite';

export type PostListItem = {
  post: Post;
  isFavorite: boolean;
};

const byAscendingId = (left: Post, right: Post): number => left.id - right.id;

export const selectPostListItems = createSelector(
  [selectAllPosts, selectFavoriteIds],
  (posts, favoriteIds): PostListItem[] => {
    const favoriteIdSet = new Set(favoriteIds);
    const favorites = posts
      .filter(post => favoriteIdSet.has(post.id))
      .sort(byAscendingId)
      .map(post => ({ post, isFavorite: true }));
    const regular = posts
      .filter(post => !favoriteIdSet.has(post.id))
      .map(post => ({ post, isFavorite: false }));
    return [...favorites, ...regular];
  },
);
