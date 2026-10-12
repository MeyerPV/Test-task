import type { ReactNode } from 'react';
import { View } from 'react-native';
import { clsx } from 'clsx';
import { Typography } from '../Typography/Typography';
import type { TypographyTone } from '../Typography/Typography';

export type BadgeTone = 'accent' | 'primary';

const CONTAINER_CLASS_NAMES = {
  accent: 'bg-accent',
  primary: 'bg-primary',
} as const satisfies Record<BadgeTone, string>;

const LABEL_TONES = {
  accent: 'on-accent',
  primary: 'on-primary',
} as const satisfies Record<BadgeTone, TypographyTone>;

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: ReactNode;
};

export const Badge = ({ label, tone = 'accent', icon }: BadgeProps) => (
  <View
    className={clsx(
      'flex-row items-center gap-xxs self-start rounded-full px-sm py-xxs',
      CONTAINER_CLASS_NAMES[tone],
    )}
  >
    {icon}
    <Typography variant="caption" tone={LABEL_TONES[tone]}>
      {label}
    </Typography>
  </View>
);
