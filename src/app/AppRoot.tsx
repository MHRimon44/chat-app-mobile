import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { assertSecureProductionTransport, environment } from '../config/environment';
import { RootNavigator } from '../navigation/RootNavigator';
import { appStore } from '../store/store';
import { bootstrapSession } from '../services/auth/refreshCoordinator';
import { AppThemeProvider, useAppTheme } from '../theme/ThemeProvider';
import { NetworkIndicator } from '../components/NetworkIndicator/NetworkIndicator';
import { ToastProvider } from '../components/Toast/ToastProvider';
assertSecureProductionTransport(environment.apiBaseUrl);
assertSecureProductionTransport(environment.socketBaseUrl);
export function AppRoot(): React.JSX.Element {
  useEffect(() => {
    void bootstrapSession(appStore.dispatch);
  }, []);
  return (
    <Provider store={appStore}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <ToastProvider>
            <ThemedNavigation />
            <NetworkIndicator />
          </ToastProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

function ThemedNavigation(): React.JSX.Element {
  const { navigationTheme } = useAppTheme();
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
