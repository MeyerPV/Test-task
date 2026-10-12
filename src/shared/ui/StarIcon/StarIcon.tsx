import { Text } from 'react-native';
import { clsx } from 'clsx';

export type IconSize = 'sm' | 'md' | 'lg';

export type IconTone = 'primary' | 'on-primary' | 'accent' | 'on-accent';

const SIZE_CLASS_NAMES = {
  sm: 'text-icon-sm',
  md: 'text-icon-md',
  lg: 'text-icon-lg',
} as const satisfies Record<IconSize, string>;

const TONE_CLASS_NAMES = {
  primary: 'text-primary',
  'on-primary': 'text-on-primary',
  accent: 'text-accent',
  'on-accent': 'text-on-accent',
} as const satisfies Record<IconTone, string>;

const FILLED_STAR = '\u2605';
const OUTLINED_STAR = '\u2606';

type StarIconProps = {
  isFilled?: boolean;
  size?: IconSize;
  tone?: IconTone;
};

export const StarIcon = ({
  isFilled = false,
  size = 'md',
  tone = 'primary',
}: StarIconProps) => (
  <Text
    accessible={false}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    allowFontScaling={false}
    className={clsx(SIZE_CLASS_NAMES[size], TONE_CLASS_NAMES[tone])}
  >
    {isFilled ? FILLED_STAR : OUTLINED_STAR}
  </Text>
);
