import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { Avatar } from '../../components/Avatar/Avatar';
import { PrimaryButton } from '../../components/Button/Button';
import { Screen } from '../../components/Screen/Screen';
import type { RootStackParamList } from '../../navigation/types';
import { useCreateDirectConversationMutation, useGetUserQuery } from '../../services/api/chatApi';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export function UserProfileScreen({ navigation, route }: Props): React.JSX.Element {
  const profile = useGetUserQuery(route.params.userId);
  const [create, creation] = useCreateDirectConversationMutation();
  const { colors, radii, spacing, typography } = useAppTheme();

  const start = async (): Promise<void> => {
    if (!profile.data) return;
    try {
      const conversation = await create(profile.data.id).unwrap();
      navigation.replace('Chat', {
        conversationId: conversation.id,
        counterpartId: profile.data.id,
        title: profile.data.displayName,
      });
    } catch {
      // Mutation state renders a safe retryable error.
    }
  };

  return (
    <Screen
      mode="auto"
      header={{ title: 'Profile', showBack: true }}
      contentStyle={{ paddingTop: spacing.xl }}
    >
      {profile.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator accessibilityLabel="Loading profile" color={colors.primary} />
        </View>
      ) : profile.data === undefined ? (
        <View style={styles.center}>
          <AppIcon type="icon" name="account-alert-outline" size={42} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textMuted }]}>
            This profile could not be loaded.
          </Text>
        </View>
      ) : (
        <View style={[styles.content, { gap: spacing.lg }]}>
          <Avatar displayName={profile.data.displayName} size={96} />
          <View style={styles.identity}>
            <Text
              accessibilityRole="header"
              style={[typography.heading, { color: colors.text, textAlign: 'center' }]}
            >
              {profile.data.displayName}
            </Text>
            {profile.data.username ? (
              <Text style={[typography.body, { color: colors.primary }]}>
                @{profile.data.username}
              </Text>
            ) : null}
          </View>
          {profile.data.bio ? (
            <View
              style={[
                styles.bioCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                },
              ]}
            >
              <AppIcon type="icon" name="format-quote-open" size={22} color={colors.primary} />
              <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
                {profile.data.bio}
              </Text>
            </View>
          ) : null}
          <View style={styles.buttonWrap}>
            <PrimaryButton
              label="Start chat"
              loading={creation.isLoading}
              onPress={() => void start()}
            />
          </View>
          {creation.isError ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[typography.caption, { color: colors.danger }]}
            >
              Could not start the conversation.
            </Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center' },
  content: { alignItems: 'center', flex: 1 },
  identity: { alignItems: 'center', gap: 4 },
  bioCard: {
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  buttonWrap: { width: '100%' },
});
