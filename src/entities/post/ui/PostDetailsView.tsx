import { View, useWindowDimensions } from 'react-native';
import { imageSize, spacing } from '@shared/theme';
import { RemoteImage, Typography } from '@shared/ui';
import type { PostDetails } from '../model/types';

const HORIZONTAL_PADDING = spacing.lg * 2;

type PostDetailsViewProps = {
  details: PostDetails;
};

export const PostDetailsView = ({ details }: PostDetailsViewProps) => {
  const { width } = useWindowDimensions();
  const imageSide = Math.min(imageSize.details, width - HORIZONTAL_PADDING);

  return (
    <View className="gap-lg px-lg">
      <RemoteImage
        uri={details.imageUrl}
        width={imageSide}
        height={imageSide}
        className="self-center rounded-md"
      />
      <Typography variant="headline" asHeader>
        {details.title}
      </Typography>
      <Typography>{details.body}</Typography>
    </View>
  );
};
