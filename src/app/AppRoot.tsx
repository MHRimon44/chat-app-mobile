import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { assertSecureProductionTransport, environment } from '../config/environment';
import { RootNavigator } from '../navigation/RootNavigator';
import { appStore } from '../store/store';
import { bootstrapSession } from '../auth/refreshCoordinator';
assertSecureProductionTransport(environment.apiBaseUrl);
assertSecureProductionTransport(environment.socketBaseUrl);
export function AppRoot(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  useEffect(() => {
    void bootstrapSession(appStore.dispatch);
  }, []);
  return (
    <Provider store={appStore}>
      <SafeAreaProvider>
        <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
