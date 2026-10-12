import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { clsx } from 'clsx';
import { Typography } from '../Typography/Typography';
import type { TypographyTone } from '../Typography/Typography';

export type ButtonVariant = 'primary' | 'outline';

const CONTAINER_CLASS_NAMES = {
  primary: 'border-primary bg-primary active:bg-primary-pressed',
  outline: 'border-primary bg-surface active:bg-surface-pressed',
} as const satisfies Record<ButtonVariant, string>;

const LABEL_TONES = {
  primary: 'on-primary',
  outline: 'primary',
} as const satisfies Record<ButtonVariant, TypographyTone>;

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  isSelected?: boolean;
  isDisabled?: boolean;
  accessibilityHint?: string;
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  isSelected = false,
  isDisabled = false,
  accessibilityHint,
}: ButtonProps) => {
  const accessibilityState = useMemo(
    () => ({ selected: isSelected, disabled: isDisabled }),
    [isSelected, isDisabled],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      disabled={isDisabled}
      onPress={onPress}
      className={clsx(
        'min-h-touch min-w-touch flex-row items-center justify-center gap-sm rounded-md border-strong px-lg py-sm',
        CONTAINER_CLASS_NAMES[variant],
        isDisabled && 'opacity-disabled',
      )}
    >
      {icon}
      <Typography variant="subtitle" tone={LABEL_TONES[variant]}>
        {label}
      </Typography>
    </Pressable>
  );
};
