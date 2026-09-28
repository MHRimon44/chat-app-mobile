/* eslint-disable no-empty-pattern */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { Avatar } from '../../components/Avatar/Avatar';
import { PrimaryButton } from '../../components/Button/Button';
import { FormField } from '../../components/FormField/FormField';
import { Screen } from '../../components/Screen/Screen';
import { useToast } from '../../components/Toast/ToastProvider';
import type { RootStackParamList } from '../../navigation/types';
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from '../../services/api/profileApi';
import { useAppDispatch } from '../../store/hooks';
import { profileUpdated } from '../../store/slices/sessionSlice';
import { useAppTheme } from '../../theme/ThemeProvider';
import { authErrorMessage } from '../../utils/errorMessage';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

export function MyProfileScreen({}: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const profile = useGetMyProfileQuery();
  const [updateProfile, update] = useUpdateMyProfileMutation();
  const { colors, radii, spacing, typography } = useAppTheme();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!profile.data) return;
    setUsername(profile.data.username ?? '');
    setDisplayName(profile.data.displayName);
    setBio(profile.data.bio ?? '');
  }, [profile.data]);

  const save = async (): Promise<void> => {
    try {
      const result = await updateProfile({ username, displayName, bio }).unwrap();
      dispatch(
        profileUpdated({
          id: result.id,
          ...(result.username ? { username: result.username } : {}),
          displayName: result.displayName,
          email: result.email,
        }),
      );
      showToast({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved.' });
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: authErrorMessage(error) });
    }
  };

  return (
    <Screen
      mode="auto"
      header={{ title: 'Profile', showBack: true }}
      contentStyle={{ gap: spacing.lg, paddingTop: spacing.md }}
    >
      {profile.isLoading && profile.data === undefined ? (
        <View style={styles.center}>
          <ActivityIndicator accessibilityLabel="Loading profile" color={colors.primary} />
        </View>
      ) : profile.data === undefined ? (
        <View style={styles.center}>
          <AppIcon type="icon" name="account-alert-outline" size={40} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Could not load your profile.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.identity}>
            <View style={styles.avatarWrap}>
              <Avatar displayName={profile.data.displayName} size={88} />
              <View
                style={[
                  styles.editBadge,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.background,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <AppIcon type="icon" name="pencil-outline" size={16} color={colors.onPrimary} />
              </View>
            </View>
            <Text style={[typography.heading, { color: colors.text }]}>
              {profile.data.displayName}
            </Text>
            {profile.data.username ? (
              <Text style={[typography.body, { color: colors.textMuted }]}>
                @{profile.data.username}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radii.lg,
                gap: spacing.md,
                padding: spacing.lg,
              },
            ]}
          >
            <FormField
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
            <FormField
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              3–30 letters, numbers, or underscores.
            </Text>
            <FormField label="Bio" value={bio} onChangeText={setBio} multiline maxLength={160} />

            <View
              style={[
                styles.readOnlyRow,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radii.md,
                  padding: spacing.md,
                },
              ]}
            >
              <AppIcon type="icon" name="email-outline" size={21} color={colors.textMuted} />
              <View style={styles.readOnlyText}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Email</Text>
                <Text style={[typography.body, { color: colors.text }]}>{profile.data.email}</Text>
              </View>
              <AppIcon type="icon" name="lock-outline" size={18} color={colors.textMuted} />
            </View>
          </View>

          <PrimaryButton
            label="Save changes"
            loading={update.isLoading}
            onPress={() => void save()}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center' },
  identity: { alignItems: 'center' },
  avatarWrap: { marginBottom: 12, position: 'relative' },
  editBadge: {
    alignItems: 'center',
    borderWidth: 3,
    bottom: -2,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 30,
  },
  card: { borderWidth: StyleSheet.hairlineWidth },
  readOnlyRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  readOnlyText: { flex: 1 },
});
