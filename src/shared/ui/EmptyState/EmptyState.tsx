import { View } from 'react-native';
import { Typography } from '../Typography/Typography';

type EmptyStateProps = {
  title: string;
  message?: string;
};

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <View
    accessible
    accessibilityRole="summary"
    className="flex-1 items-center justify-center gap-sm bg-canvas p-xl"
  >
    <Typography variant="title" className="text-center">
      {title}
    </Typography>
    {message ? (
      <Typography tone="muted" className="text-center">
        {message}
      </Typography>
    ) : null}
  </View>
);
