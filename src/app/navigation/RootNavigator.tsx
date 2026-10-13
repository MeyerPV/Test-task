import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DetailsScreen } from '@pages/post-details';
import { PostsScreen } from '@pages/posts';
import type { RootStackParamList } from '@shared/config';
import { colors } from '@shared/theme';

const NAVIGATION_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.canvas,
    card: colors.surface,
    text: colors.ink,
    border: colors.outline,
    notification: colors.accent,
  },
};

const SCREEN_OPTIONS: NativeStackNavigationOptions = {
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.ink },
};

const POSTS_OPTIONS: NativeStackNavigationOptions = { title: 'PostsScreen' };

const DETAILS_OPTIONS: NativeStackNavigationOptions = {
  title: 'DetailsScreen',
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <NavigationContainer theme={NAVIGATION_THEME}>
    <Stack.Navigator initialRouteName="Posts" screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="Posts"
        component={PostsScreen}
        options={POSTS_OPTIONS}
      />
      <Stack.Screen
        name="DetailsScreen"
        component={DetailsScreen}
        options={DETAILS_OPTIONS}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
