/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-require-imports */
import type { ReactNode } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { Avatar } from '../../components/Avatar/Avatar';
import DeviceInfo from 'react-native-device-info';
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
  const { colors, preference, setPreference, radii, spacing, typography } = useAppTheme();
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
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('MyProfile')}
        style={({ pressed }) => [
          styles.profileCard,
          {
            backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <Avatar displayName={user?.displayName ?? 'You'} size={64} />
        <View style={styles.profileText}>
          <Text numberOfLines={1} style={[typography.title, { color: colors.text }]}>
            {user?.displayName ?? 'Your profile'}
          </Text>
          <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>
            {user?.username ? `@${user.username}` : (user?.email ?? 'View and edit your profile')}
          </Text>
        </View>
        <AppIcon type="icon" name="chevron-right" size={24} color={colors.textMuted} />
      </Pressable>

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

      <View style={styles.version}>
        <AppIcon
          type="image"
          source={require('../../../assets/logo.png')}
          size={28}
          style={{ borderRadius: radii.xs }}
        />
        <Text style={[typography.caption, { color: colors.textMuted }]}>আলাপ</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Version {DeviceInfo.getVersion()}
        </Text>
      </View>
    </Screen>
  );

  function SettingsSection({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }): React.JSX.Element {
    return (
      <View style={{ gap: spacing.sm }}>
        <Text
          style={[
            typography.caption,
            styles.sectionTitle,
            { color: colors.textMuted, paddingHorizontal: spacing.xs },
          ]}
        >
          {title.toUpperCase()}
        </Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg },
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  function SettingsRow({
    icon,
    title,
    subtitle,
    children,
    last = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    last?: boolean;
  }): React.JSX.Element {
    return (
      <View
        style={[
          styles.settingBlock,
          {
            borderBottomColor: colors.divider,
            borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
            padding: spacing.md,
          },
        ]}
      >
        <View style={styles.settingTop}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: colors.primarySoft, borderRadius: radii.md },
            ]}
          >
            <AppIcon type="icon" name={icon} size={21} color={colors.primary} />
          </View>
          <View style={styles.settingText}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
            ) : null}
          </View>
        </View>
        {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
      </View>
    );
  }

  function SettingsAction({
    icon,
    title,
    onPress,
    danger = false,
    loading = false,
    last = false,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    danger?: boolean;
    loading?: boolean;
    last?: boolean;
  }): React.JSX.Element {
    const tint = danger ? colors.danger : colors.text;
    return (
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={onPress}
        style={({ pressed }) => [
          styles.action,
          {
            borderBottomColor: colors.divider,
            borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
            opacity: pressed || loading ? 0.6 : 1,
            padding: spacing.md,
          },
        ]}
      >
        <AppIcon type="icon" name={loading ? 'loading' : icon} size={22} color={tint} />
        <Text style={[typography.bodyMedium, { color: tint, flex: 1 }]}>{title}</Text>
        <AppIcon type="icon" name="chevron-right" size={21} color={colors.textMuted} />
      </Pressable>
    );
  }

  function ChoicePills<T extends string>({
    options,
    selected,
    onSelect,
    disabled = false,
  }: {
    options: readonly T[];
    selected: T;
    onSelect: (value: T) => void;
    disabled?: boolean;
  }): React.JSX.Element {
    return (
      <View style={[styles.choices, { gap: spacing.sm }]}>
        {options.map((option) => {
          const active = option === selected;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled }}
              disabled={disabled}
              key={option}
              onPress={() => onSelect(option)}
              style={[
                styles.choice,
                {
                  backgroundColor: active ? colors.primarySoft : colors.surfaceElevated,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              {active ? (
                <AppIcon type="icon" name="check" size={15} color={colors.primary} />
              ) : null}
              <Text
                style={[
                  typography.caption,
                  { color: active ? colors.primary : colors.textSecondary },
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 14,
  },
  profileText: { flex: 1, gap: 3 },
  sectionTitle: { fontWeight: '800', letterSpacing: 0.8 },
  sectionCard: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  settingBlock: {},
  settingTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconBox: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  settingText: { flex: 1, gap: 2 },
  choices: { flexDirection: 'row', flexWrap: 'wrap' },
  choice: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    justifyContent: 'center',
  },
  action: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 58 },
  version: { alignItems: 'center', gap: 6, paddingBottom: 12 },
});
