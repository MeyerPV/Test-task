const {
  borderWidth,
  colors,
  iconSize,
  opacity,
  radius,
  spacing,
  touchTarget,
  typography,
} = require('./src/shared/theme/tokens');

const toPx = value => `${value}px`;

const mapEntries = (record, mapEntry) =>
  Object.fromEntries(Object.entries(record).map(mapEntry));

const toFontSize = ({ fontSize, lineHeight }) => [
  toPx(fontSize),
  { lineHeight: toPx(lineHeight) },
];

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    colors,
    spacing: mapEntries(spacing, ([key, value]) => [key, toPx(value)]),
    borderRadius: mapEntries(radius, ([key, value]) => [key, toPx(value)]),
    borderWidth: mapEntries(borderWidth, ([key, value]) => [key, toPx(value)]),
    opacity: mapEntries(opacity, ([key, value]) => [key, String(value)]),
    fontSize: {
      ...mapEntries(typography, ([key, value]) => [key, toFontSize(value)]),
      ...mapEntries(iconSize, ([key, value]) => [
        `icon-${key}`,
        toFontSize({ fontSize: value, lineHeight: value }),
      ]),
    },
    extend: {
      minHeight: { touch: toPx(touchTarget.min) },
      minWidth: { touch: toPx(touchTarget.min) },
    },
  },
  plugins: [],
};
