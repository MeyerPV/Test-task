import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavoriteToggleButton } from '@features/toggle-favorite';
import { PostDetailsView } from '@entities/post';
import type { RootStackParamList } from '@shared/config';
import { spacing } from '@shared/theme';
import { ErrorState, Loader, Screen } from '@shared/ui';
import { usePostDetails } from '../model/usePostDetails';

type DetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DetailsScreen'
>;

export const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { postId } = route.params;
  const { details, request, retry } = usePostDetails(postId);
  const insets = useSafeAreaInsets();
  const contentInsetStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + spacing.xl }),
    [insets.bottom],
  );

  if (!details) {
    return (
      <Screen>
        {request.status === 'failed' ? (
          <ErrorState
            title="Post could not be loaded"
            message={request.error}
            onRetry={retry}
          />
        ) : (
          <Loader label="Loading post" />
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-xl pt-lg"
        contentContainerStyle={contentInsetStyle}
      >
        <PostDetailsView details={details} />
        <View className="px-lg">
          <FavoriteToggleButton postId={postId} />
        </View>
      </ScrollView>
    </Screen>
  );
};
