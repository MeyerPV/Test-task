export type RootStackParamList = {
  Posts: undefined;
  PostDetails: { postId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
