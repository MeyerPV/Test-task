import { useEffect } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { Button } from '../Button/Button';
import { Typography } from '../Typography/Typography';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  title?: string;
  retryLabel?: string;
  retryHint?: string;
};

export const ErrorState = ({
  message,
  onRetry,
  title = 'Something went wrong',
  retryLabel = 'Retry',
  retryHint = 'Sends the request again',
}: ErrorStateProps) => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(`${title}. ${message}`);
    }
  }, [title, message]);

  return (
    <View className="flex-1 items-center justify-center gap-xl bg-canvas p-xl">
      <View
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        className="items-center gap-sm"
      >
        <Typography variant="title" className="text-center">
          {title}
        </Typography>
        <Typography tone="muted" className="text-center">
          {message}
        </Typography>
      </View>
      <Button
        label={retryLabel}
        accessibilityHint={retryHint}
        onPress={onRetry}
      />
    </View>
  );
};
