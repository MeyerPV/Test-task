import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { clsx } from 'clsx';
import { colors } from '../../theme';

type CardTone = 'default' | 'highlighted';

const TONE_CLASS_NAMES = {
  default: 'border-outline bg-surface',
  highlighted: 'border-favorite-outline bg-favorite',
} as const satisfies Record<CardTone, string>;

const ANDROID_RIPPLE = { color: colors.ripple, foreground: true } as const;

type CardProps = {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  isHighlighted?: boolean;
};

export const Card = ({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  isHighlighted = false,
}: CardProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
    android_ripple={ANDROID_RIPPLE}
    onPress={onPress}
    className={clsx(
      'min-h-touch overflow-hidden rounded-md border p-lg active:opacity-pressed',
      TONE_CLASS_NAMES[isHighlighted ? 'highlighted' : 'default'],
    )}
  >
    {children}
  </Pressable>
);
