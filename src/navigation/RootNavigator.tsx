import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native';
import { ConversationListScreen } from '../screens/Conversations/ConversationListScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPassword/ForgotPasswordScreen';
import { LoginScreen } from '../screens/Auth/Login/LoginScreen';
import { RegisterScreen } from '../screens/Auth/Register/RegisterScreen';
import { ResetPasswordScreen } from '../screens/Auth/ResetPassword/ResetPasswordScreen';
import { VerifyRegistrationScreen } from '../screens/Auth/VerifyRegistration/VerifyRegistrationScreen';
import { VerifyResetOtpScreen } from '../screens/Auth/VerifyResetOtp/VerifyResetOtpScreen';
import { UserProfileScreen } from '../screens/Profile/UserProfileScreen';
import { MyProfileScreen } from '../screens/Profile/MyProfileScreen';
import { UserSearchScreen } from '../screens/Search/UserSearchScreen';
import { WelcomeScreen } from '../screens/Welcome/WelcomeScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
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
          <Stack.Screen name="MyProfile" component={MyProfileScreen} />
          <Stack.Screen name="UserSearch" component={UserSearchScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VerifyRegistration" component={VerifyRegistrationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyResetOtp" component={VerifyResetOtpScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
