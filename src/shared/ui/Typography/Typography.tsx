import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { clsx } from 'clsx';

export type TypographyVariant =
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption';

export type TypographyTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'on-primary'
  | 'accent'
  | 'on-accent'
  | 'danger';

const VARIANT_CLASS_NAMES = {
  headline: 'text-headline font-bold',
  title: 'text-title font-semibold',
  subtitle: 'text-subtitle font-semibold',
  body: 'text-body',
  caption: 'text-caption font-medium',
} as const satisfies Record<TypographyVariant, string>;

const TONE_CLASS_NAMES = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  primary: 'text-primary',
  'on-primary': 'text-on-primary',
  accent: 'text-accent',
  'on-accent': 'text-on-accent',
  danger: 'text-danger',
} as const satisfies Record<TypographyTone, string>;

type TypographyProps = {
  children: ReactNode;
  variant?: TypographyVariant;
  tone?: TypographyTone;
  asHeader?: boolean;
  numberOfLines?: number;
  className?: string;
};

export const Typography = ({
  children,
  variant = 'body',
  tone = 'default',
  asHeader = false,
  numberOfLines,
  className,
}: TypographyProps) => (
  <Text
    accessibilityRole={asHeader ? 'header' : 'text'}
    numberOfLines={numberOfLines}
    className={clsx(
      VARIANT_CLASS_NAMES[variant],
      TONE_CLASS_NAMES[tone],
      className,
    )}
  >
    {children}
  </Text>
);
