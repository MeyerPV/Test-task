import { ActivityIndicator, View } from 'react-native';
import { colors } from '../../theme';
import { Typography } from '../Typography/Typography';

const BUSY_STATE = { busy: true } as const;

type LoaderProps = {
  label?: string;
};

export const Loader = ({ label = 'Loading' }: LoaderProps) => (
  <View
    accessible
    accessibilityRole="progressbar"
    accessibilityLabel={label}
    accessibilityState={BUSY_STATE}
    accessibilityLiveRegion="polite"
    className="flex-1 items-center justify-center gap-md bg-canvas p-xl"
  >
    <ActivityIndicator size="large" color={colors.primary} />
    <Typography tone="muted">{label}</Typography>
  </View>
);
