import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native';
import { ConversationListScreen } from '../screens/ConversationListScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { UserSearchScreen } from '../screens/UserSearchScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAppSelector } from '../store/hooks';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
export function RootNavigator(): React.JSX.Element {
  const status = useAppSelector((state) => state.session.status);
  if (status === 'restoring') return <ActivityIndicator accessibilityLabel="Restoring session" />;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        <Stack.Group>
          <Stack.Screen name="ConversationList" component={ConversationListScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="UserSearch" component={UserSearchScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
