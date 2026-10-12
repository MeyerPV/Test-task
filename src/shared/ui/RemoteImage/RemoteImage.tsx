import { useMemo } from 'react';
import { Image } from 'react-native';
import { clsx } from 'clsx';

type RemoteImageProps = {
  uri: string;
  width: number;
  height: number;
  accessibilityLabel?: string;
  className?: string;
};

export const RemoteImage = ({
  uri,
  width,
  height,
  accessibilityLabel,
  className,
}: RemoteImageProps) => {
  const source = useMemo(() => ({ uri, width, height }), [uri, width, height]);
  const sizeStyle = useMemo(() => ({ width, height }), [width, height]);
  const isDecorative = accessibilityLabel === undefined;

  return (
    <Image
      source={source}
      resizeMode="cover"
      style={sizeStyle}
      className={clsx('bg-surface-pressed', className)}
      accessible={!isDecorative}
      accessibilityRole={isDecorative ? 'none' : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
    />
  );
};
