import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenEdge = 'top' | 'right' | 'bottom' | 'left';

const HORIZONTAL_EDGES: readonly ScreenEdge[] = ['left', 'right'];

type ScreenProps = {
  children: ReactNode;
  edges?: readonly ScreenEdge[];
};

export const Screen = ({ children, edges = HORIZONTAL_EDGES }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const insetStyle = useMemo(
    () => ({
      paddingTop: edges.includes('top') ? insets.top : 0,
      paddingRight: edges.includes('right') ? insets.right : 0,
      paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: edges.includes('left') ? insets.left : 0,
    }),
    [edges, insets.top, insets.right, insets.bottom, insets.left],
  );

  return (
    <View className="flex-1 bg-canvas" style={insetStyle}>
      {children}
    </View>
  );
};
