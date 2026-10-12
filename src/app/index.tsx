import '../../global.css';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation';
import { StoreProvider } from './state';

export const App = () => (
  <SafeAreaProvider>
    <StatusBar />
    <StoreProvider>
      <RootNavigator />
    </StoreProvider>
  </SafeAreaProvider>
);
