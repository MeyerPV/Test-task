import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { imageSize } from '@shared/theme';
import { Badge, Card, RemoteImage, StarIcon, Typography } from '@shared/ui';
import type { Post } from '../model/types';

const OPEN_DETAILS_HINT = 'Opens post details';

type PostCardProps = {
  post: Post;
  onPress: (postId: number) => void;
  isHighlighted?: boolean;
  badgeLabel?: string;
};

const PostCardContent = ({
  post,
  onPress,
  isHighlighted = false,
  badgeLabel,
}: PostCardProps) => {
  const handlePress = useCallback(() => onPress(post.id), [onPress, post.id]);
  const accessibilityLabel = badgeLabel
    ? `${post.title}. ${badgeLabel}`
    : post.title;

  return (
    <Card
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={OPEN_DETAILS_HINT}
      isHighlighted={isHighlighted}
      onPress={handlePress}
    >
      <View className="flex-row items-start gap-md">
        <RemoteImage
          uri={post.thumbnailUrl}
          width={imageSize.thumbnail}
          height={imageSize.thumbnail}
          className="rounded-sm"
        />
        <View className="flex-1 gap-xs">
          {badgeLabel ? (
            <Badge
              label={badgeLabel}
              icon={<StarIcon isFilled size="sm" tone="on-accent" />}
            />
          ) : null}
          <Typography variant="subtitle" numberOfLines={2}>
            {post.title}
          </Typography>
          <Typography tone="muted" numberOfLines={2}>
            {post.body}
          </Typography>
        </View>
      </View>
    </Card>
  );
};

export const PostCard = memo(PostCardContent);
