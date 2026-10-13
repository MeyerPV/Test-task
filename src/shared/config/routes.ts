export type RootStackParamList = {
  Posts: undefined;
  DetailsScreen: { postId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
