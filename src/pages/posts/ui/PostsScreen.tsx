import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PostsList } from '@widgets/posts-list';
import type { RootStackParamList } from '@shared/config';
import { Screen } from '@shared/ui';

type PostsScreenProps = NativeStackScreenProps<RootStackParamList, 'Posts'>;

export const PostsScreen = ({ navigation }: PostsScreenProps) => {
  const handlePostPress = useCallback(
    (postId: number) => navigation.navigate('DetailsScreen', { postId }),
    [navigation],
  );

  return (
    <Screen>
      <PostsList onPostPress={handlePostPress} />
    </Screen>
  );
};
