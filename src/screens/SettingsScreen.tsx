import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLogoutAllMutation, useLogoutMutation } from '../auth/authApi';
import { authErrorMessage } from '../auth/errorMessage';
import { clearSession } from '../auth/refreshCoordinator';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  type PresenceVisibility,
} from '../profile/profileApi';
import { useAppDispatch } from '../store/hooks';
import { profileUpdated } from '../store/sessionSlice';
import { useAppTheme, type ThemePreference } from '../theme/ThemeProvider';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;
const themeOptions: readonly ThemePreference[] = ['system', 'light', 'dark'];
const visibilityOptions: readonly PresenceVisibility[] = ['everyone', 'contacts', 'nobody'];

export function SettingsScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const profile = useGetMyProfileQuery();
  const [updateProfile, update] = useUpdateMyProfileMutation();
  const [logout] = useLogoutMutation();
  const [logoutAll] = useLogoutAllMutation();
  const { preference, setPreference } = useAppTheme();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState<PresenceVisibility>('everyone');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile.data) return;
    setUsername(profile.data.username ?? '');
    setDisplayName(profile.data.displayName);
    setBio(profile.data.bio ?? '');
    setVisibility(profile.data.presenceVisibility);
  }, [profile.data]);

  const save = async (): Promise<void> => {
    setSaved(false);
    try {
      const result = await updateProfile({
        username,
        displayName,
        bio,
        presenceVisibility: visibility,
      }).unwrap();
      dispatch(
        profileUpdated({
          id: result.id,
          ...(result.username ? { username: result.username } : {}),
          displayName: result.displayName,
          email: result.email,
        }),
      );
      setSaved(true);
    } catch {
      // The safe API error is rendered below.
    }
  };

  const signOut = async (allDevices: boolean): Promise<void> => {
    try {
      if (allDevices) await logoutAll().unwrap();
      else await logout().unwrap();
    } catch {
      // Always clear local credentials, even if transport fails.
    } finally {
      await clearSession(dispatch);
    }
  };

  if (profile.isLoading) {
    return <ActivityIndicator accessibilityLabel="Loading profile" style={styles.loader} />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Back</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>
            Profile & settings
          </Text>
        </View>

        <Text style={styles.section}>Profile</Text>
        <FormField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          3–30 letters, numbers, or underscores. People find you using this.
        </Text>
        <FormField
          label="Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
        <FormField label="Bio" value={bio} onChangeText={setBio} multiline maxLength={160} />
        <Text style={styles.readOnly}>Email: {profile.data?.email}</Text>

        <Text style={styles.section}>Who can see when you are online?</Text>
        <ChoiceRow options={visibilityOptions} selected={visibility} onSelect={setVisibility} />

        <Text style={styles.section}>Theme</Text>
        <ChoiceRow
          options={themeOptions}
          selected={preference}
          onSelect={(value) => void setPreference(value)}
        />

        {update.error ? <Text style={styles.error}>{authErrorMessage(update.error)}</Text> : null}
        {saved ? <Text style={styles.success}>Profile saved.</Text> : null}
        <PrimaryButton
          label="Save changes"
          loading={update.isLoading}
          onPress={() => void save()}
        />

        <Text style={styles.section}>Account</Text>
        <Pressable style={styles.secondaryButton} onPress={() => void signOut(false)}>
          <Text style={styles.secondaryLabel}>Log out on this device</Text>
        </Pressable>
        <Pressable style={styles.dangerButton} onPress={() => void signOut(true)}>
          <Text style={styles.dangerLabel}>Log out on all devices</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function ChoiceRow<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
}): React.JSX.Element {
  return (
    <View style={styles.choices}>
      {options.map((option) => (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: option === selected }}
          key={option}
          onPress={() => onSelect(option)}
          style={[styles.choice, option === selected ? styles.choiceSelected : null]}
        >
          <Text
            style={[styles.choiceLabel, option === selected ? styles.choiceLabelSelected : null]}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1 },
  content: { gap: spacing.md, paddingBottom: spacing.xl },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md },
  title: { ...typography.heading, color: colors.text, flex: 1 },
  link: { color: colors.primary, fontWeight: '700', paddingVertical: spacing.sm },
  section: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  hint: { color: colors.textMuted, fontSize: 13 },
  readOnly: { color: colors.textMuted },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: {
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceLabel: { color: colors.text },
  choiceLabelSelected: { color: colors.surface, fontWeight: '700' },
  error: { color: colors.danger },
  success: { color: colors.success },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  secondaryLabel: { color: colors.text, fontWeight: '700' },
  dangerButton: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  dangerLabel: { color: colors.danger, fontWeight: '700' },
});
