import { useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '@entities/post';
import { spacing } from '@shared/theme';
import { EmptyState, ErrorState, Loader } from '@shared/ui';
import type { PostListItem } from '../model/selectPostListItems';
import { usePostsList } from '../model/usePostsList';

const FAVORITE_BADGE_LABEL = 'In favorites';

const keyExtractor = ({ post }: PostListItem): string => String(post.id);

type PostsListProps = {
  onPostPress: (postId: number) => void;
};

export const PostsList = ({ onPostPress }: PostsListProps) => {
  const { items, isListLoaded, request, retry } = usePostsList();
  const insets = useSafeAreaInsets();
  const contentInsetStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + spacing.lg }),
    [insets.bottom],
  );

  const renderItem = useCallback<ListRenderItem<PostListItem>>(
    ({ item }) => (
      <PostCard
        post={item.post}
        onPress={onPostPress}
        isHighlighted={item.isFavorite}
        badgeLabel={item.isFavorite ? FAVORITE_BADGE_LABEL : undefined}
      />
    ),
    [onPostPress],
  );

  if (items.length === 0) {
    if (isListLoaded) {
      return (
        <EmptyState
          title="No posts"
          message="The server returned an empty list."
        />
      );
    }
    if (request.status === 'failed') {
      return (
        <ErrorState
          title="Posts could not be loaded"
          message={request.error}
          onRetry={retry}
        />
      );
    }
    return <Loader label="Loading posts" />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      accessibilityRole="list"
      accessibilityLabel="Posts"
      className="flex-1"
      contentContainerClassName="gap-md p-lg"
      contentContainerStyle={contentInsetStyle}
    />
  );
};
