export const selectFavoriteIds = (state: RootState): readonly number[] =>
  state.favorites.ids;

export const selectIsFavorite = (state: RootState, postId: number): boolean =>
  state.favorites.ids.includes(postId);
