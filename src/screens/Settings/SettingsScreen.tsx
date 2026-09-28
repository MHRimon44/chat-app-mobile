import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { AppBrand } from '../../components/AppBrand/AppBrand';
import { ChoicePills } from '../../components/Settings/ChoicePills';
import { ProfileSettingsCard } from '../../components/Settings/ProfileSettingsCard';
import { SettingsAction } from '../../components/Settings/SettingsAction';
import { SettingsRow } from '../../components/Settings/SettingsRow';
import { SettingsSection } from '../../components/Settings/SettingsSection';
import { Screen } from '../../components/Screen/Screen';
import type { RootStackParamList } from '../../navigation/types';
import { useLogoutAllMutation, useLogoutMutation } from '../../services/api/authApi';
import { clearSession } from '../../services/auth/refreshCoordinator';
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  type PresenceVisibility,
} from '../../services/api/profileApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useAppTheme, type ThemePreference } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const sessionUser = useAppSelector((state) => state.session.user);
  const profile = useGetMyProfileQuery();
  const [updateProfile, update] = useUpdateMyProfileMutation();
  const [logout, logoutState] = useLogoutMutation();
  const [logoutAll, logoutAllState] = useLogoutAllMutation();
  const { preference, setPreference, spacing } = useAppTheme();
  const user = profile.data ?? sessionUser;

  const changePresence = async (value: PresenceVisibility): Promise<void> => {
    try {
      await updateProfile({ presenceVisibility: value }).unwrap();
    } catch {
      Alert.alert('Could not update privacy', 'Please try again.');
    }
  };

  const signOut = async (allDevices: boolean): Promise<void> => {
    try {
      if (allDevices) await logoutAll().unwrap();
      else await logout().unwrap();
    } catch {
      // Local credentials are still cleared below.
    } finally {
      await clearSession(dispatch);
    }
  };

  const confirmLogoutAll = (): void => {
    Alert.alert(
      'Log out everywhere?',
      'You will be signed out from every device using this account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => void signOut(true) },
      ],
    );
  };

  return (
    <Screen
      mode="scroll"
      header={{ title: 'Settings', showBack: true }}
      contentStyle={{ gap: spacing.xl, paddingTop: spacing.md }}
      keyboardAvoiding={false}
    >
      <ProfileSettingsCard
        displayName={user?.displayName ?? 'Your profile'}
        username={user?.username}
        email={user?.email}
        onPress={() => navigation.navigate('MyProfile')}
      />

      <SettingsSection title="Appearance">
        <SettingsRow icon="theme-light-dark" title="Theme" subtitle="Choose how Alap looks" last>
          <ChoicePills<ThemePreference>
            options={['system', 'light', 'dark']}
            selected={preference}
            onSelect={(value) => void setPreference(value)}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Privacy">
        <SettingsRow
          icon="eye-outline"
          title="Online status"
          subtitle="Who can see when you're online"
          last
        >
          <ChoicePills<PresenceVisibility>
            options={['everyone', 'contacts', 'nobody']}
            selected={profile.data?.presenceVisibility ?? 'everyone'}
            disabled={update.isLoading}
            onSelect={(value) => void changePresence(value)}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsAction
          icon="logout"
          title="Log out"
          onPress={() => void signOut(false)}
          loading={logoutState.isLoading}
        />
        <SettingsAction
          icon="logout-variant"
          title="Log out on all devices"
          danger
          onPress={confirmLogoutAll}
          loading={logoutAllState.isLoading}
          last
        />
      </SettingsSection>

      <AppBrand size={28} showVersion horizontal={false} />
    </Screen>
  );
}
