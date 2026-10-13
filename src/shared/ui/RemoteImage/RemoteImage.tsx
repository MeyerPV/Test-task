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
  const isDecorative = accessibilityLabel === undefined;

  return (
    <Image
      source={{ uri, width, height }}
      resizeMode="cover"
      className={clsx('bg-surface-pressed', className)}
      accessible={!isDecorative}
      accessibilityRole={isDecorative ? 'none' : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={isDecorative}
      importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
    />
  );
};
