type TextStyleToken = {
  fontSize: number;
  lineHeight: number;
};

export const colors = {
  transparent: 'transparent',
  canvas: '#F4F5F9',
  surface: '#FFFFFF',
  'surface-pressed': '#E9ECF5',
  outline: '#D9DEE8',
  ink: '#141A2B',
  'ink-muted': '#5B6478',
  primary: '#4338CA',
  'primary-pressed': '#3730A3',
  'on-primary': '#FFFFFF',
  favorite: '#FFF6DB',
  'favorite-outline': '#E3A008',
  accent: '#B45309',
  'on-accent': '#FFFFFF',
  danger: '#B91C1C',
  ripple: 'rgba(67, 56, 202, 0.16)',
} as const satisfies Record<string, string>;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const satisfies Record<string, number>;

export const radius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 16,
  full: 9999,
} as const satisfies Record<string, number>;

export const borderWidth = {
  DEFAULT: 1,
  strong: 2,
} as const satisfies Record<string, number>;

export const opacity = {
  disabled: 0.45,
  pressed: 0.85,
  full: 1,
} as const satisfies Record<string, number>;

export const touchTarget = {
  min: 44,
} as const satisfies Record<'min', number>;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const satisfies Record<string, number>;

export const imageSize = {
  thumbnail: 32,
  details: 300,
} as const satisfies Record<string, number>;

export const typography = {
  caption: { fontSize: 13, lineHeight: 18 },
  body: { fontSize: 15, lineHeight: 22 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  title: { fontSize: 20, lineHeight: 26 },
  headline: { fontSize: 24, lineHeight: 30 },
} as const satisfies Record<string, TextStyleToken>;

export const tokens = {
  colors,
  spacing,
  radius,
  borderWidth,
  opacity,
  touchTarget,
  iconSize,
  imageSize,
  typography,
} as const;
